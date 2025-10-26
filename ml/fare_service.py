import os
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import lru_cache

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Create output directory for exports
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'output')

# GTFS data directory
GTFS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dataset', 'gtfs')

print("Loading GTFS data...")

@lru_cache(maxsize=1)
def load_gtfs_data():
    """Load and cache GTFS data"""
    try:
        # Check if GTFS directory exists
        if not os.path.exists(GTFS_DIR):
            print(f"GTFS directory not found: {GTFS_DIR}")
            return None
            
        # Load fare attributes
        fare_attr_path = os.path.join(GTFS_DIR, 'fare_attributes.txt')
        if not os.path.exists(fare_attr_path):
            print(f"Fare attributes file not found: {fare_attr_path}")
            return None
        fare_attr_df = pd.read_csv(fare_attr_path)
        
        # Load fare rules
        fare_rules_path = os.path.join(GTFS_DIR, 'fare_rules.txt')
        if not os.path.exists(fare_rules_path):
            print(f"Fare rules file not found: {fare_rules_path}")
            return None
        fare_rules_df = pd.read_csv(fare_rules_path)
        
        # Convert IDs to strings for consistent comparison
        if 'origin_id' in fare_rules_df.columns:
            fare_rules_df['origin_id'] = fare_rules_df['origin_id'].astype(str)
        if 'destination_id' in fare_rules_df.columns:
            fare_rules_df['destination_id'] = fare_rules_df['destination_id'].astype(str)
        
        # Load stops
        stops_path = os.path.join(GTFS_DIR, 'stops.txt')
        if not os.path.exists(stops_path):
            print(f"Stops file not found: {stops_path}")
            return None
        stops_df = pd.read_csv(stops_path)
        
        # Convert stop_id to string
        if 'stop_id' in stops_df.columns:
            stops_df['stop_id'] = stops_df['stop_id'].astype(str)
        
        # Load routes
        routes_path = os.path.join(GTFS_DIR, 'routes.txt')
        if not os.path.exists(routes_path):
            print(f"Routes file not found: {routes_path}")
            return None
        routes_df = pd.read_csv(routes_path)
        
        # Load shapes
        shapes_path = os.path.join(GTFS_DIR, 'shapes.txt')
        shapes_df = None
        if os.path.exists(shapes_path):
            shapes_df = pd.read_csv(shapes_path)
            print(f"Loaded {len(shapes_df)} shape points")
        
        print("GTFS data loaded successfully")
        print(f"Loaded {len(fare_attr_df)} fare attributes")
        print(f"Loaded {len(fare_rules_df)} fare rules")
        print(f"Loaded {len(stops_df)} stops")
        print(f"Loaded {len(routes_df)} routes")
        
        return {
            'fare_attributes': fare_attr_df,
            'fare_rules': fare_rules_df,
            'stops': stops_df,
            'routes': routes_df,
            'shapes': shapes_df
        }
    except Exception as e:
        print(f"Error loading GTFS data: {e}")
        return None

def get_route_shapes(shapes_df, route_short_name):
    """Get shape data for a route"""
    if shapes_df is None or route_short_name is None:
        return []
    
    try:
        # Filter shapes by route short name (shape_id contains route short name)
        matching_shapes = shapes_df[shapes_df['shape_id'].str.contains(str(route_short_name), na=False)]
        
        if matching_shapes.empty:
            return []
        
        # Group by shape_id and sort by sequence
        shape_groups = matching_shapes.groupby('shape_id')
        
        # Use the first shape (most common one)
        first_shape = shape_groups.get_group(matching_shapes['shape_id'].iloc[0])
        sorted_shape = first_shape.sort_values('shape_pt_sequence')
        
        # Convert to the format expected by frontend
        return [
            {
                'shapePtLat': float(row['shape_pt_lat']),
                'shapePtLon': float(row['shape_pt_lon']),
                'shapePtSequence': int(row['shape_pt_sequence'])
            }
            for _, row in sorted_shape.iterrows()
        ]
    except Exception as e:
        print(f"Error getting route shapes: {e}")
        return []

def find_stop_by_name(stops_df, name):
    """Find a stop by name"""
    if not name or not isinstance(name, str):
        return None
    
    # Clean input
    name = name.strip().lower()
    if not name:
        return None
    
    # First try exact match
    exact_match = stops_df[stops_df['stop_name'].str.lower() == name]
    if not exact_match.empty:
        return exact_match.iloc[0].to_dict()
    
    # Try with parenthetical variations
    if '(' in name:
        base_name = name.split('(')[0].strip()
        parenthetical_matches = stops_df[stops_df['stop_name'].str.lower().str.startswith(base_name)]
        if not parenthetical_matches.empty:
            return parenthetical_matches.iloc[0].to_dict()
    
    # Try starts with
    starts_with_matches = stops_df[stops_df['stop_name'].str.lower().str.startswith(name)]
    if not starts_with_matches.empty:
        return starts_with_matches.iloc[0].to_dict()
    
    # Try contains
    contains_matches = stops_df[stops_df['stop_name'].str.lower().str.contains(name)]
    if not contains_matches.empty:
        return contains_matches.iloc[0].to_dict()
    
    return None

def calculate_fare(origin_id, destination_id, route_id=None):
    """Calculate fare between two stops based on GTFS data"""
    data = load_gtfs_data()
    if data is None:
        return None
    
    fare_rules_df = data['fare_rules']
    fare_attr_df = data['fare_attributes']
    
    # Convert to strings for consistent comparison
    origin_id = str(origin_id)
    destination_id = str(destination_id)
    
    # Find matching fare rules
    matching_rules = fare_rules_df[
        (fare_rules_df['origin_id'] == origin_id) &
        (fare_rules_df['destination_id'] == destination_id)
    ]
    
    # If no direct match, try reverse direction
    if matching_rules.empty:
        matching_rules = fare_rules_df[
            (fare_rules_df['origin_id'] == destination_id) &
            (fare_rules_df['destination_id'] == origin_id)
        ]
    
    # If route_id is provided, filter by it
    if route_id and not matching_rules.empty and 'route_id' in matching_rules.columns:
        route_specific_rules = matching_rules[matching_rules['route_id'] == route_id]
        if not route_specific_rules.empty:
            matching_rules = route_specific_rules
    
    if not matching_rules.empty:
        fare_id = matching_rules.iloc[0]['fare_id']
        fare_details = fare_attr_df[fare_attr_df['fare_id'] == fare_id]
        
        if not fare_details.empty:
            price = float(fare_details.iloc[0]['price'])
            currency = fare_details.iloc[0]['currency_type']
            
            return {
                'fare_id': fare_id,
                'price': price,
                'currency': currency,
                'route_id': matching_rules.iloc[0]['route_id'] if 'route_id' in matching_rules.columns else None
            }
    
    # If still no match, try to find a fare based on similar zones
    # This is a fallback for when exact origin/destination pairs aren't in fare_rules
    if 'contains_id' in fare_rules_df.columns:
        # Look for rules that contain both origin and destination zones
        contains_rules = fare_rules_df[
            fare_rules_df['contains_id'].isin([origin_id, destination_id])
        ]
        if not contains_rules.empty:
            fare_id = contains_rules.iloc[0]['fare_id']
            fare_details = fare_attr_df[fare_attr_df['fare_id'] == fare_id]
            
            if not fare_details.empty:
                price = float(fare_details.iloc[0]['price'])
                currency = fare_details.iloc[0]['currency_type']
                
                return {
                    'fare_id': fare_id,
                    'price': price,
                    'currency': currency,
                    'route_id': contains_rules.iloc[0]['route_id'] if 'route_id' in contains_rules.columns else None,
                    'source': 'contains_zone'
                }
    
    # If no matching fare found, calculate based on distance approximation
    # BMTC typically charges based on distance bands
    try:
        # Try to get stop coordinates
        stops_df = data['stops']
        origin_stop = stops_df[stops_df['stop_id'] == origin_id]
        dest_stop = stops_df[stops_df['stop_id'] == destination_id]
        
        if not origin_stop.empty and not dest_stop.empty and 'stop_lat' in stops_df.columns and 'stop_lon' in stops_df.columns:
            from math import radians, cos, sin, asin, sqrt
            
            # Calculate distance using Haversine formula
            def haversine(lon1, lat1, lon2, lat2):
                # Convert decimal degrees to radians
                lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
                # Haversine formula
                dlon = lon2 - lon1
                dlat = lat2 - lat1
                a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
                c = 2 * asin(sqrt(a))
                # Radius of earth in kilometers is 6371
                km = 6371 * c
                return km
            
            # Get coordinates
            lat1 = float(origin_stop.iloc[0]['stop_lat'])
            lon1 = float(origin_stop.iloc[0]['stop_lon'])
            lat2 = float(dest_stop.iloc[0]['stop_lat'])
            lon2 = float(dest_stop.iloc[0]['stop_lon'])
            
            # Calculate distance
            distance_km = haversine(lon1, lat1, lon2, lat2)
            
            # BMTC fare structure (approximate):
            # Up to 2 km: ₹5
            # 2-5 km: ₹10
            # 5-10 km: ₹15
            # 10-15 km: ₹20
            # 15+ km: ₹25
            if distance_km <= 2:
                price = 5.0
            elif distance_km <= 5:
                price = 10.0
            elif distance_km <= 10:
                price = 15.0
            elif distance_km <= 15:
                price = 20.0
            else:
                price = 25.0
                
            return {
                'fare_id': 'distance_based',
                'price': price,
                'currency': 'INR',
                'route_id': None,
                'distance_km': round(distance_km, 2),
                'source': 'distance_calculation'
            }
    except Exception as e:
        print(f"Error calculating distance-based fare: {e}")
    
    # Final fallback - base fare
    return {
        'fare_id': 'default',
        'price': 10.0,
        'currency': 'INR',
        'route_id': None,
        'source': 'default_fallback'
    }

@app.route('/api/health', methods=['GET'])
@app.route('/api/fare/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'BMTC Fare Calculation Service',
        'version': '1.0'
    })

@app.route('/api/stops', methods=['GET'])
@app.route('/api/fare/stops', methods=['GET'])
def get_stops():
    """Get all bus stops"""
    data = load_gtfs_data()
    if data is None:
        return jsonify({'error': 'Failed to load GTFS data'}), 500
    
    stops = data['stops'][['stop_id', 'stop_name']].to_dict('records')
    return jsonify({
        'stops': stops,
        'count': len(stops)
    })

@app.route('/api/stops/search', methods=['GET'])
@app.route('/api/fare/stops/search', methods=['GET'])
def search_stops():
    """Search stops by name"""
    query = request.args.get('q', '').lower()
    if not query:
        return jsonify({'stops': []})
    
    data = load_gtfs_data()
    if data is None:
        return jsonify({'error': 'Failed to load GTFS data'}), 500
    
    stops_df = data['stops']
    
    # Find stops that contain the query string
    matching_stops = stops_df[stops_df['stop_name'].str.lower().str.contains(query)]
    results = matching_stops[['stop_id', 'stop_name']].to_dict('records')
    
    return jsonify({
        'stops': results,
        'count': len(results),
        'query': query
    })

@app.route('/api/calculate_fare', methods=['POST'])
@app.route('/api/fare/calculate', methods=['POST'])
def calculate_fare_endpoint():
    """Calculate fare between two stops"""
    try:
        data = request.get_json()
        origin = data.get('origin')
        destination = data.get('destination')
        route_id = data.get('route_id')  # Optional route_id for more accurate pricing
        
        # Load GTFS data
        gtfs_data = load_gtfs_data()
        if gtfs_data is None:
            return jsonify({'error': 'Failed to load GTFS data'}), 500
        
        stops_df = gtfs_data['stops']
        routes_df = gtfs_data['routes']
        
        # Find stops by name
        origin_stop = find_stop_by_name(stops_df, origin)
        destination_stop = find_stop_by_name(stops_df, destination)
        
        if origin_stop is None:
            return jsonify({'error': f'Origin stop "{origin}" not found'}), 404
        if destination_stop is None:
            return jsonify({'error': f'Destination stop "{destination}" not found'}), 404
        
        origin_id = origin_stop['stop_id']
        destination_id = destination_stop['stop_id']
        
        # Get actual stop names from database
        actual_origin_name = origin_stop['stop_name']
        actual_destination_name = destination_stop['stop_name']
        
        # Get route name if route_id is provided
        route_name = None
        if route_id and 'route_id' in routes_df.columns and 'route_long_name' in routes_df.columns:
            route_info = routes_df[routes_df['route_id'] == route_id]
            if not route_info.empty:
                route_name = route_info.iloc[0]['route_long_name']
        
        # Calculate fare
        fare_info = calculate_fare(origin_id, destination_id, route_id)
        
        if fare_info is None:
            # Fallback to estimated fare if no GTFS data found
            distance_km = 5.0  # Default distance if unknown
            price = 5.0 + (distance_km * 2.0)
            
            return jsonify({
                'origin': origin,
                'destination': destination,
                'fare': float(price),
                'currency': 'INR',
                'distance_km': float(distance_km),
                'gst': float(price * 0.05),
                'total': float(price * 1.05),
                'source': 'estimated',
                'message': 'Fare estimated based on average distance'
            })
        
        # Calculate GST (5%) and total
        price = float(fare_info['price'])
        gst = float(price * 0.05)
        total = float(price * 1.05)
        
        # Approximate distance based on fare (assuming ₹2/km after base fare)
        distance_km = float((price - 5.0) / 2.0 if price > 5.0 else 1.0)
        
        # Return fare information
        response = {
            'origin': origin,
            'destination': destination,
            'actual_origin_name': actual_origin_name,
            'actual_destination_name': actual_destination_name,
            'origin_id': origin_id,
            'destination_id': destination_id,
            'fare': price,
            'currency': fare_info['currency'],
            'fare_id': fare_info['fare_id'],
            'route_id': fare_info['route_id'],
            'distance_km': distance_km,
            'gst': gst,
            'total': total,
            'source': 'gtfs',
            'message': 'Fare calculated from GTFS dataset'
        }
        
        # Add route name if available
        if route_name:
            response['route_name'] = route_name
            
        return jsonify(response)
        
    except Exception as e:
        print(f"Error calculating fare: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/journey/plan', methods=['GET'])
def plan_journey():
    """API endpoint to plan a journey between two stops"""
    try:
        fromStop = request.args.get('fromStop')
        toStop = request.args.get('toStop')
        
        if not fromStop or not toStop:
            return jsonify({'error': 'Origin and destination stops are required'}), 400
        
        gtfs_data = load_gtfs_data()
        if not gtfs_data:
            return jsonify({'error': 'GTFS data not available'}), 500
        
        stops_df = gtfs_data['stops']
        routes_df = gtfs_data['routes']
        
        # Find stops by name
        origin_stop = find_stop_by_name(stops_df, fromStop)
        dest_stop = find_stop_by_name(stops_df, toStop)
        
        if not origin_stop:
            return jsonify({'error': f'Origin stop not found: {fromStop}'}), 404
        
        if not dest_stop:
            return jsonify({'error': f'Destination stop not found: {toStop}'}), 404
        
        # For now, return a simple direct route
        # In a real implementation, this would use GTFS data to find actual routes
        
        # Get a sample route
        if len(routes_df) > 0:
            route = routes_df.iloc[0].to_dict()
            route_id = route.get('route_id')
            route_short_name = route.get('route_short_name', 'Sample Route')
        else:
            route_id = "sample_route_1"
            route_short_name = "500"
            route = {
                'route_id': route_id,
                'route_short_name': route_short_name,
                'route_long_name': 'Sample Route',
                'route_type': 3  # Bus
            }
        
        # Get route shapes
        shapes_df = gtfs_data.get('shapes')
        route_shapes = get_route_shapes(shapes_df, route_short_name)
        
        # Calculate fare
        fare_result = calculate_fare(origin_stop['stop_id'], dest_stop['stop_id'], route_id)
        
        # Calculate estimated time (simple approximation)
        from math import radians, cos, sin, asin, sqrt
        
        def haversine(lon1, lat1, lon2, lat2):
            # Convert decimal degrees to radians
            lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
            # Haversine formula
            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            r = 6371  # Radius of earth in kilometers
            return c * r
        
        # Calculate distance
        distance = haversine(
            float(origin_stop['stop_lon']), float(origin_stop['stop_lat']),
            float(dest_stop['stop_lon']), float(dest_stop['stop_lat'])
        )
        
        # Estimate time (assuming average bus speed of 20 km/h)
        avg_speed = 20  # km/h
        time_hours = distance / avg_speed
        time_minutes = int(time_hours * 60)
        
        # Create response
        journey = [{
            'route': {
                'routeId': route_id,
                'routeShortName': route_short_name,
                'routeLongName': route.get('route_long_name', 'Direct Route'),
                'routeType': route.get('route_type', 3)
            },
            'stops': [
                {
                    'stopId': origin_stop['stop_id'],
                    'stopName': origin_stop['stop_name'],
                    'stopLat': origin_stop['stop_lat'],
                    'stopLon': origin_stop['stop_lon']
                },
                {
                    'stopId': dest_stop['stop_id'],
                    'stopName': dest_stop['stop_name'],
                    'stopLat': dest_stop['stop_lat'],
                    'stopLon': dest_stop['stop_lon']
                }
            ],
            'metrics': {
                'distance': round(distance, 2),
                'estimatedTimeMinutes': time_minutes,
                'fare': fare_result.get('price', 25) if fare_result else 25
            },
            'departureTime': '09:00 AM',  # Sample time
            'arrivalTime': '09:30 AM',    # Sample time
            'shapes': route_shapes if route_shapes else [
                {
                    'shapePtLat': float(origin_stop['stop_lat']),
                    'shapePtLon': float(origin_stop['stop_lon']),
                    'shapePtSequence': 0
                },
                {
                    'shapePtLat': float(dest_stop['stop_lat']),
                    'shapePtLon': float(dest_stop['stop_lon']),
                    'shapePtSequence': 1
                }
            ]  # Use real shapes data if available, fallback to basic coordinates
        }]
        
        return jsonify(journey)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def export_fares_to_csv():
    """Export loaded GTFS fare data to CSV"""
    
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Load GTFS data
    data = load_gtfs_data()
    if data is None:
        print("Failed to load GTFS data for export")
        return
    
    fare_attributes_df = data['fare_attributes']
    fare_rules_df = data['fare_rules']
    stops_df = data['stops']
    routes_df = data['routes']
    
    # Export fare attributes
    fare_attributes_df.to_csv(os.path.join(OUTPUT_DIR, 'fare_attributes.csv'), index=False)
    print(f"Exported {len(fare_attributes_df)} fare attributes")
    
    # Export fare rules (this is large - 1.36M rows)
    fare_rules_df.to_csv(os.path.join(OUTPUT_DIR, 'fare_rules.csv'), index=False)
    print(f"Exported {len(fare_rules_df)} fare rules")
    
    # Export stops with zone information
    stops_df.to_csv(os.path.join(OUTPUT_DIR, 'stops.csv'), index=False)
    print(f"Exported {len(stops_df)} stops")
    
    # Export routes
    routes_df.to_csv(os.path.join(OUTPUT_DIR, 'routes.csv'), index=False)
    print(f"Exported {len(routes_df)} routes")
    
    # Create a merged analysis file
    # Join fare_rules with fare_attributes
    merged_fares = fare_rules_df.merge(
        fare_attributes_df,
        on='fare_id',
        how='left'
    )
    merged_fares.to_csv(os.path.join(OUTPUT_DIR, 'merged_fares_analysis.csv'), index=False)
    print(f"Exported merged fare analysis with {len(merged_fares)} rows")
    
    # Analyze fare distribution
    print("\nFare Price Distribution:")
    print(fare_attributes_df['price'].value_counts().head(10))
    
    # Find most common routes if route_id exists
    if 'route_id' in fare_rules_df.columns:
        print("\nMost Common Routes:")
        print(fare_rules_df['route_id'].value_counts().head(10))
    
    # Analyze zone-based fares
    if 'origin_id' in fare_rules_df.columns and 'destination_id' in fare_rules_df.columns:
        print("\nSample Zone-Based Fares:")
        # Join with fare_attributes to get prices
        zone_fares = fare_rules_df.merge(
            fare_attributes_df,
            on='fare_id',
            how='left'
        ).groupby(['origin_id', 'destination_id'])['price'].mean()
        print(zone_fares.head(10))
    
    return True

@app.route('/api/export-fares', methods=['GET'])
def export_fares_endpoint():
    """API endpoint to trigger fare data export"""
    try:
        result = export_fares_to_csv()
        if result:
            return jsonify({
                'status': 'success',
                'message': 'GTFS fare data exported successfully',
                'export_path': OUTPUT_DIR
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Failed to export GTFS fare data'
            }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error exporting GTFS fare data: {str(e)}'
        }), 500

if __name__ == '__main__':
    # Load data on startup
    data = load_gtfs_data()
    
    # Export fare data to CSV for analysis
    print("\nExporting GTFS fare data to CSV...")
    export_fares_to_csv()
    
    print("\nStarting BMTC Fare Service on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)

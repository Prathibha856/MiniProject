"""
Quick script to find available bus stops in GTFS data
"""
import pandas as pd
from pathlib import Path

# Load stops
gtfs_dir = Path(__file__).parent / 'dataset' / 'gtfs'
stops_df = pd.read_csv(gtfs_dir / 'stops.txt')

print(f"Total stops: {len(stops_df)}\n")

# Search for common stops
searches = ['majestic', 'white', 'kr puram', 'silk board', 'koramangala', 'indiranagar']

for search in searches:
    matches = stops_df[stops_df['stop_name'].str.lower().str.contains(search, na=False)]
    print(f"\n=== Stops containing '{search}' ===")
    if len(matches) > 0:
        for _, row in matches.head(10).iterrows():
            print(f"  {row['stop_name']}")
    else:
        print(f"  No matches found")

print("\n" + "="*60)
print("First 20 stops in dataset:")
print("="*60)
for _, row in stops_df.head(20).iterrows():
    print(f"  {row['stop_name']}")

// Copy and paste this in your browser console to test the journey planner API endpoint
// Make sure the Flask fare_service.py is running on port 5001

const testJourneyAPI = async () => {
  console.log('🧪 Testing Journey Planner API...\n');
  
  const baseURL = 'http://localhost:5001/api';
  const fromStop = 'Majestic';
  const toStop = 'Silk Board';
  
  try {
    console.log(`📍 Testing: ${baseURL}/journey/plan`);
    console.log(`   From: ${fromStop}`);
    console.log(`   To: ${toStop}\n`);
    
    const url = `${baseURL}/journey/plan?fromStop=${encodeURIComponent(fromStop)}&toStop=${encodeURIComponent(toStop)}`;
    
    console.log(`🌐 Request URL: ${url}\n`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`📥 Response Status: ${response.status} ${response.statusText}\n`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Success! API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Validate response structure
    if (Array.isArray(data) && data.length > 0) {
      const route = data[0];
      console.log('\n📊 Route Details:');
      console.log(`   Route ID: ${route.route?.routeId || 'N/A'}`);
      console.log(`   Route Name: ${route.route?.routeShortName || 'N/A'}`);
      console.log(`   Distance: ${route.metrics?.distance || 'N/A'} km`);
      console.log(`   Fare: ₹${route.metrics?.fare || 'N/A'}`);
      console.log(`   Estimated Time: ${route.metrics?.estimatedTimeMinutes || 'N/A'} minutes`);
      console.log(`   Stops: ${route.stops?.length || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check if Flask backend is running: python ml/fare_service.py');
    console.error('   2. Verify the backend is on port 5001');
    console.error('   3. Check for CORS errors in the Network tab');
    console.error('   4. Ensure stop names exist in GTFS data');
  }
};

// Run the test
testJourneyAPI();

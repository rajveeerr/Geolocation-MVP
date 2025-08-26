const axios = require('axios');

async function testPerformance() {
  const baseUrl = 'http://localhost:3000/api/deals';
  
  console.log('🚀 Testing GET Deals API Performance\n');
  
  const tests = [
    { name: 'Basic Query', url: baseUrl },
    { name: 'Category Filter', url: `${baseUrl}?category=FOOD_AND_BEVERAGE` },
    { name: 'Search Filter', url: `${baseUrl}?search=coffee` },
    { name: 'Geolocation Filter', url: `${baseUrl}?latitude=40.7128&longitude=-74.0060&radius=5` },
    { name: 'Multiple Filters', url: `${baseUrl}?category=RETAIL&search=discount&latitude=40.7128&longitude=-74.0060&radius=10` }
  ];

  for (const test of tests) {
    const start = Date.now();
    try {
      const response = await axios.get(test.url);
      const duration = Date.now() - start;
      const resultCount = response.data.deals.length;
      
      console.log(`✅ ${test.name}:`);
      console.log(`   Duration: ${duration}ms`);
      console.log(`   Results: ${resultCount} deals`);
      console.log(`   Status: ${duration < 100 ? '🟢 Excellent' : duration < 300 ? '🟡 Good' : duration < 1000 ? '🟠 Fair' : '🔴 Poor'}`);
      console.log('');
    } catch (error) {
      console.log(`❌ ${test.name}: Error - ${error.message}`);
    }
  }
}

testPerformance().catch(console.error);

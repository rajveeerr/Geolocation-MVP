const axios = require('axios');

// Performance testing script for GET Deals API
async function performanceTest() {
  const baseUrl = 'http://localhost:3000/api/deals';
  
  console.log('🚀 Starting Performance Tests for GET Deals API\n');
  
  const testCases = [
    { 
      name: 'No filters', 
      url: baseUrl,
      description: 'Basic query with no filters'
    },
    { 
      name: 'Category filter', 
      url: `${baseUrl}?category=FOOD_AND_BEVERAGE`,
      description: 'Filter by category only'
    },
    { 
      name: 'Search filter', 
      url: `${baseUrl}?search=coffee`,
      description: 'Text search only'
    },
    { 
      name: 'Geolocation filter', 
      url: `${baseUrl}?latitude=40.7128&longitude=-74.0060&radius=5`,
      description: 'Location-based filtering'
    },
    { 
      name: 'Category + Search', 
      url: `${baseUrl}?category=FOOD_AND_BEVERAGE&search=coffee`,
      description: 'Category and search combined'
    },
    { 
      name: 'Category + Geolocation', 
      url: `${baseUrl}?category=RETAIL&latitude=40.7128&longitude=-74.0060&radius=10`,
      description: 'Category and location combined'
    },
    { 
      name: 'Search + Geolocation', 
      url: `${baseUrl}?search=discount&latitude=34.0522&longitude=-118.2437&radius=5`,
      description: 'Search and location combined'
    },
    { 
      name: 'All filters', 
      url: `${baseUrl}?category=ENTERTAINMENT&search=movie&latitude=40.7128&longitude=-74.0060&radius=15`,
      description: 'All filters combined'
    }
  ];

  const results = [];

  for (const testCase of testCases) {
    console.log(`📊 Testing: ${testCase.name}`);
    console.log(`   Description: ${testCase.description}`);
    
    const startTime = Date.now();
    try {
      const response = await axios.get(testCase.url);
      const duration = Date.now() - startTime;
      const resultCount = response.data.deals.length;
      
      console.log(`   ✅ Duration: ${duration}ms`);
      console.log(`   📈 Results: ${resultCount} deals`);
      console.log(`   🔗 URL: ${testCase.url}\n`);
      
      results.push({
        name: testCase.name,
        duration,
        resultCount,
        success: true,
        error: null
      });
      
      // Performance warnings
      if (duration > 1000) {
        console.log(`   ⚠️  WARNING: Slow query detected (>1s)\n`);
      } else if (duration > 500) {
        console.log(`   ⚠️  NOTICE: Query taking longer than expected (>500ms)\n`);
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`   ❌ Error: ${error.message}`);
      console.log(`   ⏱️  Duration: ${duration}ms\n`);
      
      results.push({
        name: testCase.name,
        duration,
        resultCount: 0,
        success: false,
        error: error.message
      });
    }
  }

  // Summary report
  console.log('📋 Performance Test Summary\n');
  console.log('='.repeat(60));
  
  const successfulTests = results.filter(r => r.success);
  const failedTests = results.filter(r => !r.success);
  
  if (successfulTests.length > 0) {
    const avgDuration = successfulTests.reduce((sum, r) => sum + r.duration, 0) / successfulTests.length;
    const minDuration = Math.min(...successfulTests.map(r => r.duration));
    const maxDuration = Math.max(...successfulTests.map(r => r.duration));
    
    console.log(`✅ Successful Tests: ${successfulTests.length}/${results.length}`);
    console.log(`📊 Average Duration: ${avgDuration.toFixed(2)}ms`);
    console.log(`⚡ Fastest Query: ${minDuration}ms`);
    console.log(`🐌 Slowest Query: ${maxDuration}ms`);
    
    // Performance analysis
    console.log('\n📈 Performance Analysis:');
    successfulTests.forEach(test => {
      const status = test.duration < 100 ? '🟢 Excellent' : 
                    test.duration < 300 ? '🟡 Good' : 
                    test.duration < 1000 ? '🟠 Fair' : '🔴 Poor';
      console.log(`   ${test.name}: ${test.duration}ms ${status}`);
    });
  }
  
  if (failedTests.length > 0) {
    console.log(`\n❌ Failed Tests: ${failedTests.length}`);
    failedTests.forEach(test => {
      console.log(`   ${test.name}: ${test.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 Performance Targets:');
  console.log('   🟢 < 100ms: Excellent');
  console.log('   🟡 < 300ms: Good');
  console.log('   🟠 < 1000ms: Fair');
  console.log('   🔴 > 1000ms: Needs optimization');
}

// Load testing function
async function loadTest() {
  const baseUrl = 'http://localhost:3000/api/deals';
  const concurrentRequests = 10;
  const totalRequests = 100;
  
  console.log(`\n🔥 Starting Load Test: ${totalRequests} requests, ${concurrentRequests} concurrent\n`);
  
  const startTime = Date.now();
  const promises = [];
  
  for (let i = 0; i < totalRequests; i++) {
    promises.push(
      axios.get(baseUrl)
        .then(response => ({ success: true, duration: Date.now() - startTime }))
        .catch(error => ({ success: false, error: error.message, duration: Date.now() - startTime }))
    );
    
    // Limit concurrent requests
    if (promises.length >= concurrentRequests) {
      await Promise.all(promises);
      promises.length = 0;
    }
  }
  
  // Wait for remaining requests
  if (promises.length > 0) {
    await Promise.all(promises);
  }
  
  const totalDuration = Date.now() - startTime;
  const rps = (totalRequests / totalDuration) * 1000;
  
  console.log(`📊 Load Test Results:`);
  console.log(`   Total Requests: ${totalRequests}`);
  console.log(`   Total Duration: ${totalDuration}ms`);
  console.log(`   Requests/Second: ${rps.toFixed(2)} RPS`);
  console.log(`   Average Response Time: ${(totalDuration / totalRequests).toFixed(2)}ms`);
}

// Run tests
async function runTests() {
  try {
    await performanceTest();
    await loadTest();
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
}

// Export for use in other scripts
module.exports = { performanceTest, loadTest, runTests };

// Run if called directly
if (require.main === module) {
  runTests();
}

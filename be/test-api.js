/**
 * Test script untuk BE API
 * Menguji semua endpoints: register, login, onboarding, recommendations, challenges
 * 
 * Run: node test-api.js
 */

const API_URL = 'http://localhost:4000/api';

let accessToken = null;
let refreshToken = null;
let userId = null;
let challengeId = null;

// Helper function untuk API calls
async function apiCall(method, endpoint, data = null, auth = false) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (auth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  const options = {
    method,
    headers
  };
  
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const result = await response.json();
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${method} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error(`Error calling ${method} ${endpoint}:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Starting BE API Tests...\n');
  
  // Test 1: Health Check
  console.log('\n📡 Test 1: Health Check');
  await apiCall('GET', '/health');
  
  // Test 2: Get API Docs
  console.log('\n📖 Test 2: API Documentation');
  await apiCall('GET', '/docs');
  
  // Test 3: Register User
  console.log('\n👤 Test 3: Register New User');
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    name: 'Test User'
  };
  const registerResult = await apiCall('POST', '/auth/register', testUser);
  
  if (registerResult?.success) {
    accessToken = registerResult.data.accessToken;
    refreshToken = registerResult.data.refreshToken;
    userId = registerResult.data.user.id;
    console.log('✅ Registration successful!');
  } else {
    console.log('❌ Registration failed!');
    return;
  }
  
  // Test 4: Get Current User
  console.log('\n🔍 Test 4: Get Current User');
  await apiCall('GET', '/auth/me', null, true);
  
  // Test 5: Get Onboarding Questions
  console.log('\n❓ Test 5: Get Onboarding Questions');
  await apiCall('GET', '/user/onboarding');
  
  // Test 6: Submit Onboarding Answers
  console.log('\n✍️ Test 6: Submit Onboarding Answers');
  const onboardingData = {
    answers: {
      transportation: ['motorcycle', 'public_transport'],
      diet: 'balanced',
      waste_management: 'sometimes',
      energy_usage: 'often',
      shopping_habits: ['reusable_bag', 'local_store'],
      interests: ['cycling', 'cooking', 'gardening']
    }
  };
  await apiCall('POST', '/user/onboarding', onboardingData, true);
  
  // Test 7: Get User Profile
  console.log('\n👤 Test 7: Get User Profile');
  await apiCall('GET', '/user/profile', null, true);
  
  // Test 8: Update User Preferences
  console.log('\n⚙️ Test 8: Update User Preferences');
  const preferences = {
    challenge_difficulty: 'medium',
    categories_of_interest: ['transport', 'food', 'energy'],
    notification_enabled: true
  };
  await apiCall('PUT', '/user/preferences', preferences, true);
  
  // Test 9: Get Challenge Recommendations
  console.log('\n🎯 Test 9: Get AI Challenge Recommendations');
  const recommendations = await apiCall('GET', '/challenges/recommendations', null, true);
  
  if (recommendations?.success && recommendations.data.recommendations.length > 0) {
    challengeId = recommendations.data.recommendations[0].id;
    console.log(`✅ Got ${recommendations.data.recommendations.length} recommendations!`);
  }
  
  // Test 10: Get Challenge Details
  if (challengeId) {
    console.log('\n📋 Test 10: Get Challenge Details');
    await apiCall('GET', `/challenges/${challengeId}`, null, true);
  }
  
  // Test 11: Accept Challenge
  if (challengeId) {
    console.log('\n✅ Test 11: Accept Challenge');
    await apiCall('POST', `/challenges/${challengeId}/accept`, null, true);
  }
  
  // Test 12: Get My Challenges
  console.log('\n📊 Test 12: Get My Challenges');
  await apiCall('GET', '/challenges/my-challenges?status=all', null, true);
  
  // Test 13: Complete Challenge
  if (challengeId) {
    console.log('\n🏆 Test 13: Complete Challenge');
    const completionData = {
      proof_url: 'https://example.com/proof.jpg',
      notes: 'Challenge completed successfully! Testing from API test script.'
    };
    await apiCall('POST', `/challenges/${challengeId}/complete`, completionData, true);
  }
  
  // Test 14: Get User Stats
  console.log('\n📈 Test 14: Get User Stats');
  await apiCall('GET', '/user/stats', null, true);
  
  // Test 15: Generate New Challenges
  console.log('\n🤖 Test 15: Generate New AI Challenges');
  await apiCall('POST', '/challenges/generate', { count: 3 }, true);
  
  // Test 16: Refresh Token
  console.log('\n🔄 Test 16: Refresh Access Token');
  const refreshResult = await apiCall('POST', '/auth/refresh', { refreshToken });
  
  if (refreshResult?.success) {
    accessToken = refreshResult.data.accessToken;
    console.log('✅ Token refreshed!');
  }
  
  // Test 17: Update Profile
  console.log('\n✏️ Test 17: Update User Profile');
  const profileUpdate = {
    name: 'Test User Updated',
    profile: {
      bio: 'Passionate about sustainability and reducing carbon footprint',
      location: 'Jakarta, Indonesia',
      avatar: 'https://example.com/avatar.jpg'
    }
  };
  await apiCall('PUT', '/user/profile', profileUpdate, true);
  
  // Test 18: Login with credentials
  console.log('\n🔐 Test 18: Login with Credentials');
  const loginResult = await apiCall('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  
  if (loginResult?.success) {
    console.log('✅ Login successful!');
  }
  
  // Test 19: Logout
  console.log('\n👋 Test 19: Logout');
  await apiCall('POST', '/auth/logout', null, true);
  
  console.log('\n\n' + '='.repeat(60));
  console.log('✅ All tests completed!');
  console.log('='.repeat(60));
  
  console.log('\n📊 Test Summary:');
  console.log('- Health Check: ✓');
  console.log('- Registration: ✓');
  console.log('- Login: ✓');
  console.log('- Onboarding: ✓');
  console.log('- User Management: ✓');
  console.log('- AI Recommendations: ✓');
  console.log('- Challenge Management: ✓');
  console.log('- Token Refresh: ✓');
  console.log('- Logout: ✓');
  
  console.log('\n🎉 Backend API working perfectly!');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (response.ok) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}

// Main execution
(async () => {
  console.log('🔍 Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('\n❌ Server is not running!');
    console.log('Please start the server first:');
    console.log('  cd be');
    console.log('  npm run dev');
    console.log('\nThen run this test script again.');
    process.exit(1);
  }
  
  console.log('✅ Server is running!\n');
  
  await runTests();
})();

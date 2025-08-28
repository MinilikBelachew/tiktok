import axios from 'axios';

// Utility to test logout functionality
export const testLogout = async () => {
  console.log('=== Testing Logout Functionality ===');
  
  // Test 1: Check if user is authenticated before logout
  console.log('1. Checking authentication status...');
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}api/user/profile`, {
      withCredentials: true
    });
    console.log('   Authentication check response:', response.status);
    if (response.status === 200) {
      console.log('   User data:', response.data.user?.email);
    }
  } catch (error) {
    console.log('   Authentication check failed:', error);
  }

  // Test 2: Call logout endpoint
  console.log('2. Calling logout endpoint...');
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}api/auth/logout`, {}, {
      withCredentials: true
    });
    console.log('   Logout response:', response.status);
    console.log('   Logout message:', response.data.message);
  } catch (error) {
    console.log('   Logout failed:', error);
  }

  // Test 3: Check if user is still authenticated after logout
  console.log('3. Checking authentication status after logout...');
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}api/user/profile`, {
      withCredentials: true
    });
    console.log('   Post-logout authentication check response:', response.status);
    if (response.status === 200) {
      console.log('   Post-logout user data:', response.data.user?.email);
    } else {
      console.log('   User is no longer authenticated (expected)');
    }
  } catch (error) {
    console.log('   Post-logout authentication check failed:', error);
  }

  console.log('=== Logout Test Complete ===');
};

// Run this in browser console to test logout
// testLogout();

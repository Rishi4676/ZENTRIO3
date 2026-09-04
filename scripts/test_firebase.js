const axios = require('axios');
require('dotenv').config();

const testFirebase = async () => {
  const apiKey = process.env.FIREBASE_API_KEY;
  console.log('Firebase API Key:', apiKey);
  
  if (!apiKey) {
    console.error('FIREBASE_API_KEY is not defined in .env');
    return;
  }

  // We can try to authenticate with a test user or see if the API endpoint is reachable and responsive
  try {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const response = await axios.post(url, {
      email: 'nonexistent_test_user@zentrio.ai',
      password: 'password123',
      returnSecureToken: true
    });
    console.log('Firebase Auth Response:', response.data);
  } catch (err) {
    const message = err.response && err.response.data && err.response.data.error 
      ? err.response.data.error.message 
      : err.message;
    console.log('Firebase Auth Result (Expected to fail with EMAIL_NOT_FOUND):', message);
  }
};

testFirebase();

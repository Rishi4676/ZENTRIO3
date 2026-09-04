// ============================================================
// GOOGLE OAUTH CONFIGURATION
// ============================================================
// To set up Google OAuth for your app:
//
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project (or select an existing one)
// 3. Navigate to APIs & Services > Credentials
// 4. Click "Create Credentials" > "OAuth 2.0 Client ID"
// 5. Application type: "Web application"
// 6. Add Authorized JavaScript origins:
//    - http://localhost:5173  (for local dev)
//    - http://localhost:3000
//    - https://your-production-domain.com
// 7. Add Authorized redirect URIs:
//    - http://localhost:5173
//    - http://localhost:3000
//    - https://your-production-domain.com
// 8. Copy the Client ID and paste it below
//
// For production, store this in an .env file:
//   VITE_GOOGLE_CLIENT_ID=your-client-id-here
// ============================================================

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

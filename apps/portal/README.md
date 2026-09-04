# Zentrio AI Portal Login Module

This is an isolated, standalone front-end module for the **Zentrio AI Portal Logins and Registrations**. It is extracted from the main administration application to run independently, letting you test and fix authentication pages without loading the entire dashboards suite.

## 🚀 How to Run Locally

### 1. Start the Backend Express Server
In the root directory (`main-admin`):
```bash
# Install root dependencies
npm install

# Start Express server on port 3000
npm start
```

### 2. Start the Portal Login Dev Server
In this directory (`portal-login`):
```bash
# Install dependencies
npm install

# Start Vite dev server on port 5173
npm run dev
```

Open `http://localhost:5173` in your browser.

## ⚙️ Proxy Configuration

Vite dev server is preconfigured in `vite.config.ts` to proxy all request paths matching `/api` to the backend Express server on `http://localhost:3000`. This allows login requests, session checks (`/api/auth/me`), and OTP codes to work seamlessly.

## 📁 Key Files

- [App.tsx](file:///C:/Users/HP/Desktop/main-admin/portal-login/src/App.tsx): Manages page state and routes between different login portals.
- [PortalSelector.tsx](file:///C:/Users/HP/Desktop/main-admin/portal-login/src/pages/PortalSelector.tsx): The main selection hub (Client, Worker, Admin).
- [LoginSuccess.tsx](file:///C:/Users/HP/Desktop/main-admin/portal-login/src/pages/LoginSuccess.tsx): A premium visual dashboard showing the authenticated session details.

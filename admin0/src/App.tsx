import { AppProvider, useApp } from './context/AppContext'
import { AdminLogin } from './pages/AdminLogin'
import { WorkerLogin } from './pages/WorkerLogin'
import { ClientLogin } from './pages/ClientLogin'
import { ClientRegister } from './pages/ClientRegister'
import { ClientDashboard } from './pages/ClientDashboard'
import { AdminDashboard } from './pages/AdminDashboard'
import { WorkerDashboard } from './pages/WorkerDashboard'
import { ProtectedRoute } from './components/ProtectedRoute'
import './App.css'

function AppContent() {
  const { currentPage, loading, error } = useApp()

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 font-sans">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float-reverse"></div>
        </div>
        <div className="glass-card max-w-md w-full p-10 rounded-2xl border border-white/10 text-center glow-primary relative z-10">
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-pink-500 animate-spin"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold font-heading text-white tracking-tight mb-2">Zentrio AI Workspace</h2>
          <p className="text-slate-400 text-sm animate-pulse">Synchronizing with Firebase Firestore...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 font-sans">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-float"></div>
        </div>
        <div className="glass-card max-w-lg w-full p-8 rounded-2xl border border-red-500/20 text-center shadow-2xl relative z-10">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold font-heading text-white tracking-tight mb-3">Database Connection Failure</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            The frontend client was unable to retrieve data from the backend APIs. This typically occurs if the server is offline or if Firebase Firestore rejected the connection.
          </p>
          <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4 mb-6 text-left max-h-40 overflow-y-auto">
            <code className="text-xs text-red-400 font-mono break-all">{error}</code>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.reload()} 
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-6 rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    )
  }

  switch (currentPage) {
    case 'home':
    case 'client-login':
      return <ClientLogin />
    case 'admin-login':
      return <AdminLogin />
    case 'worker-login':
      return <WorkerLogin />
    case 'client-register':
      return <ClientRegister />
    case 'client-dashboard':
      return (
        <ProtectedRoute allowedRoles={['client']} fallbackRedirect={() => window.location.replace('/portal/client-login')}>
          <ClientDashboard />
        </ProtectedRoute>
      )
    case 'admin-dashboard':
      return (
        <ProtectedRoute allowedRoles={['admin']} fallbackRedirect={() => window.location.replace('/portal/admin-login')}>
          <AdminDashboard />
        </ProtectedRoute>
      )
    case 'worker-dashboard':
      return (
        <ProtectedRoute allowedRoles={['worker']} fallbackRedirect={() => window.location.replace('/portal/worker-login')}>
          <WorkerDashboard />
        </ProtectedRoute>
      )
    default:
      return <ClientLogin />
  }
}

function App() {
  return (
    <AppProvider>
      <div className="global-bg-video-container">
        <video className="global-bg-video" autoPlay loop muted playsInline preload="metadata" aria-hidden="true">
          <source src="/background-video.mp4" type="video/mp4" />
          <source src="/assets/background-video.mp4" type="video/mp4" />
          <source src="/background%20video.mp4" type="video/mp4" />
        </video>
        <div className="global-bg-overlay" />
      </div>
      <AppContent />
    </AppProvider>
  )
}

export default App


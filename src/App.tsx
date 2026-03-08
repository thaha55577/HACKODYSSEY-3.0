import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './AuthContext';
import NeuralNetworkBg from './assets/components/NeuralNetworkBg';
import SplashScreen from './assets/components/SplashScreen';
import Login from './assets/components/Login';
import RegistrationForm from './assets/components/RegistrationForm';
import AdminDashboard from './assets/components/AdminDashboard';
import TeamDetail from './assets/components/TeamDetail';
import IdeaSubmission from './assets/components/IdeaSubmission';
import AdminIdeaSubmissions from './assets/components/AdminIdeaSubmissions';
import ProtectedRoute from './assets/components/ProtectedRoute';

import { Component, ErrorInfo, ReactNode } from 'react';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("CRITICAL MISSION FAILURE:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-12 text-center">
          <h1 className="text-4xl font-black text-rose-500 mb-6 uppercase tracking-tighter">DATA_CORRUPTION_DETECTED</h1>
          <p className="text-slate-400 font-mono mb-8 max-w-lg">Error logic trace identified a critical failure in the neural bridge. Operation aborted.</p>
          <pre className="bg-black/50 p-6 rounded-2xl border border-rose-500/20 text-xs text-rose-400/70 mb-8 max-w-full overflow-auto">
            {this.state.error?.message}
          </pre>
          <button onClick={() => window.location.href = '/'} className="glow-btn bg-rose-500/10 border-rose-500/20 text-rose-400 px-8 py-3">REBOOT_SYSTEM</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <NeuralNetworkBg />
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/register"
              element={
                <ProtectedRoute adminOnly={false}>
                  <RegistrationForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/team/:teamName"
              element={
                <ProtectedRoute adminOnly={true}>
                  <TeamDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ideas"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminIdeaSubmissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submit-idea"
              element={
                <ProtectedRoute adminOnly={false}>
                  <IdeaSubmission />
                </ProtectedRoute>
              }
            />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

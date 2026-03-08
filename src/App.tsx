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

function App() {
  return (
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
  );
}

export default App;

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import ApprovalWaiting from './ApprovalWaiting';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly: boolean;
}

const ProtectedRoute = ({ children, adminOnly }: ProtectedRouteProps) => {
  const { currentUser, loading, permissionStatus } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const isAdmin = currentUser.email === '99230040469@klu.ac.in' || currentUser.email === '99220041803@gmail.com';

  if (adminOnly && !isAdmin) {
    return <Navigate to="/register" />;
  }

  // Permission check for non-admin routes (like /register)
  if (!adminOnly && !isAdmin && permissionStatus === 'pending') {
    return <ApprovalWaiting />;
  }

  if (!adminOnly && isAdmin) {
    return <Navigate to="/admin" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

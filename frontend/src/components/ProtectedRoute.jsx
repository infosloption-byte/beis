import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // If they aren't logged in, bounce them to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If they are logged in, render the child routes (which will be our Layout)
  return <Outlet />;
}
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Pages & Components
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Users from './pages/Users';
import Properties from './pages/Properties';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Dashboard from './pages/Dashboard';
import PropertyDetails from './pages/PropertyDetails';
import UserDetails from './pages/UserDetails';
import Reports from './pages/Reports';
import KanbanBoard from './pages/KanbanBoard';
import JobCalendar from './pages/JobCalendar';
import Timesheets from './pages/Timesheets';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      {/* If logged in, redirect away from Login to the Dashboard */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      
      {/* If logged in, redirect to Dashboard. If not, show the beautiful Landing Page. */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
      />

      {/* --- PROTECTED ROUTES --- */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          
          {/* Note: The dashboard is now explicitly at /dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />

          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />

          <Route path="/kanban" element={<KanbanBoard />} />
          <Route path="/calendar" element={<JobCalendar />} />

          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetails />} />

          <Route path="/reports" element={<Reports />} />

          <Route path="/timesheets" element={<Timesheets />} />
        </Route>
      </Route>

      {/* Fallback Route: Catch any unknown URLs and send them back to the root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
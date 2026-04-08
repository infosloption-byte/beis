import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
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
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes Wrapper */}
      <Route element={<ProtectedRoute />}>
        {/* Layout Wrapper */}
        <Route element={<Layout />}>
          {/* Dashboard Pages */}
          <Route path="/" element={<Dashboard />} />
          
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
    </Routes>
  );
}

export default App;
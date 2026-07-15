import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './features/authSlice';

// Layout & Route Guards
import Layout from './layouts/Layout';
import ProtectedRoute from './routes/ProtectedRoute';
import ToastContainer from './components/ToastContainer';

// Public Pages
import Landing from './pages/Landing';
import Search from './pages/Search';
import RentalCompanies from './pages/RentalCompanies';
import CompanyDetails from './pages/CompanyDetails';
import VehicleDetails from './pages/VehicleDetails';
import Contact from './pages/Contact';

// Role-Specific Auth Pages
import UserLogin from './pages/UserLogin';
import CompanyLogin from './pages/CompanyLogin';
import AdminLogin from './pages/AdminLogin';
import UserRegister from './pages/UserRegister';
import CompanyRegister from './pages/CompanyRegister';
import DriverLogin from './pages/DriverLogin';
import DriverRegister from './pages/DriverRegister';

// Protected Dashboard & Profile Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CompanyDashboard from './pages/CompanyDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const dispatch = useDispatch();
  const { token, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch, token]);

  const getDashboardRedirect = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'rental_company': return '/company/dashboard';
      case 'driver': return '/driver/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/dashboard';
    }
  };

  return (
    <Router>
      <ToastContainer />
      <Routes>
        {/* Dashboards and Onboarding (Standalone business systems - no public website elements) */}
        <Route path="/company/dashboard" element={
          <ProtectedRoute allowedRoles={['rental_company']}>
            <CompanyDashboard />
          </ProtectedRoute>
        } />
        <Route path="/driver/dashboard" element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DriverDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Public Layout Pages */}
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<Landing />} />
          <Route path="search" element={<Search />} />
          <Route path="companies" element={<RentalCompanies />} />
          <Route path="companies/:id" element={<CompanyDetails />} />
          <Route path="vehicles/:id" element={<VehicleDetails />} />
          <Route path="contact" element={<Contact />} />

          {/* Auth Routes — redirect if already authenticated */}
          <Route path="login/user" element={isAuthenticated ? <Navigate to={getDashboardRedirect()} replace /> : <UserLogin />} />
          <Route path="login/company" element={isAuthenticated ? <Navigate to={getDashboardRedirect()} replace /> : <CompanyLogin />} />
          <Route path="login/driver" element={isAuthenticated ? <Navigate to={getDashboardRedirect()} replace /> : <DriverLogin />} />
          <Route path="login/admin" element={isAuthenticated ? <Navigate to={getDashboardRedirect()} replace /> : <AdminLogin />} />
          <Route path="register/user" element={isAuthenticated ? <Navigate to={getDashboardRedirect()} replace /> : <UserRegister />} />
          <Route path="register/company" element={isAuthenticated && user?.role === 'rental_company' ? <Navigate to={getDashboardRedirect()} replace /> : <CompanyRegister />} />
          <Route path="register/driver" element={isAuthenticated ? <Navigate to={getDashboardRedirect()} replace /> : <DriverRegister />} />

          {/* Legacy route redirects for old /login and /register */}
          <Route path="login" element={<Navigate to="/login/user" replace />} />
          <Route path="register" element={<Navigate to="/register/user" replace />} />

          {/* Tourist Protected Routes (Uses standard Layout) */}
          <Route path="dashboard" element={<ProtectedRoute allowedRoles={['user']}><Dashboard /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute allowedRoles={['user', 'rental_company', 'driver', 'admin']}><Profile /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

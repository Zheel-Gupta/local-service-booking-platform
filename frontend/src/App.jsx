import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer pages
import Home from './pages/customer/Home';
import ServiceDetails from './pages/customer/ServiceDetails';
import MyBookings from './pages/customer/MyBookings';

// Provider Dashboard placeholder
import ProviderDashboard from './pages/provider/ProviderDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public Auth Routes ─────────────────────────────────────────── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Protected Customer Routes ──────────────────────────────────── */}
          <Route
            path="/customer/home"
            element={
              <PrivateRoute allowedRoles={['customer']}>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/customer/service/:id"
            element={
              <PrivateRoute allowedRoles={['customer']}>
                <ServiceDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/customer/my-bookings"
            element={
              <PrivateRoute allowedRoles={['customer']}>
                <MyBookings />
              </PrivateRoute>
            }
          />

          {/* ── Protected Provider Routes ──────────────────────────────────── */}
          <Route
            path="/provider/dashboard"
            element={
              <PrivateRoute allowedRoles={['provider']}>
                <ProviderDashboard />
              </PrivateRoute>
            }
          />

          {/* ── Default / Fallback Redirect ────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

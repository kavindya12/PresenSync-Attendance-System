import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Callback from './pages/auth/Callback';
import ProtectedRoute from './components/common/ProtectedRoute';

// Lazy load dashboard components for faster initial load
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const LecturerDashboard = lazy(() => import('./pages/LecturerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Loading component for lazy routes
const DashboardLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading dashboard...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<Callback />} />

          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Suspense fallback={<DashboardLoader />}>
                <StudentDashboard />
              </Suspense>
            </ProtectedRoute>
          } />

          <Route path="/lecturer/*" element={
            <ProtectedRoute allowedRoles={['lecturer']}>
              <Suspense fallback={<DashboardLoader />}>
                <LecturerDashboard />
              </Suspense>
            </ProtectedRoute>
          } />

          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin', 'dept_head']}>
              <Suspense fallback={<DashboardLoader />}>
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

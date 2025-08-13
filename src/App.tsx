import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/Toaster';
import { AppShell } from './components/AppShell';
import { Landing } from './pages/Landing';
import { Auth } from './pages/auth/Auth';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { LibraryBooking } from './pages/student/LibraryBooking';

// Protected Route Component
import { getCurrentUser } from './mocks/users';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to={`/${currentUser.role}`} replace />;
  }
  
  return <AppShell>{children}</AppShell>;
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Student Routes */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/library" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <LibraryBooking />
              </ProtectedRoute>
            } 
          />
          
          {/* Placeholder routes for other pages */}
          <Route 
            path="/student/lab" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <div className="text-center py-20">
                  <h1 className="text-3xl font-bold text-slate-900 mb-4">Lab Booking</h1>
                  <p className="text-slate-600">Coming in next iteration...</p>
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/bookings" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <div className="text-center py-20">
                  <h1 className="text-3xl font-bold text-slate-900 mb-4">My Bookings</h1>
                  <p className="text-slate-600">Coming in next iteration...</p>
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/penalties" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <div className="text-center py-20">
                  <h1 className="text-3xl font-bold text-slate-900 mb-4">Penalties</h1>
                  <p className="text-slate-600">Coming in next iteration...</p>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Faculty Routes */}
          <Route 
            path="/faculty" 
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <div className="text-center py-20">
                  <h1 className="text-3xl font-bold text-slate-900 mb-4">Faculty Dashboard</h1>
                  <p className="text-slate-600">Coming in next iteration...</p>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Staff Routes */}
          <Route 
            path="/staff/checkin" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <div className="text-center py-20">
                  <h1 className="text-3xl font-bold text-slate-900 mb-4">Check-in Portal</h1>
                  <p className="text-slate-600">Coming in next iteration...</p>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="text-center py-20">
                  <h1 className="text-3xl font-bold text-slate-900 mb-4">Admin Dashboard</h1>
                  <p className="text-slate-600">Coming in next iteration...</p>
                </div>
              </ProtectedRoute>
            } 
          />

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;
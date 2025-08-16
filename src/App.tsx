import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/Toaster';
import { AppShell } from './components/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Auth } from './pages/auth/Auth';
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { BookRoom } from './pages/faculty/BookRoom';
import { MyClasses } from './pages/faculty/MyClasses';
import { CheckinPortal } from './pages/staff/CheckinPortal';
import { TodaySchedule } from './pages/staff/TodaySchedule';
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { LibraryBooking } from './pages/student/LibraryBooking';
import { LabBooking } from './pages/student/LabBooking';
import { MyBookings } from './pages/student/MyBookings';
import { Penalties } from './pages/student/Penalties';

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
                <AppShell>
                  <StudentDashboard />
                </AppShell>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/library" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AppShell>
                  <LibraryBooking />
                </AppShell>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/lab" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AppShell>
                  <LabBooking />
                </AppShell>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/bookings" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AppShell>
                  <MyBookings />
                </AppShell>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/penalties" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AppShell>
                  <Penalties />
                </AppShell>
              </ProtectedRoute>
            } 
          />
          
          {/* Faculty Routes */}
          <Route 
            path="/faculty" 
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <AppShell>
                  <FacultyDashboard />
                </AppShell>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/faculty/book" 
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <AppShell>
                  <BookRoom />
                </AppShell>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/faculty/classes" 
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <AppShell>
                  <MyClasses />
                </AppShell>
              </ProtectedRoute>
            } 
          />
          
          {/* Staff Routes */}
          <Route 
            path="/staff/checkin" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <AppShell>
                  <CheckinPortal />
                </AppShell>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/today" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <AppShell>
                  <TodaySchedule />
                </AppShell>
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppShell>
                  <AdminDashboard />
                </AppShell>
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
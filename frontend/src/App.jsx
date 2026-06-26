import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDetails from './pages/EmployeeDetails';
import Payroll from './pages/Payroll';
import Leave from './pages/Leave';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import TasksAdmin from './pages/TasksAdmin';
import AnnouncementsAdmin from './pages/AnnouncementsAdmin';
import SettingsAdmin from './pages/SettingsAdmin';
import MyTasks from './pages/MyTasks';
import MyProfile from './pages/MyProfile';
import AnnouncementsEmployee from './pages/AnnouncementsEmployee';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Common Routes */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />
          <Route path="/leave" element={<PrivateRoute><Leave /></PrivateRoute>} />

          {/* Admin / HR Only Routes */}
          <Route path="/employees" element={<PrivateRoute roles={['admin', 'hr']}><Employees /></PrivateRoute>} />
          <Route path="/employees/:id" element={<PrivateRoute roles={['admin', 'hr']}><EmployeeDetails /></PrivateRoute>} />
          <Route path="/payroll" element={<PrivateRoute><Payroll /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute roles={['admin', 'hr']}><Reports /></PrivateRoute>} />
          <Route path="/tasks/manage" element={<PrivateRoute roles={['admin', 'hr']}><TasksAdmin /></PrivateRoute>} />
          <Route path="/announcements/manage" element={<PrivateRoute roles={['admin', 'hr']}><AnnouncementsAdmin /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute roles={['admin', 'hr']}><SettingsAdmin /></PrivateRoute>} />

          {/* Employee Only Routes */}
          <Route path="/my-tasks" element={<PrivateRoute roles={['employee']}><MyTasks /></PrivateRoute>} />
          <Route path="/my-profile" element={<PrivateRoute roles={['employee']}><MyProfile /></PrivateRoute>} />
          <Route path="/announcements" element={<PrivateRoute roles={['employee']}><AnnouncementsEmployee /></PrivateRoute>} />
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

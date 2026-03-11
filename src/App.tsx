import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { Attendance } from './pages/Attendance';
import { Tasks } from './pages/Tasks';
import { Leaves } from './pages/Leaves';
import { Performance } from './pages/Performance';
import { Profile } from './pages/Profile';
import { ProjectManagement } from './pages/ProjectManagement';
import { BugTracking } from './pages/BugTracking';

const AppContent = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!token) {
    return <Login />;
  }

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'projects' && <ProjectManagement onNavigate={setActiveTab} />}
      {activeTab === 'employees' && <Employees />}
      {activeTab === 'attendance' && <Attendance />}
      {activeTab === 'tasks' && <Tasks />}
      {activeTab === 'leaves' && <Leaves />}
      {activeTab === 'performance' && <Performance />}
      {activeTab === 'bugs' && <BugTracking />}
      {activeTab === 'profile' && <Profile />}
    </DashboardLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { DoctorDashboard } from './pages/dashboards/DoctorDashboard';
import { ReceptionistDashboard } from './pages/dashboards/ReceptionistDashboard';
import { PatientDashboard } from './pages/dashboards/PatientDashboard';

const DashboardRouter = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'staff':
      return <ReceptionistDashboard />;
    case 'patient':
      return <PatientDashboard />;
    default:
      return <PatientDashboard />;
  }
};

export const App = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <h3>Loading Hospital Management System...</h3>
      </div>
    );
  }

  return (
    <div className="app-container">
      {user && <Navbar />}
      <div className="main-content">
        <div className="page-body">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
            <Route path="/*" element={<DashboardRouter />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;

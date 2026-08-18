import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { HospitalAds } from '../components/HospitalAds';
import { ShieldCheck, Stethoscope, UserCheck, User } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to sign in. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (presetEmail, presetPass) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setError('');
    setLoading(true);
    try {
      await login(presetEmail, presetPass);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '850px', marginBottom: '1rem' }}>
        <HospitalAds />
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img
            src="/hospital_logo.png"
            alt="MedCare Hospital Logo"
            style={{ height: '64px', marginBottom: '0.75rem', borderRadius: '12px' }}
          />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>MedCare Hospital Portal</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Sign in with your role credentials</p>
        </div>


        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. john@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: '#64748b' }}>Don't have an account? </span>
          <Link to="/register" style={{ fontWeight: 600 }}>Register as Patient</Link>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', textAlign: 'center' }}>
            ⚡ 1-Click Quick Demo Login
          </p>

          <div className="quick-login-grid">
            <div className="quick-login-card" onClick={() => handleQuickLogin('patient@hospital.com', 'patient123')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                <User size={16} color="#8b5cf6" /> Patient
              </div>
              <div style={{ fontSize: '0.725rem', color: '#64748b' }}>John Doe</div>
            </div>

            <div className="quick-login-card" onClick={() => handleQuickLogin('dr.sarah@hospital.com', 'doctor123')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                <Stethoscope size={16} color="#2563eb" /> Doctor
              </div>
              <div style={{ fontSize: '0.725rem', color: '#64748b' }}>Dr. Sarah Jenkins</div>
            </div>

            <div className="quick-login-card" onClick={() => handleQuickLogin('staff@hospital.com', 'staff123')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                <UserCheck size={16} color="#10b981" /> Receptionist
              </div>
              <div style={{ fontSize: '0.725rem', color: '#64748b' }}>Jane Smith</div>
            </div>

            <div className="quick-login-card" onClick={() => handleQuickLogin('admin@hospital.com', 'admin123')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                <ShieldCheck size={16} color="#ef4444" /> Admin
              </div>
              <div style={{ fontSize: '0.725rem', color: '#64748b' }}>Administrator</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

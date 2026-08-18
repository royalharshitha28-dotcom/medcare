import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    contact: '',
    dob: '',
    gender: 'Male',
    blood_group: 'O+',
    emergency_contact: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ ...formData, role: 'patient' });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '2rem 1rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '580px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '50px', height: '50px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '0.75rem'
          }}>
            <Activity size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Patient Registration</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Create your patient account to book appointments</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="full_name" className="form-control" required value={formData.full_name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" name="email" className="form-control" required value={formData.email} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Password *</label>
              <input type="password" name="password" className="form-control" required value={formData.password} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Contact Phone *</label>
              <input type="text" name="contact" className="form-control" required value={formData.contact} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" name="dob" className="form-control" value={formData.dob} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Blood Group</label>
              <select name="blood_group" className="form-control" value={formData.blood_group} onChange={handleChange}>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Emergency Contact</label>
            <input type="text" name="emergency_contact" className="form-control" placeholder="e.g. Mary Doe (+1 555-999)" value={formData.emergency_contact} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input type="text" name="address" className="form-control" placeholder="Full residential address" value={formData.address} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: '#64748b' }}>Already registered? </span>
          <Link to="/login" style={{ fontWeight: 600 }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

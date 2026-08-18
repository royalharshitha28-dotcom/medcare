import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Users, Stethoscope, Calendar, DollarSign, Plus, Building2, AlertCircle } from 'lucide-react';

export const AdminDashboard = () => {
  const { api } = useContext(AuthContext);

  const [metrics, setMetrics] = useState({
    total_patients: 0,
    total_doctors: 0,
    today_appointments: 0,
    completed_appointments: 0,
    total_revenue: 0,
    pending_payments: 0
  });

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, doctors, departments

  // Modal states
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);

  // New Doctor form
  const [newDoctor, setNewDoctor] = useState({
    full_name: '', email: '', password: 'doctor123', department_id: '',
    specialization: '', qualification: '', contact: '', consultation_fee: 75.0, availability: 'Mon-Fri 09:00 - 17:00'
  });

  // New Dept form
  const [newDept, setNewDept] = useState({ name: '', description: '' });

  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDashboard();
    fetchDoctors();
    fetchDepartments();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/api/dashboard/summary');
      setMetrics(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/api/doctors');
      setDoctors(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/api/departments');
      setDepartments(res.data);
      if (res.data.length > 0 && !newDoctor.department_id) {
        setNewDoctor(prev => ({ ...prev, department_id: res.data[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    try {
      await api.post('/api/doctors', newDoctor);
      setMsg({ type: 'success', text: 'Doctor added successfully!' });
      setShowDoctorModal(false);
      fetchDoctors();
      fetchDashboard();
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.detail || 'Failed to add doctor' });
    }
  };

  const handleAddDept = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    try {
      await api.post('/api/departments', newDept);
      setMsg({ type: 'success', text: 'Department added successfully!' });
      setShowDeptModal(false);
      fetchDepartments();
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.detail || 'Failed to add department' });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Admin Hospital Dashboard</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>System-wide oversight & medical management</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowDeptModal(true)}>
            <Plus size={16} /> New Department
          </button>
          <button className="btn btn-primary" onClick={() => setShowDoctorModal(true)}>
            <Plus size={16} /> Add Doctor
          </button>
        </div>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* Metrics Row */}
      <div className="grid-4">
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={24} /></div>
          <div>
            <div className="stat-title">Total Patients</div>
            <div className="stat-value">{metrics.total_patients}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><Stethoscope size={24} /></div>
          <div>
            <div className="stat-title">Total Doctors</div>
            <div className="stat-value">{metrics.total_doctors}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon yellow"><Calendar size={24} /></div>
          <div>
            <div className="stat-title">Today's Appointments</div>
            <div className="stat-value">{metrics.today_appointments}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><DollarSign size={24} /></div>
          <div>
            <div className="stat-title">Revenue Collected</div>
            <div className="stat-value">${metrics.total_revenue}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <button
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('overview')}
        >
          Doctors Directory ({doctors.length})
        </button>
        <button
          className={`btn ${activeTab === 'departments' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('departments')}
        >
          Departments ({departments.length})
        </button>
      </div>

      {/* Doctors Table */}
      {activeTab === 'overview' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Active Medical Staff</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Department</th>
                  <th>Specialization</th>
                  <th>Contact</th>
                  <th>Fee</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(d => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 700 }}>{d.full_name}</td>
                    <td><span className="badge badge-scheduled">{d.department_name}</span></td>
                    <td>{d.specialization} ({d.qualification})</td>
                    <td>{d.contact}</td>
                    <td style={{ fontWeight: 600 }}>${d.consultation_fee}</td>
                    <td>{d.availability}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Departments */}
      {activeTab === 'departments' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Hospital Departments</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Dept ID</th>
                  <th>Department Name</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(dept => (
                  <tr key={dept.id}>
                    <td>#{dept.id}</td>
                    <td style={{ fontWeight: 700 }}>{dept.name}</td>
                    <td>{dept.description || 'N/A'}</td>
                    <td><span className="badge badge-confirmed">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showDoctorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Register New Doctor</h3>
              <button className="close-btn" onClick={() => setShowDoctorModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddDoctor}>
              <div className="form-group">
                <label>Doctor Full Name *</label>
                <input type="text" className="form-control" required value={newDoctor.full_name} onChange={e => setNewDoctor({...newDoctor, full_name: e.target.value})} placeholder="e.g. Dr. Robert Vance" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" className="form-control" required value={newDoctor.email} onChange={e => setNewDoctor({...newDoctor, email: e.target.value})} placeholder="dr.vance@hospital.com" />
                </div>
                <div className="form-group">
                  <label>Initial Password *</label>
                  <input type="password" className="form-control" required value={newDoctor.password} onChange={e => setNewDoctor({...newDoctor, password: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Department *</label>
                  <select className="form-control" required value={newDoctor.department_id} onChange={e => setNewDoctor({...newDoctor, department_id: Number(e.target.value)})}>
                    {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Consultation Fee ($) *</label>
                  <input type="number" className="form-control" required value={newDoctor.consultation_fee} onChange={e => setNewDoctor({...newDoctor, consultation_fee: Number(e.target.value)})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Specialization *</label>
                  <input type="text" className="form-control" required value={newDoctor.specialization} onChange={e => setNewDoctor({...newDoctor, specialization: e.target.value})} placeholder="e.g. Interventional Cardiology" />
                </div>
                <div className="form-group">
                  <label>Qualification *</label>
                  <input type="text" className="form-control" required value={newDoctor.qualification} onChange={e => setNewDoctor({...newDoctor, qualification: e.target.value})} placeholder="e.g. MD, FACC" />
                </div>
              </div>
              <div className="form-group">
                <label>Contact Phone *</label>
                <input type="text" className="form-control" required value={newDoctor.contact} onChange={e => setNewDoctor({...newDoctor, contact: e.target.value})} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDoctorModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Doctor Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showDeptModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Create Department</h3>
              <button className="close-btn" onClick={() => setShowDeptModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddDept}>
              <div className="form-group">
                <label>Department Name *</label>
                <input type="text" className="form-control" required value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} placeholder="e.g. Oncology" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" value={newDept.description} onChange={e => setNewDept({...newDept, description: e.target.value})} placeholder="Overview of services..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeptModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Department</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

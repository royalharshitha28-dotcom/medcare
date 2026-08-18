import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, User, FileText, CheckCircle, Plus, Trash2, Pill, Activity } from 'lucide-react';

export const DoctorDashboard = () => {
  const { api, user } = useContext(AuthContext);

  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [activeTab, setActiveTab] = useState('appointments');

  // Consultation Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [consultData, setConsultData] = useState({
    symptoms: '',
    diagnosis: '',
    doctor_notes: '',
    vitals: 'BP: 120/80 mmHg, Temp: 98.6°F, HR: 72 bpm',
    follow_up_date: ''
  });

  const [prescriptionItems, setPrescriptionItems] = useState([
    { medicine_name: 'Amoxicillin 500mg', dosage: '1 Tablet', frequency: 'Twice daily', duration: '5 days', instructions: 'After meals' }
  ]);

  const [msg, setMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const appRes = await api.get('/api/appointments');
      setAppointments(appRes.data);
      const consRes = await api.get('/api/consultations');
      setConsultations(consRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const openConsultModal = (app) => {
    setSelectedApp(app);
    setConsultData({
      symptoms: app.reason || 'General malaise & consultation request',
      diagnosis: '',
      doctor_notes: '',
      vitals: 'BP: 120/80 mmHg, Temp: 98.6°F, HR: 72 bpm',
      follow_up_date: ''
    });
    setPrescriptionItems([
      { medicine_name: 'Paracetamol 500mg', dosage: '1 Tablet', frequency: 'Three times daily', duration: '3 days', instructions: 'Take after meals' }
    ]);
  };

  const addPrescriptionRow = () => {
    setPrescriptionItems([...prescriptionItems, { medicine_name: '', dosage: '', frequency: 'Twice daily', duration: '5 days', instructions: '' }]);
  };

  const removePrescriptionRow = (idx) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== idx));
  };

  const handlePrescriptionChange = (idx, field, val) => {
    const updated = [...prescriptionItems];
    updated[idx][field] = val;
    setPrescriptionItems(updated);
  };

  const handleSubmitConsultation = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setSubmitting(true);

    try {
      await api.post('/api/consultations', {
        appointment_id: selectedApp.id,
        symptoms: consultData.symptoms,
        diagnosis: consultData.diagnosis,
        doctor_notes: consultData.doctor_notes,
        vitals: consultData.vitals,
        follow_up_date: consultData.follow_up_date,
        prescriptions: prescriptionItems.filter(item => item.medicine_name.trim() !== '')
      });

      setMsg({ type: 'success', text: `Consultation completed for ${selectedApp.patient_name}! Prescription & Medical Record updated.` });
      setSelectedApp(null);
      fetchData();
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.detail || 'Failed to submit consultation' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Doctor Clinical Workbench</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Welcome back, {user?.full_name}. Manage patient consultations & prescriptions.</p>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <button
          className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('appointments')}
        >
          Patient Appointments ({appointments.length})
        </button>
        <button
          className={`btn ${activeTab === 'consultations' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('consultations')}
        >
          Completed Consultations ({consultations.length})
        </button>
      </div>

      {/* Appointments List */}
      {activeTab === 'appointments' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Scheduled Patient Appointments</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Appt ID</th>
                  <th>Patient Name</th>
                  <th>Date & Time</th>
                  <th>Reason / Symptoms</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', color: '#64748b' }}>No appointments found.</td></tr>
                ) : (
                  appointments.map(app => (
                    <tr key={app.id}>
                      <td>#{app.id}</td>
                      <td style={{ fontWeight: 700 }}>{app.patient_name}</td>
                      <td>{app.appointment_date} at <strong>{app.time_slot}</strong></td>
                      <td>{app.reason || 'General Consultation'}</td>
                      <td>
                        <span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span>
                      </td>
                      <td>
                        {app.status !== 'Completed' && app.status !== 'Cancelled' ? (
                          <button className="btn btn-primary btn-sm" onClick={() => openConsultModal(app)}>
                            <Activity size={14} /> Start Consultation
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>✓ Consultation Complete</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Consultations History */}
      {activeTab === 'consultations' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Consultations History</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Symptoms</th>
                  <th>Diagnosis</th>
                  <th>Vitals</th>
                  <th>Follow-up</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map(c => (
                  <tr key={c.id}>
                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 700 }}>{c.patient_name}</td>
                    <td>{c.symptoms}</td>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>{c.diagnosis}</td>
                    <td>{c.vitals || 'N/A'}</td>
                    <td>{c.follow_up_date || 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Consultation & Prescription Modal */}
      {selectedApp && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Patient Consultation: {selectedApp.patient_name}</h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Appt #{selectedApp.id} • {selectedApp.appointment_date}</div>
              </div>
              <button className="close-btn" onClick={() => setSelectedApp(null)}>×</button>
            </div>

            <form onSubmit={handleSubmitConsultation}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Chief Symptoms *</label>
                  <textarea className="form-control" required value={consultData.symptoms} onChange={e => setConsultData({...consultData, symptoms: e.target.value})} placeholder="Patient reported symptoms..." />
                </div>
                <div className="form-group">
                  <label>Clinical Diagnosis *</label>
                  <textarea className="form-control" required value={consultData.diagnosis} onChange={e => setConsultData({...consultData, diagnosis: e.target.value})} placeholder="Doctor diagnosis & findings..." />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Vitals Record</label>
                  <input type="text" className="form-control" value={consultData.vitals} onChange={e => setConsultData({...consultData, vitals: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Follow-Up Date (Optional)</label>
                  <input type="date" className="form-control" value={consultData.follow_up_date} onChange={e => setConsultData({...consultData, follow_up_date: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label>Doctor Notes / Instructions</label>
                <input type="text" className="form-control" value={consultData.doctor_notes} onChange={e => setConsultData({...consultData, doctor_notes: e.target.value})} placeholder="Additional lifestyle or diet instructions..." />
              </div>

              {/* Prescription Section */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Pill size={18} color="#2563eb" /> RX Prescription Items
                  </h4>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addPrescriptionRow}>
                    <Plus size={14} /> Add Medicine
                  </button>
                </div>

                {prescriptionItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 24px', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <input type="text" className="form-control" placeholder="Medicine Name" value={item.medicine_name} onChange={e => handlePrescriptionChange(idx, 'medicine_name', e.target.value)} required />
                    <input type="text" className="form-control" placeholder="Dosage (e.g. 1 tab)" value={item.dosage} onChange={e => handlePrescriptionChange(idx, 'dosage', e.target.value)} />
                    <input type="text" className="form-control" placeholder="Freq (e.g. 2x daily)" value={item.frequency} onChange={e => handlePrescriptionChange(idx, 'frequency', e.target.value)} />
                    <input type="text" className="form-control" placeholder="Duration (e.g. 5 days)" value={item.duration} onChange={e => handlePrescriptionChange(idx, 'duration', e.target.value)} />
                    <button type="button" onClick={() => removePrescriptionRow(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedApp(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Complete Consultation & Generate Rx'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

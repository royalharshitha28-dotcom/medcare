import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { UserPlus, Calendar, CreditCard, CheckCircle, Search, DollarSign, Plus } from 'lucide-react';

export const ReceptionistDashboard = () => {
  const { api } = useContext(AuthContext);

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [activeTab, setActiveTab] = useState('appointments');

  // Register Patient Modal
  const [showRegModal, setShowRegModal] = useState(false);
  const [regData, setRegData] = useState({
    full_name: '', email: '', password: 'patient123', contact: '', dob: '', gender: 'Male', blood_group: 'O+', address: ''
  });

  // Billing Modal
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Create Bill Modal
  const [showCreateBillModal, setShowCreateBillModal] = useState(false);
  const [newBill, setNewBill] = useState({
    patient_id: '', consultation_charge: 75.0, lab_charge: 0.0, other_charge: 0.0, discount: 0.0
  });

  const [msg, setMsg] = useState({ type: '', text: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const patRes = await api.get('/api/patients');
      setPatients(patRes.data);
      if (patRes.data.length > 0 && !newBill.patient_id) {
        setNewBill(prev => ({ ...prev, patient_id: patRes.data[0].id }));
      }
      const appRes = await api.get('/api/appointments');
      setAppointments(appRes.data);
      const billRes = await api.get('/api/bills');
      setBills(billRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    try {
      await api.post('/api/patients', regData);
      setMsg({ type: 'success', text: `Patient ${regData.full_name} registered successfully!` });
      setShowRegModal(false);
      fetchData();
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.detail || 'Registration failed' });
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.put(`/api/appointments/${appId}/status`, { status: newStatus });
      setMsg({ type: 'success', text: `Appointment status updated to ${newStatus}` });
      fetchData();
    } catch (err) {
      setMsg({ type: 'danger', text: 'Failed to update status' });
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/bills', newBill);
      setMsg({ type: 'success', text: 'Hospital Bill generated successfully!' });
      setShowCreateBillModal(false);
      fetchData();
    } catch (err) {
      setMsg({ type: 'danger', text: 'Failed to create bill' });
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/bills/${selectedBill.id}/payments`, {
        bill_id: selectedBill.id,
        amount: Number(paymentAmount),
        payment_method: paymentMethod
      });
      setMsg({ type: 'success', text: 'Payment recorded successfully!' });
      setSelectedBill(null);
      fetchData();
    } catch (err) {
      setMsg({ type: 'danger', text: 'Failed to record payment' });
    }
  };

  const filteredPatients = patients.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.contact.includes(search) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Receptionist / Front Desk Portal</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Patient intake, appointment confirmation & billing collection</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowCreateBillModal(true)}>
            <Plus size={16} /> Create Bill
          </button>
          <button className="btn btn-primary" onClick={() => setShowRegModal(true)}>
            <UserPlus size={16} /> Register Patient
          </button>
        </div>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <button className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('appointments')}>
          Appointments Management ({appointments.length})
        </button>
        <button className={`btn ${activeTab === 'billing' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('billing')}>
          Hospital Billing & Payments ({bills.length})
        </button>
        <button className={`btn ${activeTab === 'patients' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('patients')}>
          Patients Directory ({patients.length})
        </button>
      </div>

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Hospital Appointments Schedule</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Appt ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(app => (
                  <tr key={app.id}>
                    <td>#{app.id}</td>
                    <td style={{ fontWeight: 700 }}>{app.patient_name}</td>
                    <td>{app.doctor_name} ({app.department_name})</td>
                    <td>{app.appointment_date} at <strong>{app.time_slot}</strong></td>
                    <td><span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {app.status === 'Scheduled' && (
                          <button className="btn btn-success btn-sm" onClick={() => handleUpdateStatus(app.id, 'Confirmed')}>
                            <CheckCircle size={14} /> Confirm
                          </button>
                        )}
                        {app.status !== 'Cancelled' && app.status !== 'Completed' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleUpdateStatus(app.id, 'Cancelled')}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Bills & Revenue Records</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Patient Name</th>
                  <th>Consultation Fee</th>
                  <th>Lab Fee</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b.id}>
                    <td>#BILL-{b.id}</td>
                    <td style={{ fontWeight: 700 }}>{b.patient_name}</td>
                    <td>${b.consultation_charge}</td>
                    <td>${b.lab_charge}</td>
                    <td style={{ fontWeight: 700 }}>${b.total_amount}</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>${b.paid_amount}</td>
                    <td><span className={`badge badge-${b.status.toLowerCase().replace(' ', '')}`}>{b.status}</span></td>
                    <td>
                      {b.status !== 'Paid' ? (
                        <button className="btn btn-primary btn-sm" onClick={() => { setSelectedBill(b); setPaymentAmount(b.total_amount - b.paid_amount); }}>
                          <CreditCard size={14} /> Collect Payment
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>✓ Paid Full</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Registered Patients</h3>
            <input type="text" className="form-control" style={{ maxWidth: '280px' }} placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>DOB / Gender</th>
                  <th>Blood Group</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(p => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td style={{ fontWeight: 700 }}>{p.full_name}</td>
                    <td>{p.email}</td>
                    <td>{p.contact}</td>
                    <td>{p.dob || 'N/A'} ({p.gender || 'N/A'})</td>
                    <td><span className="badge badge-scheduled">{p.blood_group || 'N/A'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Register Patient Modal */}
      {showRegModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">New Patient Intake Registration</h3>
              <button className="close-btn" onClick={() => setShowRegModal(false)}>×</button>
            </div>
            <form onSubmit={handleRegisterPatient}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" className="form-control" required value={regData.full_name} onChange={e => setRegData({...regData, full_name: e.target.value})} placeholder="e.g. Alice Smith" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" className="form-control" required value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} placeholder="alice@gmail.com" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Contact Phone *</label>
                  <input type="text" className="form-control" required value={regData.contact} onChange={e => setRegData({...regData, contact: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Initial Password *</label>
                  <input type="password" className="form-control" required value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>DOB</label>
                  <input type="date" className="form-control" value={regData.dob} onChange={e => setRegData({...regData, dob: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select className="form-control" value={regData.gender} onChange={e => setRegData({...regData, gender: e.target.value})}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Blood Group</label>
                  <select className="form-control" value={regData.blood_group} onChange={e => setRegData({...regData, blood_group: e.target.value})}>
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRegModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {selectedBill && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Record Payment for #BILL-{selectedBill.id}</h3>
              <button className="close-btn" onClick={() => setSelectedBill(null)}>×</button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Patient: <strong>{selectedBill.patient_name}</strong></div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
                  Total Bill: ${selectedBill.total_amount} | Pending: ${selectedBill.total_amount - selectedBill.paid_amount}
                </div>
              </div>

              <div className="form-group">
                <label>Payment Amount ($) *</label>
                <input type="number" step="0.01" className="form-control" required value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Payment Method *</label>
                <select className="form-control" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card / Debit Card</option>
                  <option value="Insurance">Health Insurance</option>
                  <option value="UPI">UPI / Online Transfer</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedBill(null)}>Cancel</button>
                <button type="submit" className="btn btn-success">Confirm & Receive Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Bill Modal */}
      {showCreateBillModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Generate New Hospital Bill</h3>
              <button className="close-btn" onClick={() => setShowCreateBillModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateBill}>
              <div className="form-group">
                <label>Select Patient *</label>
                <select className="form-control" required value={newBill.patient_id} onChange={e => setNewBill({...newBill, patient_id: Number(e.target.value)})}>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.full_name} (#{p.id})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Consultation Charge ($)</label>
                  <input type="number" className="form-control" value={newBill.consultation_charge} onChange={e => setNewBill({...newBill, consultation_charge: Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Lab Charge ($)</label>
                  <input type="number" className="form-control" value={newBill.lab_charge} onChange={e => setNewBill({...newBill, lab_charge: Number(e.target.value)})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Other Charges ($)</label>
                  <input type="number" className="form-control" value={newBill.other_charge} onChange={e => setNewBill({...newBill, other_charge: Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Discount ($)</label>
                  <input type="number" className="form-control" value={newBill.discount} onChange={e => setNewBill({...newBill, discount: Number(e.target.value)})} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateBillModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

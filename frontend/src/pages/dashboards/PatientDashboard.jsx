import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { HospitalAds } from '../../components/HospitalAds';
import { Calendar, Pill, FileText, DollarSign, Plus, Clock, User, CheckCircle } from 'lucide-react';


export const PatientDashboard = () => {
  const { api, user } = useContext(AuthContext);

  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [records, setRecords] = useState([]);
  const [bills, setBills] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [activeTab, setActiveTab] = useState('appointments');
  const [showBookModal, setShowBookModal] = useState(false);

  // Booking Form
  const [booking, setBooking] = useState({
    department_id: '',
    doctor_id: '',
    appointment_date: new Date().toISOString().split('T')[0],
    time_slot: '10:00 AM',
    reason: ''
  });

  const [msg, setMsg] = useState({ type: '', text: '' });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchPatientData();
    fetchDepts();
  }, []);

  const fetchPatientData = async () => {
    try {
      const appRes = await api.get('/api/appointments');
      setAppointments(appRes.data);
      const rxRes = await api.get('/api/prescriptions');
      setPrescriptions(rxRes.data);
      const recRes = await api.get('/api/medical-records');
      setRecords(recRes.data);
      const billRes = await api.get('/api/bills');
      setBills(billRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDepts = async () => {
    try {
      const res = await api.get('/api/departments');
      setDepartments(res.data);
      if (res.data.length > 0) {
        setBooking(prev => ({ ...prev, department_id: res.data[0].id }));
        fetchDoctorsByDept(res.data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDoctorsByDept = async (deptId) => {
    try {
      const res = await api.get(`/api/doctors?department_id=${deptId}`);
      setDoctors(res.data);
      if (res.data.length > 0) {
        setBooking(prev => ({ ...prev, doctor_id: res.data[0].id }));
      } else {
        setBooking(prev => ({ ...prev, doctor_id: '' }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeptChange = (e) => {
    const deptId = Number(e.target.value);
    setBooking(prev => ({ ...prev, department_id: deptId }));
    fetchDoctorsByDept(deptId);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setBookingLoading(true);

    try {
      await api.post('/api/appointments', booking);
      setMsg({ type: 'success', text: 'Appointment booked successfully! Awaiting staff confirmation.' });
      setShowBookModal(false);
      fetchPatientData();
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.detail || 'Failed to book appointment' });
    } finally {
      setBookingLoading(false);
    }
  };

  const upcomingApps = appointments.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed');
  const pendingBillsCount = bills.filter(b => b.status !== 'Paid').length;

  return (
    <div>
      <HospitalAds />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>

        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Patient Health Portal</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Welcome back, {user?.full_name}. Track appointments, prescriptions & health history.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowBookModal(true)}>
          <Plus size={16} /> Book Appointment
        </button>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* Stat Cards */}
      <div className="grid-4">
        <div className="stat-card">
          <div className="stat-icon blue"><Calendar size={24} /></div>
          <div>
            <div className="stat-title">Upcoming Appointments</div>
            <div className="stat-value">{upcomingApps.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><Pill size={24} /></div>
          <div>
            <div className="stat-title">My Prescriptions</div>
            <div className="stat-value">{prescriptions.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon yellow"><FileText size={24} /></div>
          <div>
            <div className="stat-title">Medical Records</div>
            <div className="stat-value">{records.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red"><DollarSign size={24} /></div>
          <div>
            <div className="stat-title">Pending Bills</div>
            <div className="stat-value">{pendingBillsCount}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <button className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('appointments')}>
          My Appointments ({appointments.length})
        </button>
        <button className={`btn ${activeTab === 'prescriptions' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('prescriptions')}>
          Prescriptions ({prescriptions.length})
        </button>
        <button className={`btn ${activeTab === 'records' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('records')}>
          Medical Records ({records.length})
        </button>
        <button className={`btn ${activeTab === 'bills' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('bills')}>
          Billing & Payments ({bills.length})
        </button>
      </div>

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Your Appointments</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: '#64748b' }}>No appointments booked yet. Click 'Book Appointment' to schedule one!</td></tr>
                ) : (
                  appointments.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 700 }}>{a.appointment_date} at {a.time_slot}</td>
                      <td>{a.doctor_name}</td>
                      <td><span className="badge badge-scheduled">{a.department_name}</span></td>
                      <td>{a.reason || 'General Checkup'}</td>
                      <td><span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Prescriptions Tab */}
      {activeTab === 'prescriptions' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Prescribed Medications</h3>
          {prescriptions.length === 0 ? (
            <p style={{ color: '#64748b' }}>No prescriptions recorded yet.</p>
          ) : (
            prescriptions.map(rx => (
              <div key={rx.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 700, color: '#2563eb' }}>Prescribed by {rx.doctor_name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Date: {new Date(rx.created_at).toLocaleDateString()}</div>
                </div>
                <table className="table" style={{ background: 'white', borderRadius: '6px' }}>
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rx.items.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 700 }}>{item.medicine_name}</td>
                        <td>{item.dosage}</td>
                        <td>{item.frequency}</td>
                        <td>{item.duration}</td>
                        <td>{item.instructions || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      )}

      {/* Medical Records Tab */}
      {activeTab === 'records' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Health History & Consultation Summaries</h3>
          {records.length === 0 ? (
            <p style={{ color: '#64748b' }}>No medical history records available.</p>
          ) : (
            records.map(rec => (
              <div key={rec.id} style={{ borderLeft: '4px solid #2563eb', padding: '1rem', background: '#f8fafc', marginBottom: '1rem', borderRadius: '0 8px 8px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>{rec.title}</h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(rec.record_date).toLocaleDateString()}</span>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem', color: '#334155' }}>{rec.summary}</pre>
              </div>
            ))
          )}
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'bills' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Your Hospital Invoices & Receipts</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Consultation Fee</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th>Pending Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bills.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', color: '#64748b' }}>No billing invoices found.</td></tr>
                ) : (
                  bills.map(b => (
                    <tr key={b.id}>
                      <td>#BILL-{b.id}</td>
                      <td>${b.consultation_charge}</td>
                      <td style={{ fontWeight: 700 }}>${b.total_amount}</td>
                      <td style={{ color: '#10b981', fontWeight: 600 }}>${b.paid_amount}</td>
                      <td style={{ color: '#ef4444', fontWeight: 600 }}>${(b.total_amount - b.paid_amount).toFixed(2)}</td>
                      <td><span className={`badge badge-${b.status.toLowerCase().replace(' ', '')}`}>{b.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Book Doctor Appointment</h3>
              <button className="close-btn" onClick={() => setShowBookModal(false)}>×</button>
            </div>
            <form onSubmit={handleBookAppointment}>
              <div className="form-group">
                <label>Department *</label>
                <select className="form-control" value={booking.department_id} onChange={handleDeptChange} required>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Doctor *</label>
                <select className="form-control" value={booking.doctor_id} onChange={e => setBooking({...booking, doctor_id: Number(e.target.value)})} required>
                  {doctors.length === 0 ? (
                    <option value="">No active doctors in this department</option>
                  ) : (
                    doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.full_name} ({doc.specialization}) - Fee: ${doc.consultation_fee}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Appointment Date *</label>
                  <input type="date" className="form-control" required value={booking.appointment_date} min={new Date().toISOString().split('T')[0]} onChange={e => setBooking({...booking, appointment_date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Time Slot *</label>
                  <select className="form-control" value={booking.time_slot} onChange={e => setBooking({...booking, time_slot: e.target.value})}>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Reason for Visit</label>
                <textarea className="form-control" value={booking.reason} onChange={e => setBooking({...booking, reason: e.target.value})} placeholder="Describe symptoms or purpose of checkup..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBookModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={bookingLoading || !booking.doctor_id}>
                  {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

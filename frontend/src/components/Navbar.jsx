import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Activity, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  const roleColors = {
    admin: '#ef4444',
    doctor: '#2563eb',
    staff: '#10b981',
    patient: '#8b5cf6'
  };

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      padding: '0.875rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img
          src="/hospital_logo.png"
          alt="MedCare Hospital Logo"
          style={{
            height: '42px',
            width: '42px',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
          }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>MedCare HMS</h1>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Hospital Operations Platform</span>
        </div>
      </div>


      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#334155'
            }}>
              <UserIcon size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>{user.full_name}</div>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                color: 'white',
                background: roleColors[user.role] || '#64748b'
              }}>
                {user.role === 'staff' ? 'Receptionist / Staff' : user.role}
              </span>
            </div>
          </div>

          <button onClick={logout} className="btn btn-secondary btn-sm" style={{ gap: '0.375rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
};

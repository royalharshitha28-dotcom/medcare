import React, { useState, useEffect } from 'react';
import { Heart, PhoneCall, ShieldAlert, Award, ArrowRight, Sparkles } from 'lucide-react';

export const HospitalAds = () => {
  const [activeAd, setActiveAd] = useState(0);

  const ads = [
    {
      id: 1,
      title: "Free Cardiac Health Screening Camp",
      badge: "SPECIAL PROMOTION • 20% OFF",
      bgGradient: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
      icon: <Heart size={28} color="#f43f5e" />,
      description: "Comprehensive Heart Wellness package including ECG, Lipid Profile & Senior Specialist Consultation.",
      cta: "Book Checkup",
      tag: "Limited Seats Available"
    },
    {
      id: 2,
      title: "24/7 Trauma & Emergency Helpline",
      badge: "CRITICAL CARE • INSTANT RESPONSE",
      bgGradient: "linear-gradient(135deg, #065f46 0%, #059669 100%)",
      icon: <PhoneCall size={28} color="#34d399" />,
      description: "State-of-the-art ICU ambulances & trauma specialists on standby round the clock. Emergency: 1800-MEDCARE.",
      cta: "Call Helpline",
      tag: "Toll Free Hotline"
    },
    {
      id: 3,
      title: "Pediatric Wellness & Vaccination Drive",
      badge: "CHILD HEALTH CARE",
      bgGradient: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)",
      icon: <Award size={28} color="#c084fc" />,
      description: "Full growth tracking, developmental screening and routine immunizations by top pediatric doctors.",
      cta: "Schedule Child Visit",
      tag: "Walk-ins Welcome"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAd((prev) => (prev + 1) % ads.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const current = ads[activeAd];

  return (
    <div style={{
      background: current.bgGradient,
      borderRadius: '12px',
      padding: '1.5rem 2rem',
      color: 'white',
      marginBottom: '1.5rem',
      boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.25)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.5s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1', minWidth: '280px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(4px)',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.725rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            marginBottom: '0.75rem'
          }}>
            <Sparkles size={14} color="#fef08a" /> {current.badge}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>
              {current.icon}
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>{current.title}</h3>
          </div>

          <p style={{ opacity: 0.9, fontSize: '0.925rem', maxWidth: '650px', lineHeight: 1.4 }}>
            {current.description}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 600 }}>{current.tag}</span>
          <button style={{
            background: 'white',
            color: '#0f172a',
            fontWeight: 800,
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            {current.cta} <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Slide dots indicator */}
      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem', justifyContent: 'center' }}>
        {ads.map((ad, idx) => (
          <div
            key={ad.id}
            onClick={() => setActiveAd(idx)}
            style={{
              width: idx === activeAd ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: idx === activeAd ? 'white' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          />
        ))}
      </div>
    </div>
  );
};

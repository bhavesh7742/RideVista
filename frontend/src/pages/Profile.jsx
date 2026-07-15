import React from 'react';
import { useSelector } from 'react-redux';
import { User, Mail, Phone, Shield, Compass, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8" style={{ color: 'var(--rv-text)' }}>
      <div className="max-w-xl mx-auto space-y-8">

        {/* Title */}
        <div className="text-center space-y-2 rv-animate-fadeUp">
          <span className="rv-badge rv-badge-accent">Personal Space</span>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--rv-text)' }}>Your Account Profile</h1>
          <p className="text-sm" style={{ color: 'var(--rv-text-secondary)' }}>Manage your tourist profile info and credentials</p>
        </div>

        {/* Profile Card */}
        <div className="rv-card p-8 relative overflow-hidden rv-animate-fadeUp rv-delay-1">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-2xl"
            style={{ background: 'radial-gradient(circle, rgba(244,180,0,0.04) 0%, transparent 70%)' }} />

          {/* User Icon */}
          <div className="flex items-center gap-4 pb-6 mb-6" style={{ borderBottom: '1px solid var(--rv-border)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'var(--rv-accent-glow)', border: '1px solid rgba(244,180,0,0.2)' }}>
              <User className="w-8 h-8" style={{ color: 'var(--rv-accent)' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--rv-text)' }}>{user?.name}</h2>
              <span className="rv-badge rv-badge-accent mt-1 tracking-wider capitalize">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 text-[13px]">
            {[
              { icon: Mail, label: 'Email Address', value: user?.email },
              { icon: Phone, label: 'Phone Number', value: user?.phone || 'Not provided' },
              { icon: Shield, label: 'Security Role', value: 'Tourist Account (Offline Rental & Coordinator permissions)' }
            ].map(({ icon: Ic, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <Ic className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--rv-accent)' }} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--rv-text-muted)' }}>{label}</p>
                  <p className="font-medium" style={{ color: 'var(--rv-text-secondary)' }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-6 mt-6 flex flex-col sm:flex-row gap-3" style={{ borderTop: '1px solid var(--rv-border)' }}>
            <Link to="/search" className="rv-btn rv-btn-primary rv-btn-sm flex-1 cursor-pointer">
              <Compass className="w-3.5 h-3.5" /> Explore Vehicles
            </Link>
            <Link to="/dashboard" className="rv-btn rv-btn-secondary rv-btn-sm flex-1 cursor-pointer">
              <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--rv-accent)' }} /> View Requests
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;

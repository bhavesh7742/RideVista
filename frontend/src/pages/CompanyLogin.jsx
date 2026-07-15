import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearErrors } from '../features/authSlice';
import { Mail, Lock, LogIn, Building2 } from 'lucide-react';
import AuthLayout, { AuthField, AuthSubmit } from '../components/AuthLayout';

const CompanyLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [successMsg, setSuccessMsg] = useState(location.state?.successMessage || null);
  const { isAuthenticated, isLoading, error, user } = useSelector((state) => state.auth);

  useEffect(() => { dispatch(clearErrors()); return () => dispatch(clearErrors()); }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role !== 'rental_company') { navigate('/'); return; }
      navigate('/company/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = (e) => { e.preventDefault(); if (!email || !password) return; dispatch(loginUser({ email, password })); };

  return (
    <AuthLayout
      badge={{ icon: Building2, text: 'Business Login' }}
      title="Company Sign In"
      subtitle="Access your fleet management console"
      error={error}
      successMsg={successMsg}
      footer={
        <div className="space-y-4">
          <div className="rv-card-static p-3.5 text-left">
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5" style={{ color: 'var(--rv-accent)' }}>
              💡 Prospective Pilots / Drivers
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--rv-text-muted)' }}>
              Want to become a driver? Please visit our office to complete document verification and receive your Company ID.
            </p>
          </div>
          <p>Don't have a business account?{' '}<Link to="/register/company" className="font-semibold transition-colors" style={{ color: 'var(--rv-accent)' }}>Register here</Link></p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField label="Email Address" icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="company@example.com" />
        <AuthField label="Password" icon={Lock} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        <AuthSubmit isLoading={isLoading} loadingText="Signing In..."><LogIn className="w-[18px] h-[18px]" /> Sign In</AuthSubmit>
      </form>
    </AuthLayout>
  );
};

export default CompanyLogin;

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearErrors } from '../features/authSlice';
import { Mail, Lock, LogIn, Briefcase, Building2 } from 'lucide-react';
import AuthLayout, { AuthField, AuthSubmit } from '../components/AuthLayout';

const DriverLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyId, setCompanyId] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, error, user } = useSelector((state) => state.auth);
  const from = location.state?.from?.pathname || '/driver/dashboard';

  useEffect(() => { dispatch(clearErrors()); return () => dispatch(clearErrors()); }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role !== 'driver') { navigate('/'); return; }
      navigate(from !== '/' ? from : '/driver/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleSubmit = (e) => { e.preventDefault(); if (!email || !password || !companyId) return; dispatch(loginUser({ email, password, companyId })); };

  return (
    <AuthLayout
      badge={{ icon: Briefcase, text: 'Pilot Login' }}
      title="Welcome Back"
      subtitle="Sign in to your pilot portal"
      error={error}
      footer={<>Don't have an account?{' '}<Link to="/register/driver" className="font-semibold transition-colors" style={{ color: 'var(--rv-accent)' }}>Register here</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField label="Company ID" icon={Building2} value={companyId} onChange={(e) => setCompanyId(e.target.value)} placeholder="RV-COMP-XXXXX" />
        <AuthField label="Email Address" icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pilot@example.com" />
        <AuthField label="Password" icon={Lock} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        <AuthSubmit isLoading={isLoading} loadingText="Signing In..."><LogIn className="w-[18px] h-[18px]" /> Sign In</AuthSubmit>
      </form>
    </AuthLayout>
  );
};

export default DriverLogin;

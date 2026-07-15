import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearErrors } from '../features/authSlice';
import { Mail, Lock, LogIn, ShieldAlert } from 'lucide-react';
import AuthLayout, { AuthField, AuthSubmit } from '../components/AuthLayout';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error, user } = useSelector((state) => state.auth);

  useEffect(() => { dispatch(clearErrors()); return () => dispatch(clearErrors()); }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role !== 'admin') { navigate('/'); return; }
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = (e) => { e.preventDefault(); if (!email || !password) return; dispatch(loginUser({ email, password })); };

  return (
    <AuthLayout
      badge={{ icon: ShieldAlert, text: 'Admin Console', variant: 'danger' }}
      title="Admin Login"
      subtitle="Restricted access — platform administrators only"
      error={error}
      footer={<span style={{ color: 'var(--rv-text-muted)' }}>Admin accounts are pre-configured. No public registration is available for this role.</span>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField label="Admin Email" icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@ridevista.com" />
        <AuthField label="Admin Password" icon={Lock} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        <AuthSubmit isLoading={isLoading} loadingText="Signing In..."><LogIn className="w-[18px] h-[18px]" /> Access Admin Panel</AuthSubmit>
      </form>
    </AuthLayout>
  );
};

export default AdminLogin;

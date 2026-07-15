import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearErrors } from '../features/authSlice';
import { Mail, Lock, LogIn, User } from 'lucide-react';
import AuthLayout, { AuthField, AuthSubmit } from '../components/AuthLayout';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, error, user } = useSelector((state) => state.auth);
  const from = location.state?.from?.pathname || '/';

  useEffect(() => { dispatch(clearErrors()); return () => dispatch(clearErrors()); }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role !== 'user') { navigate('/'); return; }
      navigate(from !== '/' ? from : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleSubmit = (e) => { e.preventDefault(); if (!email || !password) return; dispatch(loginUser({ email, password })); };

  return (
    <AuthLayout
      badge={{ icon: User, text: 'Tourist Login' }}
      title="Welcome Back"
      subtitle="Sign in to your tourist account"
      error={error}
      footer={<>Don't have an account?{' '}<Link to="/register/user" className="font-semibold transition-colors" style={{ color: 'var(--rv-accent)' }}>Register here</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField label="Email Address" icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <AuthField label="Password" icon={Lock} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        <AuthSubmit isLoading={isLoading} loadingText="Signing In..."><LogIn className="w-[18px] h-[18px]" /> Sign In</AuthSubmit>
      </form>
    </AuthLayout>
  );
};

export default UserLogin;

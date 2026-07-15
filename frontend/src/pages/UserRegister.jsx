import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearErrors } from '../features/authSlice';
import { User, Mail, Lock, Phone, UserCheck } from 'lucide-react';
import AuthLayout, { AuthField, AuthSubmit } from '../components/AuthLayout';

const UserRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error, user } = useSelector((state) => state.auth);

  useEffect(() => { dispatch(clearErrors()); return () => dispatch(clearErrors()); }, [dispatch]);
  useEffect(() => { if (isAuthenticated && user) navigate('/dashboard'); }, [isAuthenticated, user, navigate]);

  const handleSubmit = (e) => { e.preventDefault(); if (!name || !email || !password) return; dispatch(registerUser({ name, email, password, role: 'user', phone })); };

  return (
    <AuthLayout
      badge={{ icon: User, text: 'Tourist Account' }}
      title="Create Tourist Account"
      subtitle="Sign up to explore and rent vehicles across cities"
      error={error}
      footer={<>Already have an account?{' '}<Link to="/login/user" className="font-semibold transition-colors" style={{ color: 'var(--rv-accent)' }}>Sign In</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField label="Full Name" icon={UserCheck} value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
        <AuthField label="Email Address" icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
        <AuthField label="Phone Number (Optional)" icon={Phone} type="tel" required={false} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
        <AuthField label="Password" icon={Lock} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" />
        <AuthSubmit isLoading={isLoading} loadingText="Registering..."><UserCheck className="w-[18px] h-[18px]" /> Create Account</AuthSubmit>
      </form>
    </AuthLayout>
  );
};

export default UserRegister;

import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Layout = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'rental_company') {
        navigate('/company/dashboard', { replace: true });
      } else if (user.role === 'driver') {
        navigate('/driver/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="rv-noise flex flex-col min-h-screen antialiased" style={{ background: 'var(--rv-bg)', color: 'var(--rv-text)' }}>

      {/* Ambient background blobs — subtle, never distracting */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Top-left warm glow */}
        <div
          className="rv-ambient-blob"
          style={{
            width: 600, height: 600,
            top: '-10%', left: '-5%',
            background: 'radial-gradient(circle, rgba(244,180,0,0.04) 0%, transparent 70%)',
          }}
        />
        {/* Bottom-right cool glow */}
        <div
          className="rv-ambient-blob"
          style={{
            width: 500, height: 500,
            bottom: '-5%', right: '-5%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.03) 0%, transparent 70%)',
            animationDelay: '3s',
          }}
        />
        {/* Centre subtle accent */}
        <div
          className="rv-ambient-blob"
          style={{
            width: 800, height: 800,
            top: '30%', left: '40%',
            background: 'radial-gradient(circle, rgba(244,180,0,0.02) 0%, transparent 70%)',
            animationDelay: '1.5s',
          }}
        />

        {/* Fine grid overlay */}
        <div className="absolute inset-0 rv-grid-bg opacity-40" />
      </div>

      {/* Fixed Navbar */}
      <Navbar />

      {/* Main Content Area — offset for fixed navbar (h-16 = 64px) */}
      <main className="flex-grow pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;

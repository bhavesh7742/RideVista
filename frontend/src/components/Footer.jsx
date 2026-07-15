import React, { useState } from 'react';
import { Car, Send, MessageSquare } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { showToast } from '../features/notificationSlice';

const Footer = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('feedback');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDashboard = location.pathname.includes('/dashboard') || location.pathname.includes('/company/dashboard') || location.pathname.includes('/driver/dashboard') || location.pathname.includes('/admin/dashboard');

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      dispatch(showToast({ message: 'Please fill out all fields', type: 'error' }));
      return;
    }
    setIsSubmitting(true);
    try {
      await axiosInstance.post('/feedback', { subject, category, description });
      setSubject('');
      setCategory('feedback');
      setDescription('');
      dispatch(showToast({ message: 'Feedback submitted successfully. Thank you!', type: 'success' }));
    } catch (error) {
      dispatch(showToast({ message: error.response?.data?.message || 'Failed to submit feedback', type: 'error' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--rv-border)',
    color: 'var(--rv-text)',
    borderRadius: 'var(--rv-radius-md)',
    padding: '10px 14px',
    fontSize: 13,
    transition: 'border-color 200ms ease, box-shadow 200ms ease',
    outline: 'none',
    width: '100%',
  };

  const inputFocusHandler = (e) => {
    e.target.style.borderColor = 'rgba(244,180,0,0.35)';
    e.target.style.boxShadow = '0 0 0 3px rgba(244,180,0,0.06)';
  };
  const inputBlurHandler = (e) => {
    e.target.style.borderColor = 'var(--rv-border)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <footer className="mt-auto" style={{ borderTop: '1px solid var(--rv-border)' }}>

      {/* ── Dashboard Feedback Form ────────────────── */}
      {isAuthenticated && isDashboard && (
        <div
          className="py-10 px-4 sm:px-6 lg:px-8"
          style={{ background: 'var(--rv-bg-alt)' }}
        >
          <div
            className="rv-card-static max-w-3xl mx-auto p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg" style={{ background: 'var(--rv-accent-glow)' }}>
                <MessageSquare className="w-4 h-4" style={{ color: 'var(--rv-accent)' }} />
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--rv-text)' }}>Share Your Feedback</h3>
                <p className="text-[11px]" style={{ color: 'var(--rv-text-muted)' }}>
                  Encountered a bug or have a suggestion? Tell our system administrators directly.
                </p>
              </div>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Subject / Topic"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={inputStyle}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
                required
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
              >
                <option value="feedback" style={{ background: '#0c0d11' }}>General Feedback</option>
                <option value="suggestion" style={{ background: '#0c0d11' }}>Suggestion</option>
                <option value="bug_report" style={{ background: '#0c0d11' }}>Bug Report</option>
                <option value="support_request" style={{ background: '#0c0d11' }}>Support Request</option>
              </select>

              <div className="sm:col-span-2">
                <textarea
                  placeholder="Describe your feedback, suggestion or request in detail..."
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                  required
                />
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rv-btn rv-btn-primary rv-btn-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Sending…' : 'Send Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Footer Bottom Bar ─────────────────────── */}
      <div
        className="py-8 px-4 sm:px-6 lg:px-8"
        style={{ background: 'var(--rv-bg)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: 'var(--rv-accent-glow)', border: '1px solid rgba(244,180,0,0.1)' }}>
              <Car className="h-3.5 w-3.5" style={{ color: 'var(--rv-accent)' }} />
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--rv-text)' }}>
              Ride<span style={{ color: 'var(--rv-accent)' }}>Vista</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-[13px]" style={{ color: 'var(--rv-text-muted)' }}>
            {[
              { href: '/search', label: 'Find Rentals' },
              { href: '/register/company', label: 'Register Business' },
              { href: '/login/company', label: 'Partner Sign In' },
            ].map((link, i) => (
              <React.Fragment key={link.href}>
                {i > 0 && <span className="w-px h-3 inline-block" style={{ background: 'var(--rv-border)' }} />}
                <a
                  href={link.href}
                  className="transition-colors duration-200"
                  style={{ color: 'var(--rv-text-muted)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--rv-accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--rv-text-muted)'}
                >
                  {link.label}
                </a>
              </React.Fragment>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-[11px]" style={{ color: 'var(--rv-text-muted)' }}>
            &copy; {new Date().getFullYear()} RideVista. Built for software engineering placements. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

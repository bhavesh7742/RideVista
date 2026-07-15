import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser, logout } from '../features/authSlice';
import axiosInstance from '../api/axiosInstance';
import { showToast } from '../features/notificationSlice';
import { Building2, MapPin, Phone, Map, ShieldCheck, AlertCircle, User, Mail, FileText, Image, LogOut } from 'lucide-react';

const CompanySetup = () => {
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [gpsTrackingAvailable, setGpsTrackingAvailable] = useState(false);
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const inputStyle = {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--rv-border)',
    color: 'var(--rv-text)',
    outline: 'none',
    transition: 'all 0.2s ease',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '12px',
  };

  const focusIn = (e) => {
    e.target.style.borderColor = 'var(--rv-accent)';
    e.target.style.boxShadow = '0 0 0 1px var(--rv-accent)';
  };

  const focusOut = (e) => {
    e.target.style.borderColor = 'var(--rv-border)';
    e.target.style.boxShadow = 'none';
  };

  // Redirect if they already have a company set up
  useEffect(() => {
    if (user?.company) {
      navigate('/company/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !city || !address || !googleMapsLink || !ownerName || !ownerPhone || !managerName || !managerPhone || !email || !description) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('city', city);
      formData.append('address', address);
      formData.append('phone', ownerPhone);
      formData.append('googleMapsLink', googleMapsLink);
      formData.append('gpsTrackingAvailable', gpsTrackingAvailable);
      formData.append('description', description);
      formData.append('ownerName', ownerName);
      formData.append('ownerPhone', ownerPhone);
      formData.append('managerName', managerName);
      formData.append('managerPhone', managerPhone);
      formData.append('email', email);

      if (logo) {
        formData.append('logo', logo);
      }

      await axiosInstance.post('/companies', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Reload user profile in Redux so state knows company exists
      dispatch(loadUser());
      navigate('/company/dashboard');
    } catch (err) {
      console.error('Setup Company Error:', err);
      let errorMsg = 'Failed to create business profile';
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMsgs = err.response.data.errors.map(e => e.message).join(', ');
        errorMsg = `Validation failed: ${errorMsgs}`;
      } else {
        errorMsg = err.response?.data?.message || 'Failed to create business profile';
      }
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0c10] px-4 py-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl -z-10 animate-pulse"></div>

      <div className="w-full max-w-3xl bg-[#1f2833]/25 backdrop-blur-xl border p-8 rounded-2xl shadow-2xl relative pt-16 sm:pt-8"
        style={{ borderColor: 'var(--rv-border)' }}>
        <div className="absolute top-6 right-6">
          <button
            onClick={() => {
              dispatch(logout());
              navigate('/login/company');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ background: 'var(--rv-accent-glow)', border: '1px solid rgba(244,180,0,0.15)', color: 'var(--rv-accent)' }}>
            Business Onboarding
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Register Your Rental Company
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--rv-text-muted)' }}>
            Provide details about your rental business to complete registration and access the dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl text-sm animate-fadeIn"
            style={{ background: 'var(--rv-danger-bg)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--rv-danger)' }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Setup Failed:</span> {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="pb-4" style={{ borderBottom: '1px solid var(--rv-border)' }}>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">🏢 Company Identity Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Company Name *</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: 'var(--rv-text-muted)' }} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marwar Car Rentals"
                  style={{ ...inputStyle, paddingLeft: '44px' }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Business Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: 'var(--rv-text-muted)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. contact@marwarrentals.com"
                  style={{ ...inputStyle, paddingLeft: '44px' }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>
            </div>
          </div>

          <div className="pb-4 pt-2" style={{ borderBottom: '1px solid var(--rv-border)' }}>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">👥 Key Personnel Contacts</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Owner Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Owner Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: 'var(--rv-text-muted)' }} />
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Owner Name"
                  style={{ ...inputStyle, paddingLeft: '44px' }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>
            </div>

            {/* Owner Phone */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Owner Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: 'var(--rv-text-muted)' }} />
                <input
                  type="tel"
                  required
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="e.g. +91 99988 87776"
                  style={{ ...inputStyle, paddingLeft: '44px' }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>
            </div>

            {/* Manager Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Manager Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: 'var(--rv-text-muted)' }} />
                <input
                  type="text"
                  required
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="Manager Name"
                  style={{ ...inputStyle, paddingLeft: '44px' }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>
            </div>

            {/* Manager Phone */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Manager Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: 'var(--rv-text-muted)' }} />
                <input
                  type="tel"
                  required
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  placeholder="e.g. +91 98888 77776"
                  style={{ ...inputStyle, paddingLeft: '44px' }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>
            </div>
          </div>

          <div className="pb-4 pt-2" style={{ borderBottom: '1px solid var(--rv-border)' }}>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">📍 Operations & Location</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Operating City */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Operating City *</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: 'var(--rv-text-muted)' }} />
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Jodhpur"
                  style={{ ...inputStyle, paddingLeft: '44px' }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>
            </div>

            {/* Google Maps link */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Google Maps Location Link *</label>
              <div className="relative">
                <Map className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: 'var(--rv-text-muted)' }} />
                <input
                  type="url"
                  required
                  value={googleMapsLink}
                  onChange={(e) => setGoogleMapsLink(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  style={{ ...inputStyle, paddingLeft: '44px' }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Complete Address *</label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Provide exact physical address of your main office..."
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={focusIn}
              onBlur={focusOut}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Company Advertisement Description *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell tourists about your heritage fleet specialties and support hours..."
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={focusIn}
              onBlur={focusOut}
            />
          </div>

          <div className="pb-4 pt-2" style={{ borderBottom: '1px solid var(--rv-border)' }}>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">📄 Company Branding Assets</h3>
          </div>

          {/* Logo */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Upload Company Logo (Optional)</label>
            <div className="relative">
              <Image className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: 'var(--rv-text-muted)' }} />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogo(e.target.files[0])}
                style={{ ...inputStyle, paddingLeft: '44px' }}
              />
            </div>
          </div>

          {/* GPS Toggle */}
          <div className="p-4 rounded-xl border flex items-center justify-between"
            style={{ background: 'rgba(0,0,0,0.15)', borderColor: 'var(--rv-border)' }}>
            <div className="space-y-0.5 pr-4">
              <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" style={{ color: 'var(--rv-accent)' }} />
                Fleet GPS Tracking
              </h4>
              <p className="text-[10px]" style={{ color: 'var(--rv-text-muted)' }}>
                Does your company manage vehicle location mapping using your own external 3rd-party GPS hardware?
              </p>
            </div>
            <button
              type="button"
              onClick={() => setGpsTrackingAvailable(!gpsTrackingAvailable)}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${gpsTrackingAvailable ? 'bg-yellow-500' : 'bg-gray-700'}`}
            >
              <div
                className={`bg-gray-900 w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${gpsTrackingAvailable ? 'translate-x-6 bg-gray-900' : 'translate-x-0 bg-white'}`}
              />
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center rv-btn rv-btn-primary cursor-pointer mt-6"
            style={{ padding: '12px 16px' }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="rv-spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></div>
                <span>Submitting...</span>
              </div>
            ) : (
              'Complete Registration & Setup Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompanySetup;

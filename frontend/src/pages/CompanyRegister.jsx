import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
import axiosInstance from '../api/axiosInstance';
import {
  Building2, Mail, Lock, Phone, UserCheck, AlertCircle,
  MapPin, Map, ShieldCheck, FileText, Image, ArrowRight, ArrowLeft
} from 'lucide-react';
import { AuthField } from '../components/AuthLayout';

const inputStyle = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--rv-border)',
  borderRadius: 'var(--rv-radius-md)', color: 'var(--rv-text)',
  fontSize: 13, transition: 'border-color 200ms ease, box-shadow 200ms ease', outline: 'none',
};
const inputWithIcon = { ...inputStyle, paddingLeft: 40 };
const focusIn = (e) => { e.target.style.borderColor = 'rgba(244,180,0,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(244,180,0,0.08)'; };
const focusOut = (e) => { e.target.style.borderColor = 'var(--rv-border)'; e.target.style.boxShadow = 'none'; };

const CompanyRegister = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');

  const [name, setName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [city, setCity] = useState('');

  const [address, setAddress] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [description, setDescription] = useState('');
  const [gpsTrackingAvailable, setGpsTrackingAvailable] = useState(false);
  const [logo, setLogo] = useState(null);
  const [verificationDocs, setVerificationDocs] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Logged-in user guard
  if (isAuthenticated && user?.role === 'user') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="rv-ambient-blob" style={{ width: 500, height: 500, top: '15%', left: '20%', background: 'radial-gradient(circle, rgba(244,180,0,0.04) 0%, transparent 70%)' }} />
        <div className="rv-glass w-full max-w-md p-6 space-y-6 rv-animate-scaleIn" style={{ boxShadow: 'var(--rv-shadow-xl)' }}>
          <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--rv-border)' }}>
            <div className="p-2 rounded-xl" style={{ background: 'var(--rv-accent-glow)', border: '1px solid rgba(244,180,0,0.15)' }}>
              <Building2 className="w-6 h-6" style={{ color: 'var(--rv-accent)' }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--rv-text)' }}>Switch to Rental Business Registration?</h2>
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--rv-text-secondary)' }}>
            You are currently logged in as a User. To register a rental business, you must first log out. Would you like to continue?
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => navigate(-1)} className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer">Cancel</button>
            <button onClick={() => dispatch(logout())} className="rv-btn rv-btn-primary rv-btn-sm cursor-pointer">Continue</button>
          </div>
        </div>
      </div>
    );
  }

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!ownerName || !email || !password || !ownerPhone) { setError('Please fill in all owner profile fields.'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    } else if (step === 2) {
      if (!name || !companyEmail || !managerName || !managerPhone || !city) { setError('Please fill in all company information fields.'); return; }
    }
    setError(null); setStep(step + 1);
  };

  const handlePrevStep = () => { setError(null); setStep(step - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address || !googleMapsLink || !description) { setError('Please fill in all required location and description fields.'); return; }
    setIsLoading(true); setError(null);
    try {
      const formData = new FormData();
      formData.append('role', 'rental_company');
      formData.append('ownerName', ownerName); formData.append('email', email); formData.append('password', password); formData.append('ownerPhone', ownerPhone);
      formData.append('name', name); formData.append('companyEmail', companyEmail); formData.append('managerName', managerName); formData.append('managerPhone', managerPhone); formData.append('city', city);
      formData.append('address', address); formData.append('googleMapsLink', googleMapsLink); formData.append('gpsTrackingAvailable', gpsTrackingAvailable); formData.append('description', description);
      if (logo) formData.append('logo', logo);
      if (verificationDocs?.length > 0) { for (let i = 0; i < verificationDocs.length; i++) formData.append('verificationDocs', verificationDocs[i]); }
      await axiosInstance.post('/auth/register', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/login/company', { state: { successMessage: 'Rental Business registered successfully! Please log in to access your dashboard.' } });
    } catch (err) { console.error('Registration error:', err); setError(err.response?.data?.message || 'Server error during business registration. Please try again.'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden py-12">
      <div className="rv-ambient-blob" style={{ width: 500, height: 500, top: '10%', left: '15%', background: 'radial-gradient(circle, rgba(244,180,0,0.05) 0%, transparent 70%)' }} />
      <div className="rv-ambient-blob" style={{ width: 400, height: 400, bottom: '10%', right: '15%', background: 'radial-gradient(circle, rgba(59,130,246,0.03) 0%, transparent 70%)', animationDelay: '2s' }} />

      <div className="w-full max-w-2xl rv-glass p-8 rv-animate-scaleIn" style={{ boxShadow: 'var(--rv-shadow-xl)' }}>
        <div className="text-center mb-8">
          <span className="rv-badge rv-badge-accent mb-4 inline-flex"><Building2 className="w-3.5 h-3.5" /> Step {step} of 3</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--rv-text)' }}>Register Rental Business</h2>
          <p className="text-[13px] mt-2" style={{ color: 'var(--rv-text-muted)' }}>
            {step === 1 && 'Create your owner login profile credentials'}
            {step === 2 && 'Provide basic company profile details'}
            {step === 3 && 'Submit location coordinates and verification files'}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl text-[13px]" style={{ background: 'var(--rv-danger-bg)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--rv-danger)' }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /><div><span className="font-semibold">Setup Failed:</span> {error}</div>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AuthField label="Owner Full Name *" icon={UserCheck} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Full Name" />
              <AuthField label="Owner Phone Number *" icon={Phone} type="tel" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
            </div>
            <AuthField label="Owner Login Email *" icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@example.com" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AuthField label="Password *" icon={Lock} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" />
              <AuthField label="Confirm Password *" icon={Lock} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" />
            </div>
            <button type="submit" className="w-full rv-btn rv-btn-primary cursor-pointer mt-6" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Continue to Business Profile <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AuthField label="Company Name *" icon={Building2} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Heritage Rajasthan Tours" />
              <AuthField label="Company Business Email *" icon={Mail} type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} placeholder="contact@heritagecompany.com" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AuthField label="Manager Full Name *" icon={UserCheck} value={managerName} onChange={(e) => setManagerName(e.target.value)} placeholder="Manager Name" />
              <AuthField label="Manager Phone Number *" icon={Phone} type="tel" value={managerPhone} onChange={(e) => setManagerPhone(e.target.value)} placeholder="Manager Phone" />
            </div>
            <AuthField label="Operating City *" icon={MapPin} value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Jodhpur" />
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={handlePrevStep} className="rv-btn rv-btn-secondary cursor-pointer flex-1" style={{ fontSize: 12, textTransform: 'uppercase' }}>
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button type="submit" className="rv-btn rv-btn-primary cursor-pointer flex-1" style={{ fontSize: 12, textTransform: 'uppercase' }}>
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[12px] font-semibold block mb-1.5" style={{ color: 'var(--rv-text-secondary)' }}>Office Complete Address *</label>
              <textarea required rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Office Address"
                style={{ ...inputStyle, resize: 'none' }} onFocus={focusIn} onBlur={focusOut} />
            </div>
            <AuthField label="Google Maps Location link *" icon={Map} type="url" value={googleMapsLink} onChange={(e) => setGoogleMapsLink(e.target.value)} placeholder="https://maps.google.com/?q=..." />
            <div>
              <label className="text-[12px] font-semibold block mb-1.5" style={{ color: 'var(--rv-text-secondary)' }}>Company Description *</label>
              <textarea required rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Heritage specialties, luxury cars list description..."
                style={{ ...inputStyle, resize: 'none' }} onFocus={focusIn} onBlur={focusOut} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-semibold block mb-1.5" style={{ color: 'var(--rv-text-secondary)' }}>Company Logo (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])}
                  className="block w-full text-[12px] cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold"
                  style={{ color: 'var(--rv-text-secondary)' }} />
              </div>
              <div>
                <label className="text-[12px] font-semibold block mb-1.5" style={{ color: 'var(--rv-text-secondary)' }}>Verification Documents (Optional)</label>
                <input type="file" multiple accept="image/*" onChange={(e) => setVerificationDocs(Array.from(e.target.files))}
                  className="block w-full text-[12px] cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold"
                  style={{ color: 'var(--rv-text-secondary)' }} />
              </div>
            </div>

            {/* GPS Toggle */}
            <div className="rv-card-static p-4 flex items-center justify-between mt-2">
              <div>
                <h4 className="text-[12px] font-semibold flex items-center gap-1" style={{ color: 'var(--rv-text)' }}>
                  <ShieldCheck className="w-4 h-4" style={{ color: 'var(--rv-accent)' }} /> GPS Fleet Tracking
                </h4>
                <p className="text-[10px]" style={{ color: 'var(--rv-text-muted)' }}>Provide GPS hardware coordinate mapping sync</p>
              </div>
              <button type="button" onClick={() => setGpsTrackingAvailable(!gpsTrackingAvailable)}
                className="w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300"
                style={{ background: gpsTrackingAvailable ? 'var(--rv-accent)' : 'rgba(255,255,255,0.1)' }}>
                <div className="w-4 h-4 rounded-full shadow-md transform transition-all duration-300"
                  style={{ background: 'var(--rv-bg)', transform: gpsTrackingAvailable ? 'translateX(24px)' : 'translateX(0)' }} />
              </button>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={handlePrevStep} disabled={isLoading} className="rv-btn rv-btn-secondary cursor-pointer flex-1" style={{ fontSize: 12, textTransform: 'uppercase' }}>
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button type="submit" disabled={isLoading} className="rv-btn rv-btn-primary cursor-pointer flex-1 flex items-center justify-center gap-2" style={{ fontSize: 12, textTransform: 'uppercase' }}>
                {isLoading ? (
                  <>
                    <div className="rv-spinner flex-shrink-0" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    <span>Registering...</span>
                  </>
                ) : 'Submit & Setup Profile'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 text-center text-[13px]" style={{ borderTop: '1px solid var(--rv-border)', color: 'var(--rv-text-muted)' }}>
          Already have a business account?{' '}
          <Link to="/login/company" className="font-semibold transition-colors" style={{ color: 'var(--rv-accent)' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegister;

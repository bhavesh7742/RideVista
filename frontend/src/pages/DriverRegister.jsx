import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearErrors } from '../features/authSlice';
import axiosInstance from '../api/axiosInstance';
import { showToast } from '../features/notificationSlice';
import { User, Mail, Lock, Phone, UserCheck, AlertCircle, Building2, Languages, Briefcase, CheckCircle } from 'lucide-react';
import { AuthField } from '../components/AuthLayout';

const inputStyle = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--rv-border)',
  borderRadius: 'var(--rv-radius-md)', color: 'var(--rv-text)',
  fontSize: 13, transition: 'border-color 200ms ease, box-shadow 200ms ease', outline: 'none',
};
const focusIn = (e) => { e.target.style.borderColor = 'rgba(244,180,0,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(244,180,0,0.08)'; };
const focusOut = (e) => { e.target.style.borderColor = 'var(--rv-border)'; e.target.style.boxShadow = 'none'; };

const DriverRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experience, setExperience] = useState('');
  const [languages, setLanguages] = useState('');
  const [tourDescription, setTourDescription] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [companyVerified, setCompanyVerified] = useState(false);
  const [verifiedCompany, setVerifiedCompany] = useState({ name: '', email: '' });
  const [verifying, setVerifying] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationPhase, setRegistrationPhase] = useState(1);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error, user } = useSelector((state) => state.auth);

  useEffect(() => { dispatch(clearErrors()); return () => dispatch(clearErrors()); }, [dispatch]);

  const handleVerifyCompany = async () => {
    if (!companyId) { setLocalError('Please enter a Company ID first.'); return; }
    setVerifying(true); setLocalError(null);
    try {
      const response = await axiosInstance.get(`/companies/verify-id/${companyId}`);
      if (response.data.success) {
        setVerifiedCompany({ name: response.data.data.name, email: response.data.data.email });
        setCompanyVerified(true);
      }
    } catch (err) { console.error(err); setLocalError(err.response?.data?.message || 'Failed to verify Company ID. Ensure the ID is valid.'); setCompanyVerified(false); }
    finally { setVerifying(false); }
  };

  useEffect(() => {
    const completeProfile = async () => {
      if (isAuthenticated && user?.role === 'driver' && registrationPhase === 1 && !isSubmitting) {
        setRegistrationPhase(2); setIsSubmitting(true);
        try {
          const formData = new FormData();
          formData.append('companyId', companyId); formData.append('licenseNumber', licenseNumber);
          formData.append('experience', experience); formData.append('languages', languages);
          formData.append('tourDescription', tourDescription); formData.append('avatar', avatar);
          await axiosInstance.post('/drivers/register-independent', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          navigate('/driver/dashboard');
        } catch (err) { console.error(err); setLocalError(err.response?.data?.message || 'Failed to complete pilot profile registration.'); setIsSubmitting(false); }
      }
    };
    completeProfile();
  }, [isAuthenticated, user, registrationPhase, isSubmitting, navigate, companyId, licenseNumber, experience, languages, tourDescription, avatar]);

  const handleSubmit = (e) => {
    e.preventDefault(); setLocalError(null);
    if (!companyVerified) { setLocalError('Please verify your Company ID first.'); return; }
    if (!avatar) { setLocalError('Profile photo is mandatory'); return; }
    dispatch(registerUser({ name, email, password, role: 'driver', phone }));
  };

  const readOnlyStyle = { ...inputStyle, background: 'rgba(255,255,255,0.02)', cursor: 'not-allowed', opacity: 0.7 };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden py-12">
      <div className="rv-ambient-blob" style={{ width: 500, height: 500, top: '10%', right: '15%', background: 'radial-gradient(circle, rgba(244,180,0,0.05) 0%, transparent 70%)' }} />

      <div className="w-full max-w-2xl rv-glass p-8 rv-animate-scaleIn" style={{ boxShadow: 'var(--rv-shadow-xl)' }}>
        <div className="text-center mb-8">
          <span className="rv-badge rv-badge-accent mb-4 inline-flex"><UserCheck className="w-3.5 h-3.5" /> Independent Pilot</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--rv-text)' }}>Register as a Pilot</h2>
          <p className="text-[13px] mt-2" style={{ color: 'var(--rv-text-muted)' }}>Join a rental company fleet and start coordinating tours</p>
        </div>

        {(error || localError) && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl text-[13px]" style={{ background: 'var(--rv-danger-bg)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--rv-danger)' }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /><div><span className="font-semibold">Registration Failed:</span> {localError || error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Verification */}
          <div className="rv-card-static p-5 space-y-4">
            <h3 className="font-bold text-[12px] uppercase tracking-wider" style={{ color: 'var(--rv-accent)' }}>Company Affiliation</h3>
            <div>
              <label className="text-[12px] font-semibold block mb-1.5" style={{ color: 'var(--rv-text-secondary)' }}>Enter Company ID *</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Building2 className="absolute left-3 top-2.5 h-[18px] w-[18px] pointer-events-none" style={{ color: 'var(--rv-text-muted)' }} />
                  <input type="text" required disabled={companyVerified} value={companyId} onChange={(e) => setCompanyId(e.target.value)} placeholder="RV-COMP-XXXXX"
                    style={{ ...inputStyle, paddingLeft: 40 }} onFocus={focusIn} onBlur={focusOut} />
                </div>
                {!companyVerified ? (
                  <button type="button" onClick={handleVerifyCompany} disabled={verifying}
                    className="rv-btn rv-btn-primary rv-btn-sm cursor-pointer" style={{ fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {verifying ? 'Verifying…' : 'Verify Company'}
                  </button>
                ) : (
                  <button type="button" onClick={() => { setCompanyVerified(false); setVerifiedCompany({ name: '', email: '' }); }}
                    className="rv-btn rv-btn-danger rv-btn-sm cursor-pointer" style={{ fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    Change ID
                  </button>
                )}
              </div>
            </div>

            {companyVerified && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2" style={{ borderTop: '1px solid var(--rv-border)' }}>
                <div>
                  <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--rv-text-muted)' }}>Verified Company Name</span>
                  <input type="text" readOnly value={verifiedCompany.name} style={readOnlyStyle} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--rv-text-muted)' }}>Verified Company Email</span>
                  <input type="text" readOnly value={verifiedCompany.email} style={readOnlyStyle} />
                </div>
              </div>
            )}
          </div>

          {companyVerified && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Credentials */}
                <div className="space-y-4">
                  <h3 className="font-bold text-[12px] uppercase tracking-wider pb-2" style={{ color: 'var(--rv-accent)', borderBottom: '1px solid var(--rv-border)' }}>Account Credentials</h3>
                  <AuthField label="Full Name *" icon={User} value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
                  <AuthField label="Email Address *" icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pilot@example.com" />
                  <AuthField label="Phone Number *" icon={Phone} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9999999999" />
                  <AuthField label="Password *" icon={Lock} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" />
                </div>

                {/* Professional Profile */}
                <div className="space-y-4">
                  <h3 className="font-bold text-[12px] uppercase tracking-wider pb-2" style={{ color: 'var(--rv-accent)', borderBottom: '1px solid var(--rv-border)' }}>Professional Profile</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[12px] font-semibold block mb-1.5" style={{ color: 'var(--rv-text-secondary)' }}>Driving License *</label>
                      <input type="text" required value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="DL-XXX"
                        style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold block mb-1.5" style={{ color: 'var(--rv-text-secondary)' }}>Experience (Yrs) *</label>
                      <input type="number" required value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 5"
                        style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                    </div>
                  </div>
                  <AuthField label="Languages Spoken *" icon={Languages} value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="English, Hindi, Local" />
                  <div>
                    <label className="text-[12px] font-semibold block mb-1.5" style={{ color: 'var(--rv-text-secondary)' }}>Profile Photo *</label>
                    <input type="file" required accept="image/*" onChange={(e) => setAvatar(e.target.files[0])}
                      className="block w-full text-[12px] cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold"
                      style={{ color: 'var(--rv-text-secondary)' }} />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold block mb-1.5" style={{ color: 'var(--rv-text-secondary)' }}>Tour Description *</label>
                <textarea required rows={2} value={tourDescription} onChange={(e) => setTourDescription(e.target.value)}
                  placeholder="Briefly describe your driving style and knowledge of local tourist spots..."
                  style={{ ...inputStyle, resize: 'none' }} onFocus={focusIn} onBlur={focusOut} />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full rv-btn rv-btn-primary rv-btn-lg cursor-pointer mt-2 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="rv-spinner flex-shrink-0" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="w-[18px] h-[18px]" />
                    <span>Submit Pilot Registration</span>
                  </>
                )}
              </button>
            </>
          )}
        </form>

        <div className="mt-8 pt-6 text-center text-[13px]" style={{ borderTop: '1px solid var(--rv-border)', color: 'var(--rv-text-muted)' }}>
          Already registered as a pilot?{' '}
          <Link to="/login/driver" className="font-semibold transition-colors" style={{ color: 'var(--rv-accent)' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default DriverRegister;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import axiosInstance from '../api/axiosInstance';
import { showToast } from '../features/notificationSlice';
import useSuccessFeedback from '../hooks/useSuccessFeedback';
import {
  Inbox,
  MapPin,
  Phone,
  Check,
  X,
  User,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  UserCheck,
  CalendarRange,
  BarChart3,
  Settings,
  Car,
  ShieldCheck,
  ShieldX,
  LogOut
} from 'lucide-react';

const inputStyle = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--rv-border)',
  borderRadius: 'var(--rv-radius-md)', color: 'var(--rv-text)',
  fontSize: 13, transition: 'border-color 200ms ease, box-shadow 200ms ease', outline: 'none',
};
const focusIn = (e) => { e.target.style.borderColor = 'rgba(244,180,0,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(244,180,0,0.08)'; };
const focusOut = (e) => { e.target.style.borderColor = 'var(--rv-border)'; e.target.style.boxShadow = 'none'; };

const DriverDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('driver_dashboard_active_tab') || 'overview';
  });
  useEffect(() => {
    localStorage.setItem('driver_dashboard_active_tab', activeTab);
  }, [activeTab]);

  const [driverProfile, setDriverProfile] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { successMessage, setSuccessMessage, clearSuccess } = useSuccessFeedback();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login/driver');
  };

  // Data lists
  const [requests, setRequests] = useState([]);

  // Pagination States
  const [jobsPage, setJobsPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const limit = 7;

  // Load states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Forms states
  const [formError, setFormError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Change Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordFormLoading, setPasswordFormLoading] = useState(false);
  const [passwordFormError, setPasswordFormError] = useState(null);

  // Profile Edit fields
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileLicense, setProfileLicense] = useState('');
  const [profileExperience, setProfileExperience] = useState('');
  const [profileLanguages, setProfileLanguages] = useState('');
  const [profileTourDescription, setProfileTourDescription] = useState('');

  const { user, isLoading: authLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!authLoading && user && user.role === 'driver') {
      fetchDashboardData();
    }
  }, [authLoading, user]);

  useEffect(() => {
    setJobsPage(1);
    setHistoryPage(1);
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get Driver details
      const driverRes = await axiosInstance.get('/drivers/me');
      const driver = driverRes.data.data;
      setDriverProfile(driver);

      // Seed Profile edit states
      setProfileName(driver.user?.name || '');
      setProfilePhone(driver.user?.phone || '');
      setProfileEmail(driver.user?.email || '');
      setProfileLicense(driver.licenseNumber || '');
      setProfileExperience(driver.experience || 0);
      setProfileLanguages(driver.languages ? driver.languages.join(', ') : '');
      setProfileTourDescription(driver.tourDescription || '');

      // 2. Fetch incoming requests
      const reqRes = await axiosInstance.get('/requests/incoming');
      setRequests(reqRes.data.data || []);

    } catch (err) {
      console.error('Fetch driver dashboard data error:', err);
      setError('Failed to load driver profile. Please complete driver registration first.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    clearSuccess();

    try {
      const response = await axiosInstance.put(`/drivers/${driverProfile._id}`, {
        name: profileName,
        phone: profilePhone,
        licenseNumber: profileLicense,
        experience: Number(profileExperience),
        languages: profileLanguages ? profileLanguages.split(',').map(l => l.trim()) : ['Hindi'],
        tourDescription: profileTourDescription,
      });

      setDriverProfile(response.data.data.driver);
      setSuccessMessage('Pilot Profile Updated successfully!');
    } catch (err) {
      console.error('Update profile error:', err);
      setFormError(err.response?.data?.message || 'Failed to update driver profile');
    } finally {
      setFormLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordFormLoading(true);
    setPasswordFormError(null);
    clearSuccess();

    if (newPassword !== confirmNewPassword) {
      setPasswordFormError('New password and confirm password do not match');
      setPasswordFormLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordFormError('Password must be at least 6 characters long');
      setPasswordFormLoading(false);
      return;
    }

    try {
      await axiosInstance.put('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      setSuccessMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      console.error('Password change error:', err);
      setPasswordFormError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordFormLoading(false);
    }
  };

  const handleResponse = async (requestId, status) => {
    if (actionLoading) return;

    setActionLoading(true);
    setActionError(null);
    clearSuccess();
    try {
      await axiosInstance.patch(`/requests/${requestId}/respond`, { status });
      setSuccessMessage(status === 'accepted' ? 'Request Accepted successfully!' : 'Request Rejected successfully!');
      fetchDashboardData();
    } catch (err) {
      console.error('Respond request error:', err);
      setActionError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase">
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase">
            Rejected
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase">
            Completed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase animate-pulse">
            Pending
          </span>
        );
    }
  };

  if (!authLoading && !loading && (error || !driverProfile)) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl max-w-md text-center space-y-4 animate-scaleUp">
          <ShieldX className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-sm text-gray-400">{error || 'Driver profile not found. Please register independently.'}</p>
        </div>
      </div>
    );
  }

  // Active or Pending/Rejected Filter for Jobs Tab
  const activeRequests = requests.filter(r => r.status === 'pending' || r.status === 'accepted');
  const historyRequests = requests.filter(r => r.status === 'completed' || r.status === 'rejected');

  return (
    <div className="bg-[#0b0c10] min-h-screen text-[#c5c6c7] flex flex-col md:flex-row">

      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 flex flex-col p-6 space-y-2 flex-shrink-0 md:h-screen md:sticky md:top-0 overflow-y-auto"
        style={{ background: 'rgba(255,255,255,0.01)', borderRight: '1px solid var(--rv-border)' }}>
        <div className="flex items-center gap-3 pb-4 mb-4" style={{ borderBottom: '1px solid var(--rv-border)' }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--rv-accent-glow)', border: '1px solid rgba(244,180,0,0.15)' }}>
            {driverProfile?.user?.avatar ? (
              <img src={driverProfile.user.avatar} alt="Avatar" className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <User className="w-5 h-5" style={{ color: 'var(--rv-accent)' }} />
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm truncate max-w-[150px]" style={{ color: 'var(--rv-text)' }}>{driverProfile?.user?.name || 'Loading Pilot...'}</h3>
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--rv-text-muted)' }}>{driverProfile?.company?.name || 'Independent Pilot'}</p>
          </div>
        </div>

        {[
          { id: 'overview', label: 'Dashboard Overview', icon: BarChart3 },
          { id: 'jobs', label: 'Tour Jobs', icon: Inbox },
          { id: 'history', label: 'Booking History', icon: CalendarRange },
          { id: 'profile', label: 'Pilot Profile', icon: User },
          { id: 'settings', label: 'Change Password', icon: Settings }
        ].filter((t) => driverProfile?.status !== 'pending_approval' || t.id === 'overview').map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setFormError(null); setActionError(null); clearSuccess(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer"
              style={{
                background: isActive ? 'var(--rv-accent)' : 'transparent',
                color: isActive ? 'var(--rv-bg)' : 'var(--rv-text-muted)'
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--rv-text)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--rv-text-muted)'; }}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer mt-auto"
          style={{ color: 'var(--rv-danger)', background: 'transparent' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--rv-danger-bg)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-x-hidden">
        {authLoading || loading ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
            <div className="rv-spinner" />
            <p className="text-[13px] font-medium" style={{ color: 'var(--rv-accent)' }}>Loading Pilot Portal Content...</p>
          </div>
        ) : (
          <>

        {successMessage && (
          <div className="flex items-center gap-3 p-4 rounded-xl text-[13px] rv-animate-scaleIn"
            style={{ background: 'var(--rv-success-bg)', border: '1px solid rgba(52,211,153,0.15)', color: 'var(--rv-success)' }}>
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
            <button onClick={clearSuccess} className="ml-auto cursor-pointer transition-colors" style={{ color: 'var(--rv-success)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {actionError && (
          <div className="flex items-center gap-3 p-4 rounded-xl text-[13px] rv-animate-scaleIn"
            style={{ background: 'var(--rv-danger-bg)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--rv-danger)' }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{actionError}</span>
            <button onClick={() => setActionError(null)} className="ml-auto cursor-pointer transition-colors" style={{ color: 'var(--rv-danger)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Lockout pending approval pilots */}
        {driverProfile?.status === 'pending_approval' ? (
          <div className="rv-card p-8 text-center space-y-6 max-w-xl mx-auto my-12 rv-animate-scaleIn">
            <Clock className="w-16 h-16 mx-auto animate-pulse" style={{ color: 'var(--rv-accent)' }} />
            <h2 className="text-2xl font-black text-white">Account Pending Approval</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--rv-text-secondary)' }}>
              Your account is awaiting approval from your rental company.
              Once your rental company manager approves your request, you will become active and start receiving coordination requests.
            </p>
          </div>
        ) : (
          <>
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 rv-animate-fadeUp">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4" style={{ borderBottom: '1px solid var(--rv-border)' }}>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white">Pilot Dashboard Overview</h1>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--rv-text-muted)' }}>Realtime jobs count and coordinator operations</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {driverProfile.status === 'available' ? (
                      <span className="rv-badge rv-badge-success">
                        <ShieldCheck className="w-4 h-4" /> Active Pilot
                      </span>
                    ) : driverProfile.status === 'pending_approval' ? (
                      <span className="rv-badge rv-badge-accent animate-pulse">
                        <AlertCircle className="w-4 h-4" /> Pending Approval
                      </span>
                    ) : (
                      <span className="rv-badge rv-badge-danger">
                        <AlertCircle className="w-4 h-4" /> Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                  <div className="rv-card p-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase" style={{ color: 'var(--rv-text-muted)' }}>Pending Jobs</p>
                      <p className="text-3xl font-black mt-1" style={{ color: 'var(--rv-accent)' }}>
                        {requests.filter(r => r.status === 'pending').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold"
                      style={{ background: 'var(--rv-accent-glow)', border: '1px solid rgba(244,180,0,0.15)', color: 'var(--rv-accent)', fontSize: 18 }}>
                      ✉
                    </div>
                  </div>

                  <div className="rv-card p-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase" style={{ color: 'var(--rv-text-muted)' }}>Accepted Requests</p>
                      <p className="text-3xl font-black mt-1" style={{ color: 'var(--rv-accent)' }}>
                        {driverProfile.acceptedRequestsCount || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold"
                      style={{ background: 'var(--rv-accent-glow)', border: '1px solid rgba(244,180,0,0.15)', color: 'var(--rv-accent)', fontSize: 18 }}>
                      ✓
                    </div>
                  </div>

                  <div className="rv-card p-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase" style={{ color: 'var(--rv-text-muted)' }}>Completed Tours</p>
                      <p className="text-3xl font-black mt-1" style={{ color: 'var(--rv-success)' }}>
                        {driverProfile.completedToursCount || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold"
                      style={{ background: 'var(--rv-success-bg)', border: '1px solid rgba(52,211,153,0.15)', color: 'var(--rv-success)', fontSize: 18 }}>
                      🚗
                    </div>
                  </div>

                  <div className="rv-card p-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase" style={{ color: 'var(--rv-text-muted)' }}>Current Status</p>
                      <p className="text-sm font-bold mt-2.5 uppercase tracking-wide" style={{ color: 'var(--rv-text)' }}>
                        {driverProfile.status === 'available' ? 'Available' : driverProfile.status === 'on-tour' ? 'On Tour' : driverProfile.status}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--rv-border)', color: 'var(--rv-text-secondary)', fontSize: 18 }}>
                      ℹ
                    </div>
                  </div>
                </div>

                {/* Quick alert if unverified */}
                {driverProfile.status === 'pending_approval' && (
                  <div className="p-5 rounded-2xl text-xs leading-relaxed space-y-1 animate-pulse"
                    style={{ background: 'var(--rv-accent-glow)', border: '1px solid rgba(244,180,0,0.15)', color: 'var(--rv-accent)' }}>
                    <h4 className="font-bold flex items-center gap-1 text-sm"><AlertCircle className="w-4 h-4" /> Account Pending Approval</h4>
                    <p>Your registration request has been sent to {driverProfile.company?.name || 'the rental company'}. Once they approve your request, you will become an Active Pilot and start receiving tour requests.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: TOUR JOBS */}
            {activeTab === 'jobs' && (
              <div className="space-y-6 rv-animate-fadeUp">
                <div className="pb-4" style={{ borderBottom: '1px solid var(--rv-border)' }}>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Tour Coordination Jobs</h1>
                  <p className="text-xs" style={{ color: 'var(--rv-text-muted)' }}>View and accept incoming ride requests from tourists</p>
                </div>

                {activeRequests.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl space-y-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--rv-border)' }}>
                    <Clock className="w-12 h-12 mx-auto animate-pulse" style={{ color: 'var(--rv-accent)' }} />
                    <h3 className="text-lg font-bold text-white">No Active Jobs</h3>
                    <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--rv-text-muted)' }}>
                      Currently, there are no active tour requests allocated to you. Check back later!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeRequests.slice((jobsPage - 1) * limit, jobsPage * limit).map((req) => (
                      <div key={req._id} className="rv-card p-6 space-y-4">
                        {/* Row 1: Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4" style={{ borderBottom: '1px solid var(--rv-border)' }}>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: 'var(--rv-text-muted)' }}>Requested Vehicle:</span>
                              <h4 className="text-sm font-bold text-white">{req.vehicle?.modelName}</h4>
                            </div>
                            <span className="text-xs" style={{ color: 'var(--rv-accent)' }}>Request ID: {req._id}</span>
                          </div>
                          <div>{getStatusBadge(req.status)}</div>
                        </div>

                        {/* Row 2: Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                          {/* Left: Pickup location & note */}
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <span className="text-xs font-semibold uppercase tracking-wider block flex items-center gap-1" style={{ color: 'var(--rv-text-muted)' }}>
                                <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--rv-accent)' }} /> Pickup Location
                              </span>
                              <p className="text-gray-300 font-medium">{req.pickupLocation}</p>
                            </div>

                            {req.message && (
                              <div className="space-y-1">
                                <span className="text-xs font-semibold uppercase tracking-wider block flex items-center gap-1" style={{ color: 'var(--rv-text-muted)' }}>
                                  <FileText className="w-3.5 h-3.5" /> Tourist Message
                                </span>
                                <p className="text-gray-400 italic">"{req.message}"</p>
                              </div>
                            )}
                          </div>

                          {/* Right: Actions */}
                          <div className="p-4 rounded-xl space-y-3 border" style={{ background: 'rgba(0,0,0,0.15)', borderColor: 'var(--rv-border)' }}>
                            <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: 'var(--rv-text-muted)' }}>
                              Tourist Information
                            </span>

                            {req.status === 'accepted' ? (
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center border"
                                    style={{ background: 'var(--rv-accent-glow)', borderColor: 'rgba(244,180,0,0.15)' }}>
                                    <UserCheck className="w-5 h-5" style={{ color: 'var(--rv-accent)' }} />
                                  </div>
                                  <div>
                                    <p className="font-bold text-white">{req.user?.name}</p>
                                    <p className="text-xs" style={{ color: 'var(--rv-accent)' }}>Verified Tourist Client</p>
                                  </div>
                                </div>
                                <div className="pt-2 space-y-1.5" style={{ borderTop: '1px solid var(--rv-border)' }}>
                                  <a
                                    href={`tel:${req.user?.phone}`}
                                    className="flex items-center justify-center gap-1.5 w-full rv-btn rv-btn-primary rv-btn-sm cursor-pointer"
                                  >
                                    <Phone className="w-3.5 h-3.5" />
                                    Call Client ({req.user?.phone})
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--rv-text-muted)' }}>
                                  Tourist client details are protected. Accept this job to view details and coordinate the tour.
                                </p>

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleResponse(req._id, 'accepted')}
                                    disabled={actionLoading}
                                    className="flex-1 flex items-center justify-center gap-1 rv-btn rv-btn-sm cursor-pointer"
                                    style={{ background: 'var(--rv-success)', color: 'var(--rv-bg)' }}
                                  >
                                    <Check className="w-4 h-4" /> Accept Job
                                  </button>
                                  <button
                                    onClick={() => handleResponse(req._id, 'rejected')}
                                    disabled={actionLoading}
                                    className="flex-1 flex items-center justify-center gap-1 rv-btn rv-btn-sm cursor-pointer"
                                    style={{ background: 'var(--rv-danger)', color: '#fff' }}
                                  >
                                    <X className="w-4 h-4" /> Reject
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Jobs Pagination Controls */}
                    {activeRequests.length > limit && (
                      <div className="flex items-center justify-center gap-4 pt-6">
                        <button
                          disabled={jobsPage === 1}
                          onClick={() => setJobsPage(prev => Math.max(prev - 1, 1))}
                          className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer"
                        >
                          Previous
                        </button>
                        <span className="font-semibold text-xs" style={{ color: 'var(--rv-text-muted)' }}>
                          Page {jobsPage} of {Math.ceil(activeRequests.length / limit)} ({activeRequests.length} total)
                        </span>
                        <button
                          disabled={jobsPage === Math.ceil(activeRequests.length / limit)}
                          onClick={() => setJobsPage(prev => Math.min(prev + 1, Math.ceil(activeRequests.length / limit)))}
                          className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: BOOKING HISTORY */}
            {activeTab === 'history' && (
              <div className="space-y-6 rv-animate-fadeUp">
                <div className="pb-4" style={{ borderBottom: '1px solid var(--rv-border)' }}>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Booking History</h1>
                  <p className="text-xs" style={{ color: 'var(--rv-text-muted)' }}>View completed and rejected ride requests</p>
                </div>

                {historyRequests.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl space-y-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--rv-border)' }}>
                    <CalendarRange className="w-12 h-12 mx-auto" style={{ color: 'var(--rv-text-muted)' }} />
                    <h3 className="text-lg font-bold text-white">No Booking History</h3>
                    <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--rv-text-muted)' }}>
                      You haven't completed or rejected any jobs yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historyRequests.slice((historyPage - 1) * limit, historyPage * limit).map((req) => (
                      <div key={req._id} className="rv-card p-6 flex flex-col md:flex-row justify-between items-center gap-4 opacity-90">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: 'var(--rv-text-muted)' }}>Requested Vehicle:</span>
                            <h4 className="text-sm font-bold text-white">{req.vehicle?.modelName}</h4>
                          </div>
                          <p className="text-xs"><MapPin className="w-3 h-3 inline text-yellow-500 mr-1" /> {req.pickupLocation}</p>
                          <p className="text-[10px]" style={{ color: 'var(--rv-text-muted)' }}>On {new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>{getStatusBadge(req.status)}</div>
                      </div>
                    ))}

                    {/* History Pagination Controls */}
                    {historyRequests.length > limit && (
                      <div className="flex items-center justify-center gap-4 pt-6">
                        <button
                          disabled={historyPage === 1}
                          onClick={() => setHistoryPage(prev => Math.max(prev - 1, 1))}
                          className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer"
                        >
                          Previous
                        </button>
                        <span className="font-semibold text-xs" style={{ color: 'var(--rv-text-muted)' }}>
                          Page {historyPage} of {Math.ceil(historyRequests.length / limit)} ({historyRequests.length} total)
                        </span>
                        <button
                          disabled={historyPage === Math.ceil(historyRequests.length / limit)}
                          onClick={() => setHistoryPage(prev => Math.min(prev + 1, Math.ceil(historyRequests.length / limit)))}
                          className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: PILOT PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-6 rv-animate-fadeUp">
                <div className="rv-card p-6 sm:p-8 space-y-6">
                  <div className="pb-4" style={{ borderBottom: '1px solid var(--rv-border)' }}>
                    <h1 className="text-xl sm:text-2xl font-black text-white">Pilot Profile Setup</h1>
                    <p className="text-xs" style={{ color: 'var(--rv-text-muted)' }}>Edit driver Name and contact details</p>
                  </div>

                  {formError && (
                    <div className="flex items-center gap-2 p-4 rounded-xl text-[12px]" style={{ background: 'var(--rv-danger-bg)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--rv-danger)' }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {formError}
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-6">

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--rv-text-muted)' }}>ASSIGNED COMPANY (READ ONLY)</label>
                      <input
                        type="text"
                        readOnly
                        value={driverProfile.company?.name || 'Independent Registration'}
                        style={{ ...inputStyle, background: 'rgba(255,255,255,0.02)', cursor: 'not-allowed', color: 'var(--rv-text-muted)', fontFamily: 'monospace' }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Pilot Full Name</label>
                        <input
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          style={inputStyle}
                          onFocus={focusIn}
                          onBlur={focusOut}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          style={inputStyle}
                          onFocus={focusIn}
                          onBlur={focusOut}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--rv-text-muted)' }}>DRIVER LICENSE NUMBER (READ ONLY)</label>
                        <input
                          type="text"
                          readOnly
                          value={profileLicense}
                          style={{ ...inputStyle, background: 'rgba(255,255,255,0.02)', cursor: 'not-allowed', color: 'var(--rv-text-muted)', fontFamily: 'monospace' }}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--rv-text-muted)' }}>DRIVING EXPERIENCE (YEARS) (READ ONLY)</label>
                        <input
                          type="number"
                          readOnly
                          value={profileExperience}
                          style={{ ...inputStyle, background: 'rgba(255,255,255,0.02)', cursor: 'not-allowed', color: 'var(--rv-text-muted)' }}
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>LANGUAGES SPOKEN (COMMA SEPARATED)</label>
                        <input
                          type="text"
                          value={profileLanguages}
                          onChange={(e) => setProfileLanguages(e.target.value)}
                          style={inputStyle}
                          onFocus={focusIn}
                          onBlur={focusOut}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>TOUR SPECIALTY BIO DESCRIPTION</label>
                      <textarea
                        rows={4}
                        value={profileTourDescription}
                        onChange={(e) => setProfileTourDescription(e.target.value)}
                        placeholder="Describe your tour expertise, local knowledge, and driving style..."
                        style={{ ...inputStyle, resize: 'none' }}
                        onFocus={focusIn}
                        onBlur={focusOut}
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={formLoading}
                        className="rv-btn rv-btn-primary rv-btn-sm cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {formLoading ? (
                          <>
                            <div className="rv-spinner flex-shrink-0" style={{ width: 12, height: 12, borderWidth: 2 }} />
                            <span>Updating...</span>
                          </>
                        ) : 'Update Pilot Profile'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 5: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6 rv-animate-fadeUp max-w-2xl mx-auto">

                {/* Change Password Section */}
                <div className="rv-card p-6 sm:p-8 space-y-6">
                  <div className="pb-4" style={{ borderBottom: '1px solid var(--rv-border)' }}>
                    <h1 className="text-xl sm:text-2xl font-black text-white">Security & Password</h1>
                    <p className="text-xs" style={{ color: 'var(--rv-text-muted)' }}>Update your account password securely</p>
                  </div>

                  {passwordFormError && (
                    <div className="flex items-center gap-2 p-4 rounded-xl text-[12px]" style={{ background: 'var(--rv-danger-bg)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--rv-danger)' }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {passwordFormError}
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Current Password</label>
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          style={inputStyle}
                          onFocus={focusIn}
                          onBlur={focusOut}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>New Password</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          style={inputStyle}
                          onFocus={focusIn}
                          onBlur={focusOut}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Confirm New Password</label>
                        <input
                          type="password"
                          required
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          style={inputStyle}
                          onFocus={focusIn}
                          onBlur={focusOut}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={passwordFormLoading}
                        className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {passwordFormLoading ? (
                          <>
                            <div className="rv-spinner flex-shrink-0" style={{ width: 12, height: 12, borderWidth: 2, borderColor: 'var(--rv-bg)', borderTopColor: 'var(--rv-accent)' }} />
                            <span>Updating...</span>
                          </>
                        ) : 'Change Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
          </>
        )}
      </main>
    </div>
  );
};

export default DriverDashboard;

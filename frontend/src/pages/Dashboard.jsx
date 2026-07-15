import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import { showToast } from '../features/notificationSlice';
import ConfirmationModal from '../components/ConfirmationModal';
import useSuccessFeedback from '../hooks/useSuccessFeedback';
import {
  History,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Building,
  Compass,
  ArrowRight,
  MessageSquare,
  CheckCircle,
  X,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('tourist_dashboard_active_tab') || 'all';
  });
  useEffect(() => {
    localStorage.setItem('tourist_dashboard_active_tab', activeTab);
  }, [activeTab]);
  const [completing, setCompleting] = useState({});
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;
  const { successMessage, setSuccessMessage, clearSuccess } = useSuccessFeedback();
  const [actionError, setActionError] = useState(null);

  const dispatch = useDispatch();
  const { user, isLoading: authLoading } = useSelector((state) => state.auth);

  const filteredRequests = requests.filter((req) => {
    if (activeTab === 'all') return true;
    return req.status === activeTab;
  });

  useEffect(() => {
    if (!authLoading && user && user.role === 'user') {
      fetchRequests();
    }
  }, [authLoading, user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/requests/tourist');
      setRequests(response.data.data);
    } catch (err) {
      console.error('Fetch tourist requests error:', err);
      setError('Failed to load your tour requests history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRequest = (reqId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Complete Tour Request',
      message: 'Are you sure you want to mark this ride as completed? This action updates your rental history.',
      confirmText: 'Mark Completed',
      isDanger: false,
      onConfirm: async () => {
        setActionError(null);
        clearSuccess();
        setCompleting(prev => ({ ...prev, [reqId]: true }));
        try {
          await axiosInstance.patch(`/requests/${reqId}/complete`);
          setSuccessMessage('Tour Completed Successfully');
          fetchRequests();
        } catch (err) {
          console.error(err);
          setActionError(err.response?.data?.message || 'Failed to complete request');
        } finally {
          setCompleting(prev => ({ ...prev, [reqId]: false }));
        }
      }
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <span className="rv-badge rv-badge-success" style={{ fontSize: 10 }}><CheckCircle className="w-3.5 h-3.5" /> Accepted</span>;
      case 'rejected':
        return <span className="rv-badge rv-badge-danger" style={{ fontSize: 10 }}><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
      case 'completed':
        return <span className="rv-badge" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa', fontSize: 10 }}><CheckCircle className="w-3.5 h-3.5" /> Completed</span>;
      default:
        return <span className="rv-badge rv-badge-accent" style={{ fontSize: 10 }}><Clock className="w-3.5 h-3.5 animate-pulse" /> Pending</span>;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ color: 'var(--rv-text)' }}>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Welcome Header */}
        <div className="rv-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 rv-animate-fadeUp">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--rv-text)' }}>My Requests</h1>
            <p className="text-sm" style={{ color: 'var(--rv-text-secondary)' }}>
              Welcome, {user?.name}. Monitor your offline self-drive and pilot tour requests here.
            </p>
          </div>
          <Link to="/search" className="rv-btn rv-btn-primary rv-btn-sm cursor-pointer whitespace-nowrap">
            Rent Another Vehicle <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Request Listings */}
        <div className="space-y-6 rv-animate-fadeUp rv-delay-1">
          {successMessage && (
            <div className="flex items-center gap-3 p-4 rounded-xl text-[13px] rv-animate-scaleIn"
              style={{ background: 'var(--rv-success-bg)', border: '1px solid rgba(52,211,153,0.15)', color: 'var(--rv-success)' }}>
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{successMessage}</span>
              <button onClick={clearSuccess} className="ml-auto cursor-pointer transition-colors" style={{ color: 'var(--rv-success)' }}><X className="w-4 h-4" /></button>
            </div>
          )}
          {actionError && (
            <div className="flex items-center gap-3 p-4 rounded-xl text-[13px] rv-animate-scaleIn"
              style={{ background: 'var(--rv-danger-bg)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--rv-danger)' }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{actionError}</span>
              <button onClick={() => setActionError(null)} className="ml-auto cursor-pointer transition-colors" style={{ color: 'var(--rv-danger)' }}><X className="w-4 h-4" /></button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2" style={{ borderBottom: '1px solid var(--rv-border)' }}>
            <div className="flex items-center gap-2 font-bold text-lg" style={{ color: 'var(--rv-text)' }}>
              <History className="w-5 h-5" style={{ color: 'var(--rv-accent)' }} />
              <h2>Your Tour Requests History</h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl border" style={{ background: 'rgba(255,255,255,0.01)', borderColor: 'var(--rv-border)' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending' },
                { id: 'accepted', label: 'Accepted' },
                { id: 'rejected', label: 'Rejected' },
                { id: 'completed', label: 'Completed' }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer"
                    style={{
                      background: isActive ? 'var(--rv-accent)' : 'transparent',
                      color: isActive ? 'var(--rv-bg)' : 'var(--rv-text-muted)'
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--rv-text)'; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--rv-text-muted)'; }}>
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {authLoading || isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => <div key={n} className="rv-skeleton h-44 rounded-2xl" />)}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 p-4 rounded-xl text-[12px]" style={{ background: 'var(--rv-danger-bg)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--rv-danger)' }}>
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="rv-card-static text-center py-16 space-y-4">
              <Compass className="w-10 h-10 mx-auto rv-animate-float" style={{ color: 'var(--rv-accent)' }} />
              <h3 className="text-base font-bold" style={{ color: 'var(--rv-text)' }}>No {activeTab !== 'all' ? activeTab : ''} Requests Found</h3>
              <p className="text-[12px] max-w-sm mx-auto" style={{ color: 'var(--rv-text-muted)' }}>
                No rental requests matches this status filter. Explore vehicles to submit requests!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.slice((currentPage - 1) * limit, currentPage * limit).map((req) => (
                <div key={req._id} className="rv-card p-6 space-y-4">
                  {/* Row 1: Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4" style={{ borderBottom: '1px solid var(--rv-border)' }}>
                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold" style={{ color: 'var(--rv-text)' }}>{req.vehicle?.modelName}</h3>
                      <p className="text-[11px] font-medium flex items-center gap-1" style={{ color: 'var(--rv-accent)' }}>
                        <Building className="w-3.5 h-3.5" /> Provided by {req.company?.name} ({req.company?.city})
                      </p>
                    </div>
                    <div>{getStatusBadge(req.status)}</div>
                  </div>

                  {/* Row 2: Content Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px]">
                    {/* Left: Pickup */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--rv-text-muted)' }}>Pickup Details</span>
                        <p className="font-medium flex items-start gap-1.5" style={{ color: 'var(--rv-text-secondary)' }}>
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--rv-accent)' }} />
                          {req.pickupLocation}
                        </p>
                      </div>

                      {req.message && (
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--rv-text-muted)' }}>Your Note</span>
                          <p className="italic flex items-start gap-1.5" style={{ color: 'var(--rv-text-muted)' }}>
                            <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            "{req.message}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Driver coordination */}
                    <div className="rv-card-static p-4 space-y-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--rv-text-muted)' }}>Driver Coordination</span>

                      {req.status === 'accepted' ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center border"
                              style={{ background: 'var(--rv-accent-glow)', borderColor: 'rgba(244,180,0,0.2)' }}>
                              <User className="w-5 h-5" style={{ color: 'var(--rv-accent)' }} />
                            </div>
                            <div>
                              <p className="font-bold text-white">{req.driver?.user?.name}</p>
                              <p className="text-[11px]" style={{ color: 'var(--rv-text-muted)' }}>Assigned Tour Pilot</p>
                            </div>
                          </div>
                          <div className="pt-2 flex flex-col gap-2" style={{ borderTop: '1px solid var(--rv-border)' }}>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <a href={`tel:${req.driver?.user?.phone}`} className="rv-btn rv-btn-primary rv-btn-sm flex-1 cursor-pointer">
                                <Phone className="w-3.5 h-3.5" /> Call Driver ({req.driver?.user?.phone})
                              </a>
                              <a href={`tel:${req.company?.phone}`} className="rv-btn rv-btn-secondary rv-btn-sm flex-1 cursor-pointer">
                                Call Agency
                              </a>
                            </div>
                            <button onClick={() => handleCompleteRequest(req._id)} disabled={completing[req._id]}
                              className="rv-btn rv-btn-sm cursor-pointer w-full text-white flex items-center justify-center gap-2"
                              style={{ background: '#2563eb' }}>
                              {completing[req._id] ? (
                                <>
                                  <div className="rv-spinner flex-shrink-0" style={{ width: 14, height: 14, borderWidth: 2 }} />
                                  <span>Completing...</span>
                                </>
                              ) : 'Mark Tour Completed'}
                            </button>
                          </div>
                        </div>
                      ) : req.status === 'rejected' ? (
                        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--rv-danger)' }}>
                          The driver rejected this request. Please contact the rental company directly to assign an alternative driver or choose another vehicle.
                        </p>
                      ) : (
                        <div className="space-y-2 text-[12px]" style={{ color: 'var(--rv-text-muted)' }}>
                          <p className="leading-relaxed">
                            Once Rajesh accepts your tour request, his personal contact number and name details will appear here to coordinate your tour.
                          </p>
                          <p className="text-[11px] italic pt-1" style={{ borderTop: '1px solid var(--rv-border)' }}>
                            For document checks and security deposits, visit the agency physically: <br />
                            <span className="not-italic font-medium" style={{ color: 'var(--rv-accent)' }}>{req.company?.address}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer status date */}
                  <div className="text-[10px] text-right pt-2" style={{ borderTop: '1px solid var(--rv-border)', color: 'var(--rv-text-muted)' }}>
                    Sent on {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              {filteredRequests.length > limit && (
                <div className="flex items-center justify-center gap-4 pt-6">
                  <button disabled={currentPage === 1 || isLoading} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer">Previous</button>
                  <span className="text-[12px] font-medium" style={{ color: 'var(--rv-text-muted)' }}>
                    Page {currentPage} of {Math.ceil(filteredRequests.length / limit)} ({filteredRequests.length} total)
                  </span>
                  <button disabled={currentPage === Math.ceil(filteredRequests.length / limit) || isLoading} onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredRequests.length / limit)))}
                    className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer">Next</button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDanger={confirmModal.isDanger}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default Dashboard;

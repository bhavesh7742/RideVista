import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import { showToast } from '../features/notificationSlice';
import useSuccessFeedback from '../hooks/useSuccessFeedback';
import {
  Building2, MapPin, Phone, Star, ShieldCheck,
  Map, PhoneCall, Compass, Info, X, ShieldAlert,
  MessageSquare, User, CheckCircle2
} from 'lucide-react';

const inputStyle = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--rv-border)',
  borderRadius: 'var(--rv-radius-md)', color: 'var(--rv-text)',
  fontSize: 13, transition: 'border-color 200ms ease, box-shadow 200ms ease', outline: 'none',
};
const focusIn = (e) => { e.target.style.borderColor = 'rgba(244,180,0,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(244,180,0,0.08)'; };
const focusOut = (e) => { e.target.style.borderColor = 'var(--rv-border)'; e.target.style.boxShadow = 'none'; };

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [company, setCompany] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewError, setReviewError] = useState(null);
  const dispatch = useDispatch();
  const { successMessage, setSuccessMessage, clearSuccess } = useSuccessFeedback();

  // Pagination States
  const [vehiclesPage, setVehiclesPage] = useState(1);
  const vehiclesLimit = 6;
  const [reviewsPage, setReviewsPage] = useState(1);
  const reviewsLimit = 6;

  // Tabs: 'without-driver' vs 'with-driver'
  const [driverMode, setDriverMode] = useState('without-driver');
  // Sub-tabs: 'scooty' | 'bike' | 'car' | 'auto'
  const [vehicleType, setVehicleType] = useState('scooty');

  // Reset page when tabs change
  useEffect(() => {
    setVehiclesPage(1);
  }, [driverMode, vehicleType]);

  useEffect(() => {
    fetchCompanyAndVehicles();
  }, [id]);

  const fetchCompanyAndVehicles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Company details
      const compRes = await axiosInstance.get(`/companies/${id}`);
      const companyData = compRes.data.data.company;
      setCompany(companyData);

      // 2. Fetch all vehicles for this company
      const vehRes = await axiosInstance.get(`/vehicles/search?city=${companyData.city}`);
      const allVehiclesInCity = vehRes.data.data || [];
      const companyVehicles = allVehiclesInCity.filter(
        (v) => v.company?._id === id || v.company === id
      );
      setVehicles(companyVehicles);

      // 3. Fetch reviews
      const reviewRes = await axiosInstance.get(`/reviews/company/${id}`);
      setReviews(reviewRes.data.data);
    } catch (err) {
      console.error('Fetch company details error:', err);
      setError(err.response?.data?.message || 'Failed to load company details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError(null);
    clearSuccess();
    if (!newComment.trim()) {
      setReviewError('Please add a comment');
      return;
    }
    setReviewSubmitLoading(true);
    try {
      await axiosInstance.post('/reviews', {
        company: id,
        rating: newRating,
        comment: newComment,
      });
      setNewComment('');
      setNewRating(5);
      setSuccessMessage('Review Submitted Successfully');
      fetchCompanyAndVehicles();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  // Redirect handling for guest interaction
  const handleInteractionRedirect = (type, path) => {
    if (!isAuthenticated) {
      navigate('/login/user', { state: { from: { pathname: `/companies/${id}` } } });
      return;
    }
    if (path) {
      navigate(path);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rv-spinner" />
          <p className="text-[13px] font-medium" style={{ color: 'var(--rv-accent)' }}>Loading Company Profile…</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="rv-card-static p-8 max-w-md text-center space-y-4">
          <ShieldAlert className="w-10 h-10 mx-auto" style={{ color: 'var(--rv-danger)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--rv-text)' }}>Error Loading Profile</h2>
          <p className="text-[13px]" style={{ color: 'var(--rv-text-muted)' }}>{error || 'Company not found'}</p>
          <Link to="/companies" className="rv-btn rv-btn-primary rv-btn-sm inline-flex">Back to Companies</Link>
        </div>
      </div>
    );
  }

  // Filter vehicles by selected driver mode & type
  const displayVehicles = vehicles.filter((v) => {
    const isWithDriverMatches = driverMode === 'with-driver' ? v.withDriver === true : v.withDriver === false;
    const isTypeMatches = v.type === vehicleType;
    return isWithDriverMatches && isTypeMatches;
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ color: 'var(--rv-text)' }}>
      <div className="max-w-7xl mx-auto space-y-10">

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

        {/* Company Header Info Card */}
        <div className="rv-card p-8 relative overflow-hidden rv-animate-fadeUp">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl -z-10"
            style={{ background: 'radial-gradient(circle, rgba(244,180,0,0.04) 0%, transparent 70%)' }} />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--rv-text)' }}>{company.name}</h1>
                {company.isVerified && (
                  <span className="rv-badge rv-badge-success" style={{ fontSize: 10 }}>
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Agency
                  </span>
                )}
              </div>

              <p className="text-[13px] max-w-3xl leading-relaxed" style={{ color: 'var(--rv-text-secondary)' }}>
                {company.description || 'Verified local agency renting premium self-drive cars, scooty, bikes and tempo. Connect directly to plan your travels.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px] pt-2" style={{ color: 'var(--rv-text-muted)' }}>
                <p className="flex items-center gap-2 font-medium">
                  <MapPin className="w-4 h-4" style={{ color: 'var(--rv-accent)' }} /> City: <span style={{ color: 'var(--rv-text)' }} className="capitalize">{company.city}</span>
                </p>
                <p className="flex items-center gap-2 font-medium">
                  <Building2 className="w-4 h-4" style={{ color: 'var(--rv-accent)' }} /> Address: <span style={{ color: 'var(--rv-text)' }}>{company.address}</span>
                </p>
                <p className="flex items-center gap-2 font-medium">
                  <Phone className="w-4 h-4" style={{ color: 'var(--rv-accent)' }} /> Agency Contact: <span style={{ color: 'var(--rv-text)' }}>{company.phone}</span>
                </p>
                <p className="flex items-center gap-2 font-medium">
                  <Info className="w-4 h-4" style={{ color: 'var(--rv-accent)' }} /> GPS Facility: <span style={{ color: 'var(--rv-text)' }}>{company.gpsTrackingAvailable ? 'Available (3rd Party)' : 'Not Supported'}</span>
                </p>
              </div>
            </div>

            {/* Rating and Quick Actions */}
            <div className="flex flex-col items-center sm:items-start lg:items-center justify-center p-6 rounded-2xl min-w-[200px] text-center lg:text-center space-y-4"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--rv-border)' }}>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 font-black text-2xl" style={{ color: 'var(--rv-accent)' }}>
                  <Star className="w-6 h-6 fill-current" />
                  <span>{company.rating ? company.rating.toFixed(1) : 'New'}</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--rv-text-muted)' }}>{company.numRatings || 0} Customer Ratings</p>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <a href={`tel:${company.phone}`}
                  onClick={(e) => { if (!isAuthenticated) { e.preventDefault(); handleInteractionRedirect(); } }}
                  className="w-full rv-btn rv-btn-primary rv-btn-sm cursor-pointer uppercase tracking-wider">
                  <PhoneCall className="w-3.5 h-3.5" /> Call Company
                </a>
                <a href={company.googleMapsLink} target="_blank" rel="noopener noreferrer"
                  className="w-full rv-btn rv-btn-secondary rv-btn-sm cursor-pointer uppercase tracking-wider">
                  <Map className="w-3.5 h-3.5" style={{ color: 'var(--rv-accent)' }} /> Google Maps Location
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="space-y-6 rv-animate-fadeUp rv-delay-1">
          <div className="flex justify-center pb-1" style={{ borderBottom: '1px solid var(--rv-border)' }}>
            <div className="flex gap-4">
              {[
                { key: 'without-driver', label: 'Without Driver (Self-Drive)' },
                { key: 'with-driver', label: 'With Driver (Pilot tours)' }
              ].map(({ key, label }) => {
                const isActive = driverMode === key;
                return (
                  <button key={key}
                    onClick={() => {
                      setDriverMode(key);
                      if (key === 'without-driver' && vehicleType === 'auto') setVehicleType('scooty');
                    }}
                    className="pb-4 px-4 font-bold text-sm tracking-wide uppercase transition-all duration-300 cursor-pointer border-b-2"
                    style={{
                      color: isActive ? 'var(--rv-accent)' : 'var(--rv-text-muted)',
                      borderColor: isActive ? 'var(--rv-accent)' : 'transparent'
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--rv-text)'; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--rv-text-muted)'; }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-tabs for Vehicle Types */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { id: 'scooty', label: 'Scooty' },
              { id: 'bike', label: 'Bike' },
              { id: 'car', label: 'Car' },
              ...(driverMode === 'with-driver' ? [{ id: 'auto', label: 'Auto' }] : [])
            ].map((type) => {
              const isActive = vehicleType === type.id;
              return (
                <button key={type.id} onClick={() => setVehicleType(type.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${isActive ? 'bg-yellow-500 text-gray-900 font-bold' : 'bg-transparent text-gray-400 hover:text-white border'}`}
                  style={{
                    borderColor: isActive ? 'transparent' : 'var(--rv-border)',
                    background: isActive ? 'var(--rv-accent)' : 'rgba(255,255,255,0.02)'
                  }}>
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* Vehicles listings */}
          <div className="pt-4">
            {displayVehicles.length === 0 ? (
              <div className="rv-card-static text-center py-16 space-y-3">
                <Compass className="w-10 h-10 mx-auto rv-animate-float" style={{ color: 'var(--rv-accent)', opacity: 0.5 }} />
                <h3 className="text-base font-bold" style={{ color: 'var(--rv-text)' }}>No Vehicles Listed</h3>
                <p className="text-[12px] max-w-xs mx-auto" style={{ color: 'var(--rv-text-muted)' }}>
                  This agency has no available {vehicleType}s listed under {driverMode.replace('-', ' ')} mode.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayVehicles.slice((vehiclesPage - 1) * vehiclesLimit, vehiclesPage * vehiclesLimit).map((vehicle) => (
                  <div key={vehicle._id} className="rv-card overflow-hidden flex flex-col justify-between group">
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--rv-border)' }}>
                      {vehicle.image ? (
                        <img src={vehicle.image} alt={vehicle.modelName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[12px] font-semibold capitalize" style={{ color: 'var(--rv-text-muted)' }}>{vehicle.type} Image</div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="rv-badge rv-badge-accent">{vehicle.type}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2 min-w-0">
                          <h3 className="text-sm font-bold tracking-tight truncate" style={{ color: 'var(--rv-text)' }}>{vehicle.modelName}</h3>
                          {vehicle.availableQuantity > 0 ? (
                            <span className="rv-badge rv-badge-success flex-shrink-0" style={{ fontSize: 9 }}>Available</span>
                          ) : (
                            <span className="rv-badge rv-badge-danger flex-shrink-0" style={{ fontSize: 9 }}>Unavailable</span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[12px]" style={{ color: 'var(--rv-text-secondary)' }}>
                          <p><span className="font-semibold" style={{ color: 'var(--rv-accent)' }}>Seating:</span> {vehicle.seatingCapacity} seats</p>
                          <p><span className="font-semibold" style={{ color: 'var(--rv-accent)' }}>Driver:</span> {vehicle.withDriver ? 'Included' : 'Self-Drive'}</p>
                          <p><span className="font-semibold" style={{ color: 'var(--rv-accent)' }}>Total Qty:</span> {vehicle.totalQuantity || 1}</p>
                          <p><span className="font-semibold" style={{ color: 'var(--rv-accent)' }}>Available:</span> {vehicle.availableQuantity !== undefined ? vehicle.availableQuantity : 1}</p>
                          <p className="col-span-2"><span className="font-semibold" style={{ color: 'var(--rv-accent)' }}>Deposit:</span> ₹{vehicle.securityDeposit}</p>
                        </div>
                      </div>

                      {/* Pricing and Action */}
                      <div className="pt-4 flex items-center justify-between gap-2" style={{ borderTop: '1px solid var(--rv-border)' }}>
                        <div>
                          <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--rv-text-muted)' }}>Rent Per Day</p>
                          <p className="text-base font-black" style={{ color: 'var(--rv-text)' }}>₹{vehicle.pricingPerDay}<span className="text-[11px] font-normal" style={{ color: 'var(--rv-text-muted)' }}> / day</span></p>
                        </div>

                        <div className="flex gap-1.5">
                          <button onClick={() => handleInteractionRedirect(null, `/vehicles/${vehicle._id}`)}
                            className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Details
                          </button>

                          {vehicle.withDriver ? (
                            <button onClick={() => handleInteractionRedirect(null, `/search`)}
                              className="rv-btn rv-btn-primary rv-btn-sm cursor-pointer" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              Request
                            </button>
                          ) : (
                            <a href={`tel:${company.phone}`}
                              onClick={(e) => { if (!isAuthenticated) { e.preventDefault(); handleInteractionRedirect(); } }}
                              className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer" 
                              style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'all 0.2s ease' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--rv-accent)';
                                e.currentTarget.style.borderColor = 'var(--rv-accent)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--rv-text)';
                                e.currentTarget.style.borderColor = 'var(--rv-border)';
                              }}
                            >
                              Call
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        {/* Vehicles Pagination Controls */}
        {!isLoading && displayVehicles.length > vehiclesLimit && (
          <div className="flex items-center justify-center gap-4 pt-6">
            <button disabled={vehiclesPage === 1} onClick={() => setVehiclesPage(prev => Math.max(prev - 1, 1))}
              className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer">Previous</button>
            <span className="text-[12px] font-medium" style={{ color: 'var(--rv-text-muted)' }}>
              Page {vehiclesPage} of {Math.ceil(displayVehicles.length / vehiclesLimit)} ({displayVehicles.length} total)
            </span>
            <button disabled={vehiclesPage === Math.ceil(displayVehicles.length / vehiclesLimit)} onClick={() => setVehiclesPage(prev => Math.min(prev + 1, Math.ceil(displayVehicles.length / vehiclesLimit)))}
              className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer">Next</button>
          </div>
        )}
        </div>

        {/* Reviews Section */}
        <div className="rv-card p-8 space-y-8 rv-animate-fadeUp rv-delay-2">
          <h2 className="text-xl font-extrabold flex items-center gap-2" style={{ color: 'var(--rv-text)' }}>
            <MessageSquare style={{ color: 'var(--rv-accent)' }} /> Reviews & Ratings
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Submit Review Column */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-base font-bold" style={{ color: 'var(--rv-text)' }}>Write a Review</h3>
              {isAuthenticated ? (
                user?.role === 'user' ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    {reviewError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl text-[12px]" style={{ background: 'var(--rv-danger-bg)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--rv-danger)' }}>
                        <ShieldAlert className="w-4 h-4 flex-shrink-0" /> {reviewError}
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--rv-text-muted)' }}>Rating</label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setNewRating(star)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer">
                            <Star className="w-6 h-6 fill-current" style={{ color: star <= newRating ? 'var(--rv-accent)' : 'rgba(255,255,255,0.15)' }} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--rv-text-muted)' }}>Comment</label>
                      <textarea rows="4" value={newComment} onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Tell others about your experience with this agency..."
                        style={{ ...inputStyle, resize: 'none' }} onFocus={focusIn} onBlur={focusOut} required />
                    </div>

                    <button type="submit" disabled={reviewSubmitLoading} className="w-full rv-btn rv-btn-primary cursor-pointer">
                      {reviewSubmitLoading ? <div className="rv-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <p className="text-[12px] p-4 rounded-xl border" style={{ color: 'var(--rv-text-muted)', background: 'rgba(0,0,0,0.15)', borderColor: 'var(--rv-border)' }}>
                    Only registered tourist users can leave reviews.
                  </p>
                )
              ) : (
                <div className="p-4 rounded-xl border text-center space-y-3" style={{ background: 'rgba(0,0,0,0.15)', borderColor: 'var(--rv-border)' }}>
                  <p className="text-[12px]" style={{ color: 'var(--rv-text-secondary)' }}>Please log in to submit a review for this business.</p>
                  <button onClick={() => handleInteractionRedirect()} className="rv-btn rv-btn-primary rv-btn-sm inline-flex cursor-pointer">Log In</button>
                </div>
              )}
            </div>

            {/* Reviews List Column */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-bold" style={{ color: 'var(--rv-text)' }}>Customer Feedback</h3>
              {reviews.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border text-[13px]" style={{ color: 'var(--rv-text-muted)', borderColor: 'var(--rv-border)', background: 'rgba(0,0,0,0.1)' }}>
                  No reviews left for this company yet. Be the first to share your thoughts!
                </div>
              ) : (
                <div className="space-y-4 pr-2">
                  {reviews.slice((reviewsPage - 1) * reviewsLimit, reviewsPage * reviewsLimit).map((rev) => (
                    <div key={rev._id} className="p-4 rounded-xl border space-y-3" style={{ borderColor: 'var(--rv-border)', background: 'rgba(255,255,255,0.01)' }}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                          <img src={rev.user?.avatar || 'https://via.placeholder.com/40'} alt="avatar"
                            className="w-8 h-8 rounded-full border object-cover" style={{ borderColor: 'var(--rv-border)' }} />
                          <div>
                            <p className="text-[13px] font-bold" style={{ color: 'var(--rv-text)' }}>{rev.user?.name || 'Anonymous User'}</p>
                            <p className="text-[10px]" style={{ color: 'var(--rv-text-muted)' }}>{new Date(rev.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: i < rev.rating ? 'var(--rv-accent)' : 'rgba(255,255,255,0.1)' }} />
                          ))}
                        </div>
                      </div>
                      <p className="text-[13px] italic leading-relaxed" style={{ color: 'var(--rv-text-secondary)' }}>
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}

                  {/* Reviews Pagination Controls */}
                  {reviews.length > reviewsLimit && (
                    <div className="flex items-center justify-center gap-4 pt-4">
                      <button disabled={reviewsPage === 1} onClick={() => setReviewsPage(prev => Math.max(prev - 1, 1))}
                        className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer">Prev</button>
                      <span className="text-[12px] font-medium" style={{ color: 'var(--rv-text-muted)' }}>
                        {reviewsPage} / {Math.ceil(reviews.length / reviewsLimit)}
                      </span>
                      <button disabled={reviewsPage === Math.ceil(reviews.length / reviewsLimit)} onClick={() => setReviewsPage(prev => Math.min(prev + 1, Math.ceil(reviews.length / reviewsLimit)))}
                        className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer">Next</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompanyDetails;

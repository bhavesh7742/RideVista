import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import {
  Search as SearchIcon, MapPin, Users, DollarSign, Compass,
  Phone, Navigation, HelpCircle, CheckCircle, X, Star, Calendar, Info, AlertCircle
} from 'lucide-react';

/* ── Reusable styled input/select ─────────────────────────────── */
const inputStyle = {
  width: '100%', padding: '9px 12px', paddingLeft: 12,
  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--rv-border)',
  borderRadius: 'var(--rv-radius-md)', color: 'var(--rv-text)',
  fontSize: 13, transition: 'border-color 200ms ease, box-shadow 200ms ease', outline: 'none',
};
const inputWithIcon = { ...inputStyle, paddingLeft: 34 };
const focusIn = (e) => { e.target.style.borderColor = 'rgba(244,180,0,0.35)'; e.target.style.boxShadow = '0 0 0 3px rgba(244,180,0,0.06)'; };
const focusOut = (e) => { e.target.style.borderColor = 'var(--rv-border)'; e.target.style.boxShadow = 'none'; };
const optBg = { background: '#0c0d11' };
const labelCls = "block text-[10px] font-semibold uppercase tracking-[0.08em] mb-1.5";

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [seating, setSeating] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [rating, setRating] = useState('');
  const [withDriver, setWithDriver] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchWarning, setSearchWarning] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [message, setMessage] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalSuccess, setModalSuccess] = useState(false);

  const [showAiPlanner, setShowAiPlanner] = useState(false);
  const [aiCity, setAiCity] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cityParam = params.get('city') || '';
    const typeParam = params.get('type') || '';
    setCity(cityParam);
    setType(typeParam);
    const executeInitialSearch = async () => {
      setIsLoading(true); setError(null);
      try {
        const queryParams = { page: 1, limit };
        if (cityParam) queryParams.city = cityParam;
        if (typeParam) queryParams.type = typeParam;
        const response = await axiosInstance.get('/vehicles/search', { params: queryParams });
        setVehicles(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalCount(response.data.totalCount || 0);
      } catch (err) { setError(err.response?.data?.message || 'Failed to search vehicles'); }
      finally { setIsLoading(false); }
    };
    executeInitialSearch();
  }, [location.search]);

  const handleSearch = async (e, pageNum = 1, forceSortBy, forceSortOrder) => {
    if (e) e.preventDefault();
    setIsLoading(true); setError(null); setCurrentPage(pageNum);
    try {
      const params = { page: pageNum, limit };
      if (city) params.city = city;
      if (type) params.type = type;
      if (seating) params.seating = seating;
      if (maxBudget) params.maxBudget = maxBudget;
      if (rating) params.rating = rating;
      if (withDriver) params.withDriver = true;
      const activeSortBy = forceSortBy !== undefined ? forceSortBy : sortBy;
      const activeSortOrder = forceSortOrder !== undefined ? forceSortOrder : sortOrder;
      if (activeSortBy) params.sortBy = activeSortBy;
      if (activeSortOrder) params.sortOrder = activeSortOrder;
      const response = await axiosInstance.get('/vehicles/search', { params });
      const data = response.data.data || [];
      setVehicles(data);
      setTotalPages(response.data.totalPages || 1);
      setTotalCount(response.data.totalCount || 0);
      if (data.length === 0) { setSearchWarning('No vehicles match your current filters. Try adjusting your search criteria.'); }
      else { setSearchWarning(null); }
    } catch (err) { console.error('Search error:', err); setError('Failed to fetch matching vehicles. Try another city or keyword!'); }
    finally { setIsLoading(false); }
  };

  const onSortByChange = (e) => { const val = e.target.value; setSortBy(val); handleSearch(null, 1, val, sortOrder); };
  const onSortOrderChange = (e) => { const val = e.target.value; setSortOrder(val); handleSearch(null, 1, sortBy, val); };

  const handleAskTravelAI = async (e) => {
    e.preventDefault();
    const targetCity = aiCity.trim() || city.trim();
    if (!targetCity) { setAiError('Please enter a city name to get travel guidance.'); return; }
    if (!aiQuery.trim()) { setAiError('Please type a question about the city.'); return; }
    if (!isAuthenticated) { navigate('/login/user', { state: { from: { pathname: '/search' } } }); return; }
    setAiLoading(true); setAiError(null); setAiAnswer('');
    try {
      const response = await axiosInstance.post('/ai/travel', { city: targetCity, query: aiQuery.trim() });
      setAiAnswer(response.data.answer);
    } catch (err) {
      console.error('City Travel AI failed:', err);
      setAiError(err.response?.data?.message || 'Travel assistant temporarily unavailable. Please try again.');
    } finally { setAiLoading(false); }
  };

  const handleActionRedirect = (vehicle, route) => {
    if (!isAuthenticated) { navigate('/login/user', { state: { from: { pathname: '/search' } } }); return; }
    if (route) navigate(route);
  };

  const openRequestModal = (vehicle) => {
    if (!isAuthenticated) { navigate('/login/user', { state: { from: { pathname: '/search' } } }); return; }
    setSelectedVehicle(vehicle); setIsModalOpen(true); setModalError(null); setModalLoading(false);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!pickupLocation.trim()) { setModalError('Pickup location is mandatory.'); return; }
    setModalLoading(true); setModalError(null);
    try {
      await axiosInstance.post('/requests', { vehicle: selectedVehicle._id, pickupLocation, message });
      setModalSuccess(true);
      setTimeout(() => { setIsModalOpen(false); setModalSuccess(false); setPickupLocation(''); setMessage(''); handleSearch(); }, 2000);
    } catch (err) { console.error('Request Tour error:', err); setModalError(err.response?.data?.message || 'Failed to submit tour request'); }
    finally { setModalLoading(false); }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ color: 'var(--rv-text)' }}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ─────────────────────────────────── */}
        <div className="text-center md:text-left space-y-2 rv-animate-fadeUp">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--rv-text)' }}>
            Explore Vehicle Fleet Dashboard
          </h1>
          <p className="max-w-2xl text-sm" style={{ color: 'var(--rv-text-secondary)' }}>
            Compare rental vehicles across operating cities and connect directly with local rental agencies.
          </p>
        </div>

        {/* ── Search & Filter Panel ──────────────────── */}
        <form onSubmit={handleSearch} className="rv-glass p-5 sm:p-6 space-y-4 rv-animate-fadeUp rv-delay-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">

            {/* City */}
            <div>
              <label className={labelCls} style={{ color: 'var(--rv-accent)' }}>City</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 pointer-events-none" style={{ color: 'var(--rv-text-muted)' }} />
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Jodhpur"
                  style={inputWithIcon} onFocus={focusIn} onBlur={focusOut} />
              </div>
            </div>

            {/* Type */}
            <div>
              <label className={labelCls} style={{ color: 'var(--rv-accent)' }}>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }} onFocus={focusIn} onBlur={focusOut}>
                <option value="" style={optBg}>Any Type</option>
                <option value="car" style={optBg}>Car</option>
                <option value="bike" style={optBg}>Bike</option>
                <option value="scooty" style={optBg}>Scooty</option>
                <option value="tempo" style={optBg}>Tempo</option>
                <option value="auto" style={optBg}>Auto</option>
              </select>
            </div>

            {/* Capacity */}
            <div>
              <label className={labelCls} style={{ color: 'var(--rv-accent)' }}>Capacity</label>
              <div className="relative">
                <Users className="absolute left-2.5 top-2.5 w-4 h-4 pointer-events-none" style={{ color: 'var(--rv-text-muted)' }} />
                <select value={seating} onChange={(e) => setSeating(e.target.value)} style={{ ...inputWithIcon, cursor: 'pointer', appearance: 'none' }} onFocus={focusIn} onBlur={focusOut}>
                  <option value="" style={optBg}>Any Seating</option>
                  <option value="1" style={optBg}>1+ Seat</option>
                  <option value="2" style={optBg}>2+ Seats</option>
                  <option value="4" style={optBg}>4+ Seats</option>
                  <option value="7" style={optBg}>7+ Seats</option>
                </select>
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className={labelCls} style={{ color: 'var(--rv-accent)' }}>Max Budget/Day</label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 w-4 h-4 pointer-events-none" style={{ color: 'var(--rv-text-muted)' }} />
                <input type="number" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} placeholder="e.g. 2000"
                  style={inputWithIcon} onFocus={focusIn} onBlur={focusOut} />
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className={labelCls} style={{ color: 'var(--rv-accent)' }}>Min Rating</label>
              <select value={rating} onChange={(e) => setRating(e.target.value)} style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }} onFocus={focusIn} onBlur={focusOut}>
                <option value="" style={optBg}>Any Rating</option>
                <option value="3" style={optBg}>3.0+ Stars</option>
                <option value="4" style={optBg}>4.0+ Stars</option>
                <option value="4.5" style={optBg}>4.5+ Stars</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className={labelCls} style={{ color: 'var(--rv-accent)' }}>Sort By</label>
              <select value={sortBy} onChange={onSortByChange} style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }} onFocus={focusIn} onBlur={focusOut}>
                <option value="" style={optBg}>Default (Price)</option>
                <option value="city" style={optBg}>City Name</option>
                <option value="budget" style={optBg}>Budget</option>
                <option value="rating" style={optBg}>Ratings</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className={labelCls} style={{ color: 'var(--rv-accent)' }}>Sort Order</label>
              <select value={sortOrder} onChange={onSortOrderChange} style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }} onFocus={focusIn} onBlur={focusOut}>
                <option value="asc" style={optBg}>Ascending</option>
                <option value="desc" style={optBg}>Descending</option>
              </select>
            </div>

            {/* With Driver */}
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={withDriver} onChange={(e) => setWithDriver(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer accent-yellow-500" />
                <span className="text-[12px] font-semibold" style={{ color: 'var(--rv-text-secondary)' }}>With Driver Only</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3" style={{ borderTop: '1px solid var(--rv-border)' }}>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button type="button" onClick={() => setShowAiPlanner(!showAiPlanner)}
                className="rv-btn rv-btn-sm cursor-pointer flex-1 sm:flex-initial"
                style={{
                  background: showAiPlanner ? 'var(--rv-accent-glow)' : 'transparent',
                  borderColor: showAiPlanner ? 'rgba(244,180,0,0.25)' : 'var(--rv-border)',
                  color: showAiPlanner ? 'var(--rv-accent)' : 'var(--rv-text-secondary)',
                }}
              >
                🗺️ {showAiPlanner ? 'Hide Travel AI' : 'City Travel AI'}
              </button>

              <button type="submit" disabled={isLoading}
                className="rv-btn rv-btn-primary rv-btn-sm cursor-pointer flex-1 sm:flex-initial flex items-center justify-center gap-1.5">
                {isLoading ? (
                  <>
                    <div className="rv-spinner flex-shrink-0" style={{ width: 12, height: 12, borderWidth: 2 }} />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <SearchIcon className="w-3.5 h-3.5" />
                    <span>Search Fleet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* ── City Travel Assistant ──────────────────── */}
        {showAiPlanner && (
          <div className="rv-glass p-5 sm:p-6 space-y-5 rv-animate-scaleIn">
            {/* Header */}
            <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--rv-border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: 'var(--rv-accent-glow)', border: '1px solid rgba(244,180,0,0.2)' }}>🗺️</div>
              <div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--rv-text)' }}>City Travel Assistant</h3>
                <p className="text-[11px]" style={{ color: 'var(--rv-text-muted)' }}>
                  Ask anything about a city — places to visit, food, itineraries, culture, safety tips and more.
                </p>
              </div>
            </div>

            {/* Error */}
            {aiError && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-[12px]"
                style={{ background: 'var(--rv-danger-bg)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--rv-danger)' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {aiError}
              </div>
            )}

            <form onSubmit={handleAskTravelAI} className="space-y-4">
              {/* City Input */}
              <div>
                <label className={labelCls} style={{ color: 'var(--rv-accent)' }}>Destination City</label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 pointer-events-none" style={{ color: 'var(--rv-text-muted)' }} />
                  <input
                    type="text"
                    value={aiCity || city}
                    onChange={(e) => setAiCity(e.target.value)}
                    placeholder="e.g. Jodhpur, Jaipur, Udaipur..."
                    style={{ ...inputStyle, paddingLeft: 34 }}
                    onFocus={focusIn} onBlur={focusOut}
                  />
                </div>
                {city && !aiCity && (
                  <p className="text-[10px] mt-1" style={{ color: 'var(--rv-text-muted)' }}>
                    Using city from search filter: <strong style={{ color: 'var(--rv-accent)' }}>{city}</strong>
                  </p>
                )}
              </div>

              {/* Question */}
              <div>
                <label className={labelCls} style={{ color: 'var(--rv-accent)' }}>Your Question</label>
                <textarea
                  rows={3}
                  required
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="e.g. What are the best places to visit? · One day itinerary · Famous local food · Hidden gems · Best time to visit..."
                  style={{ ...inputStyle, resize: 'none' }}
                  onFocus={focusIn} onBlur={focusOut}
                />
              </div>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-1.5">
                {['Best places to visit', 'One day itinerary', 'Famous food', 'Hidden gems', 'Local markets', 'Photography spots', 'Safety tips', 'Budget travel'].map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setAiQuery(chip)}
                    className="text-[10px] px-2.5 py-1 rounded-full cursor-pointer transition-all"
                    style={{
                      background: aiQuery === chip ? 'var(--rv-accent-glow)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${aiQuery === chip ? 'rgba(244,180,0,0.3)' : 'var(--rv-border)'}`,
                      color: aiQuery === chip ? 'var(--rv-accent)' : 'var(--rv-text-muted)',
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="rv-btn rv-btn-primary rv-btn-sm cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {aiLoading ? (
                    <>
                      <div className="rv-spinner flex-shrink-0" style={{ width: 12, height: 12, borderWidth: 2 }} />
                      <span>Asking AI...</span>
                    </>
                  ) : (
                    <><span>🗺️</span><span>Ask Travel AI</span></>
                  )}
                </button>
              </div>
            </form>

            {/* AI Answer */}
            {aiAnswer && (
              <div className="rv-card-static p-5 space-y-2 rv-animate-fadeUp" style={{ borderColor: 'rgba(244,180,0,0.12)' }}>
                <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid var(--rv-border)' }}>
                  <span className="text-base">🗺️</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--rv-accent)' }}>
                    Travel Guide — {aiCity || city}
                  </span>
                </div>
                <div
                  className="text-[12px] leading-relaxed whitespace-pre-line"
                  style={{ color: 'var(--rv-text-secondary)' }}
                >
                  {aiAnswer}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Alerts ────────────────────────────────── */}
        {error && (
          <div className="flex items-center justify-center gap-2 p-4 rounded-xl text-[12px]" style={{ background: 'var(--rv-danger-bg)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--rv-danger)' }}>
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
        {searchWarning && (
          <div className="flex items-center justify-center gap-2 p-4 rounded-xl text-[12px]" style={{ background: 'var(--rv-warning-bg)', border: '1px solid rgba(251,191,36,0.15)', color: 'var(--rv-warning)' }}>
            <AlertCircle className="w-4 h-4" /> {searchWarning}
            <button onClick={() => setSearchWarning(null)} className="ml-2 cursor-pointer" style={{ color: 'var(--rv-warning)' }}><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* ── Results Grid ──────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rv-skeleton h-[420px] rounded-2xl" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          /* Empty State */
          <div className="rv-card-static text-center py-20 space-y-4">
            <Compass className="w-10 h-10 mx-auto rv-animate-float" style={{ color: 'var(--rv-accent)' }} />
            <h3 className="text-base font-bold" style={{ color: 'var(--rv-text)' }}>No Vehicles Found</h3>
            <p className="text-[12px] max-w-md mx-auto" style={{ color: 'var(--rv-text-muted)' }}>
              We couldn't find any available rentals matching those filters. Try adjusting your seating capacity or max budget!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} className="rv-card overflow-hidden flex flex-col justify-between group">

                {/* Image */}
                <div className="relative h-64 overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--rv-border)' }}>
                  {vehicle.image ? (
                    <img src={vehicle.image} alt={vehicle.modelName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1.5" style={{ color: 'var(--rv-text-muted)' }}>
                      <HelpCircle className="w-7 h-7" />
                      <span className="text-[10px]">No Image Available</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="rv-badge rv-badge-accent">{vehicle.type}</span>
                  </div>
                  {vehicle.company?.isVerified && (
                    <div className="absolute top-3 right-3">
                      <span className="rv-badge rv-badge-success" style={{ fontSize: 9 }}>
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <h3 className="text-sm font-bold tracking-tight truncate" style={{ color: 'var(--rv-text)' }}>{vehicle.modelName}</h3>
                        <p className="text-[11px] font-semibold" style={{ color: 'var(--rv-accent)' }}>Provided by {vehicle.company?.name || 'Local Partner'}</p>
                        <p className="text-[10px]" style={{ color: 'var(--rv-text-muted)' }}>Owner: {vehicle.company?.owner?.name || 'Verified Agency'}</p>
                      </div>
                      <div className="rv-badge rv-badge-accent flex-shrink-0" style={{ padding: '3px 8px', fontSize: 11 }}>
                        <Star className="w-3 h-3 fill-current" />
                        {vehicle.company?.rating ? vehicle.company.rating.toFixed(1) : 'New'}
                      </div>
                    </div>

                    {/* Price & Specs */}
                    <div className="grid grid-cols-2 gap-2 pt-2 text-[12px]" style={{ borderTop: '1px solid var(--rv-border)' }}>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--rv-text-muted)' }}>Price per Day</span>
                        <span className="text-sm font-extrabold" style={{ color: 'var(--rv-text)' }}>₹{vehicle.pricingPerDay} / day</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--rv-text-muted)' }}>Security Deposit</span>
                        <span className="text-[12px] font-semibold" style={{ color: 'var(--rv-text-secondary)' }}>₹{vehicle.securityDeposit}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]" style={{ color: 'var(--rv-text-muted)' }}>
                      <div><span className="font-semibold" style={{ color: 'var(--rv-accent)', opacity: 0.8 }}>Capacity:</span> {vehicle.seatingCapacity} Seater</div>
                      <div><span className="font-semibold" style={{ color: 'var(--rv-accent)', opacity: 0.8 }}>Location:</span> <span className="capitalize">{vehicle.company?.city}</span></div>
                      <div className="col-span-2 truncate" title={vehicle.company?.address}>
                        <span className="font-semibold" style={{ color: 'var(--rv-accent)', opacity: 0.8 }}>Address:</span> {vehicle.company?.address}
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold" style={{ color: 'var(--rv-accent)', opacity: 0.8 }}>Manager:</span> {vehicle.company?.phone || vehicle.company?.owner?.phone}
                      </div>
                    </div>

                    {/* Spec badge */}
                    <div className="flex gap-1.5 pt-1">
                      {vehicle.withDriver ? (
                        <span className="rv-badge rv-badge-accent" style={{ fontSize: 10 }}>Driver Included</span>
                      ) : (
                        <span className="rv-badge rv-badge-neutral" style={{ fontSize: 10 }}>Self-Drive (Without Driver)</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 flex gap-2" style={{ borderTop: '1px solid var(--rv-border)' }}>
                    <button onClick={() => handleActionRedirect(vehicle, `/vehicles/${vehicle._id}`)}
                      className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer flex-1" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      View More
                    </button>
                    {vehicle.withDriver ? (
                      <button onClick={() => openRequestModal(vehicle)}
                        className="rv-btn rv-btn-primary rv-btn-sm cursor-pointer flex-1" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Request Driver
                      </button>
                    ) : (
                      <a href={`tel:${vehicle.company?.phone}`}
                        onClick={(e) => { if (!isAuthenticated) { e.preventDefault(); handleActionRedirect(); } }}
                        className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer flex-1"
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
                        <Phone className="w-3.5 h-3.5" /> Manager
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ────────────────────────────── */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-6 pb-4">
            <button disabled={currentPage === 1 || isLoading} onClick={() => handleSearch(null, currentPage - 1)}
              className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer">Previous</button>
            <span className="text-[12px] font-medium" style={{ color: 'var(--rv-text-muted)' }}>
              Page {currentPage} of {totalPages} ({totalCount} total)
            </span>
            <button disabled={currentPage === totalPages || isLoading} onClick={() => handleSearch(null, currentPage + 1)}
              className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer">Next</button>
          </div>
        )}
      </div>

      {/* ── Driver Request Modal ────────────────────── */}
      {isModalOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="rv-glass max-w-md w-full p-6 space-y-4 relative rv-animate-scaleIn" style={{ boxShadow: 'var(--rv-shadow-xl)' }}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 cursor-pointer transition-colors" style={{ color: 'var(--rv-text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--rv-text)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--rv-text-muted)'}>
              <X className="w-5 h-5" />
            </button>

            <div className="pb-3" style={{ borderBottom: '1px solid var(--rv-border)' }}>
              <h3 className="text-base font-bold" style={{ color: 'var(--rv-text)' }}>Request Driver Tour</h3>
              <p className="text-[11px]" style={{ color: 'var(--rv-text-muted)' }}>Model: {selectedVehicle.modelName} ({selectedVehicle.company?.name})</p>
            </div>

            {modalError && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-[12px]" style={{ background: 'var(--rv-danger-bg)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--rv-danger)' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {modalError}
              </div>
            )}

            {modalSuccess ? (
              <div className="text-center py-8 space-y-3 rv-animate-scaleIn">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ background: 'var(--rv-success-bg)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <CheckCircle className="w-6 h-6" style={{ color: 'var(--rv-success)' }} />
                </div>
                <h4 className="font-bold text-sm" style={{ color: 'var(--rv-text)' }}>Request Submitted!</h4>
                <p className="text-[11px]" style={{ color: 'var(--rv-text-muted)' }}>Your tour coordination request has been sent to the rental agency available drivers.</p>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <label className="text-[12px] font-medium block mb-1.5" style={{ color: 'var(--rv-text-secondary)' }}>Pickup Location or Google Maps Link</label>
                  <input type="text" required value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="e.g. Jodhpur Railway Station Gate 1 / Maps link"
                    style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div>
                  <label className="text-[12px] font-medium block mb-1.5" style={{ color: 'var(--rv-text-secondary)' }}>Message (Optional)</label>
                  <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe any tourist destinations or custom route timings"
                    style={{ ...inputStyle, resize: 'none' }} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <button type="submit" disabled={modalLoading} className="w-full rv-btn rv-btn-primary cursor-pointer flex items-center justify-center gap-2">
                  {modalLoading ? (
                    <>
                      <div className="rv-spinner flex-shrink-0" style={{ width: 14, height: 14, borderWidth: 2 }} />
                      <span>Sending...</span>
                    </>
                  ) : 'Send Driver Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;

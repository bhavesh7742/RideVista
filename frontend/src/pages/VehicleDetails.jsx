import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import {
  Car, ShieldCheck, MapPin, Building, Star, Phone, Map,
  ArrowLeft, Compass, Info, Check, X, ShieldAlert
} from 'lucide-react';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchVehicleDetails(); }, [id]);

  const fetchVehicleDetails = async () => {
    setIsLoading(true); setError(null);
    try {
      const response = await axiosInstance.get(`/vehicles/${id}`);
      setVehicle(response.data.data.vehicle);
    } catch (err) { console.error('Fetch vehicle details error:', err); setError(err.response?.data?.message || 'Failed to load vehicle details'); }
    finally { setIsLoading(false); }
  };

  const handleActionClick = (path) => {
    if (!isAuthenticated) { navigate('/login/user', { state: { from: { pathname: `/vehicles/${id}` } } }); return; }
    if (path) navigate(path);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rv-spinner" />
          <p className="text-[13px] font-medium" style={{ color: 'var(--rv-accent)' }}>Loading Vehicle Details…</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="rv-card-static p-8 max-w-md text-center space-y-4">
          <ShieldAlert className="w-10 h-10 mx-auto" style={{ color: 'var(--rv-danger)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--rv-text)' }}>Error Loading Details</h2>
          <p className="text-[13px]" style={{ color: 'var(--rv-text-muted)' }}>{error || 'Vehicle not found'}</p>
          <Link to="/search" className="rv-btn rv-btn-primary rv-btn-sm inline-flex">Back to Explore Fleet</Link>
        </div>
      </div>
    );
  }

  const { company } = vehicle;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ color: 'var(--rv-text)' }}>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Back Link */}
        <Link to="/search" className="inline-flex items-center gap-2 text-[13px] font-medium transition-colors duration-200"
          style={{ color: 'var(--rv-text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--rv-accent)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--rv-text-muted)'}>
          <ArrowLeft className="w-4 h-4" /> Back to Explore Fleet
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Image */}
          <div className="rv-card-static p-4 space-y-4 rv-animate-fadeUp">
            <div className="relative h-72 sm:h-96 rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--rv-border)' }}>
              {vehicle.image ? (
                <img src={vehicle.image} alt={vehicle.modelName} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-[13px] font-semibold capitalize" style={{ color: 'var(--rv-text-muted)' }}>{vehicle.type} Image</div>
              )}
              <span className="rv-badge rv-badge-accent absolute top-4 left-4">{vehicle.type}</span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6 rv-animate-fadeUp rv-delay-1">

            {/* Vehicle Info */}
            <div className="rv-card-static p-6 sm:p-8 space-y-4">
              <div className="pb-4" style={{ borderBottom: '1px solid var(--rv-border)' }}>
                <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--rv-accent)' }}>Vehicle Specification</span>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--rv-text)' }}>{vehicle.modelName}</h1>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[13px]">
                {[
                  { label: 'Vehicle Type', value: vehicle.type, capitalize: true },
                  { label: 'Seating Capacity', value: `${vehicle.seatingCapacity} Seats` },
                  { label: 'Security Deposit', value: `₹${vehicle.securityDeposit}`, accent: true },
                  { label: 'Driver Support', value: vehicle.withDriver ? 'Driver Tour Coordination' : 'Self-Drive (Without Driver)' },
                  { label: 'Available Quantity', value: `${vehicle.availableQuantity !== undefined ? vehicle.availableQuantity : 1} units available (out of ${vehicle.totalQuantity || 1})`, success: true },
                  { label: 'Operating City', value: company?.city, capitalize: true },
                ].map(({ label, value, capitalize: cap, accent, success }) => (
                  <div key={label}>
                    <span className="block text-[10px]" style={{ color: 'var(--rv-text-muted)' }}>{label}</span>
                    <span className={`font-medium ${cap ? 'capitalize' : ''}`} style={{ color: success ? 'var(--rv-success)' : accent ? 'var(--rv-accent)' : 'var(--rv-text)' }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="rv-card-static p-4 flex items-center justify-between mt-4">
                <div>
                  <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--rv-text-muted)' }}>Daily Rental Price</span>
                  <p className="text-xl font-black" style={{ color: 'var(--rv-text)' }}>₹{vehicle.pricingPerDay} <span className="text-[11px] font-normal" style={{ color: 'var(--rv-text-muted)' }}>/ day</span></p>
                </div>
                {vehicle.withDriver ? (
                  <button onClick={() => handleActionClick('/search')} className="rv-btn rv-btn-primary rv-btn-sm cursor-pointer" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Request Driver
                  </button>
                ) : (
                  <a href={`tel:${company?.phone}`}
                    onClick={(e) => { if (!isAuthenticated) { e.preventDefault(); handleActionClick(); } }}
                    className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <Phone className="w-3.5 h-3.5" /> Company
                  </a>
                )}
              </div>
            </div>

            {/* Company Info */}
            {company && (
              <div className="rv-card-static p-6 sm:p-8 space-y-4">
                <div className="flex items-start justify-between gap-4 pb-4" style={{ borderBottom: '1px solid var(--rv-border)' }}>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--rv-accent)' }}>Rental Provider</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link to={`/companies/${company._id}`} className="text-base font-bold transition-colors" style={{ color: 'var(--rv-text)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--rv-accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--rv-text)'}>
                        {company.name}
                      </Link>
                      {company.isVerified && <span className="rv-badge rv-badge-success" style={{ fontSize: 9 }}><ShieldCheck className="w-3 h-3" /> Verified</span>}
                    </div>
                  </div>
                  <div className="rv-badge rv-badge-accent" style={{ padding: '3px 8px', fontSize: 12 }}>
                    <Star className="w-3.5 h-3.5 fill-current" /> {company.rating ? company.rating.toFixed(1) : 'New'}
                  </div>
                </div>

                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--rv-text-secondary)' }}>
                  {company.description || 'Verified local agency renting premium self-drive cars, scooty, bikes and tempo. Connect directly to coordinate and reserve.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2" style={{ color: 'var(--rv-text-muted)' }}>
                  <p><span className="font-semibold" style={{ color: 'var(--rv-text-secondary)' }}>Unique Company ID:</span> <span className="font-mono" style={{ color: 'var(--rv-text-secondary)' }}>{company._id}</span></p>
                  <p><span className="font-semibold" style={{ color: 'var(--rv-text-secondary)' }}>Owner Name:</span> <span className="capitalize" style={{ color: 'var(--rv-text-secondary)' }}>{company.owner?.name || 'Authorized Partner'}</span></p>
                  <p><span className="font-semibold" style={{ color: 'var(--rv-text-secondary)' }}>Hotline Call:</span> <span style={{ color: 'var(--rv-text-secondary)' }}>{company.phone}</span></p>
                  <p><span className="font-semibold" style={{ color: 'var(--rv-text-secondary)' }}>Manager Mobile:</span> <span style={{ color: 'var(--rv-text-secondary)' }}>{company.owner?.phone || company.phone}</span></p>
                  <p className="sm:col-span-2"><span className="font-semibold" style={{ color: 'var(--rv-text-secondary)' }}>Full Address:</span> <span style={{ color: 'var(--rv-text-secondary)' }}>{company.address}</span></p>
                </div>

                <div className="pt-2">
                  <a href={company.googleMapsLink} target="_blank" rel="noopener noreferrer"
                    className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer w-full" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <Map className="w-3.5 h-3.5" style={{ color: 'var(--rv-accent)' }} /> Open Maps Location
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;

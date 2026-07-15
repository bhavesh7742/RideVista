import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Building2, MapPin, Phone, Star, ShieldCheck, ArrowRight, Compass, AlertCircle } from 'lucide-react';

const RentalCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    setIsLoading(true); setError(null);
    try {
      const response = await axiosInstance.get('/companies');
      setCompanies(response.data.data.companies || []);
    } catch (err) { console.error('Fetch companies error:', err); setError('Failed to load registered rental companies'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ color: 'var(--rv-text)' }}>
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div className="text-center space-y-3 rv-animate-fadeUp">
          <span className="rv-badge rv-badge-accent">Partner Network</span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--rv-text)' }}>
            Our Partner Rental Companies
          </h1>
          <p className="max-w-2xl mx-auto text-sm" style={{ color: 'var(--rv-text-secondary)' }}>
            Skip middlemen and coordinate directly with local verified vehicle operators in Rajasthan.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto flex items-center justify-center gap-2 p-4 rounded-xl text-[12px]"
            style={{ background: 'var(--rv-danger-bg)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--rv-danger)' }}>
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => <div key={n} className="rv-skeleton h-[260px] rounded-2xl" />)}
          </div>
        ) : companies.length === 0 ? (
          <div className="rv-card-static text-center py-20 space-y-4">
            <Compass className="w-10 h-10 mx-auto rv-animate-float" style={{ color: 'var(--rv-accent)' }} />
            <h3 className="text-base font-bold" style={{ color: 'var(--rv-text)' }}>No Companies Found</h3>
            <p className="text-[12px] max-w-sm mx-auto" style={{ color: 'var(--rv-text-muted)' }}>
              There are currently no registered rental companies. Check back later!
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.slice((currentPage - 1) * limit, currentPage * limit).map((company) => (
                <div key={company._id} className="rv-card p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <h3 className="text-base font-bold tracking-tight truncate" style={{ color: 'var(--rv-text)' }}>{company.name}</h3>
                        <p className="text-[11px] font-medium capitalize flex items-center gap-1" style={{ color: 'var(--rv-accent)' }}>
                          <MapPin className="w-3.5 h-3.5" /> {company.city}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <div className="rv-badge rv-badge-accent" style={{ padding: '3px 8px', fontSize: 12 }}>
                          <Star className="w-3.5 h-3.5 fill-current" /> {company.rating ? company.rating.toFixed(1) : 'New'}
                        </div>
                        {company.isVerified && (
                          <span className="rv-badge rv-badge-success" style={{ fontSize: 9 }}>
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[13px] line-clamp-3" style={{ color: 'var(--rv-text-secondary)' }}>
                      {company.description || 'Verified local agency renting premium self-drive cars, scooty, bikes and tempo. Connect directly to plan your travels.'}
                    </p>

                    <div className="pt-2 space-y-1.5 text-[11px]" style={{ color: 'var(--rv-text-muted)' }}>
                      <p className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 flex-shrink-0" /> {company.address}</p>
                      <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 flex-shrink-0" /> {company.phone}</p>
                    </div>
                  </div>

                  <div className="pt-5 mt-5" style={{ borderTop: '1px solid var(--rv-border)' }}>
                    <Link to={`/companies/${company._id}`}
                      className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer w-full" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Visit Company <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--rv-accent)' }} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {companies.length > limit && (
              <div className="flex items-center justify-center gap-4 pt-6">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer">Previous</button>
                <span className="text-[12px] font-medium" style={{ color: 'var(--rv-text-muted)' }}>
                  Page {currentPage} of {Math.ceil(companies.length / limit)} ({companies.length} total)
                </span>
                <button disabled={currentPage === Math.ceil(companies.length / limit)} onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(companies.length / limit)))}
                  className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RentalCompanies;

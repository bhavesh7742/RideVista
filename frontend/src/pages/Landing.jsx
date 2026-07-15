import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Search, ShieldCheck, HeartHandshake, Users, Info, MapPin } from 'lucide-react';
import RideVistaLoader from '../components/RideVistaLoader';

const Landing = () => {
  const [searchCity, setSearchCity] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('scroll') === 'about') {
      setTimeout(() => {
        const el = document.getElementById('about-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      navigate(`/search?city=${encodeURIComponent(searchCity.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div style={{ color: 'var(--rv-text)' }}>

      {/* ═══════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════ */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">

        {/* Ambient gradient blobs */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="rv-ambient-blob" style={{ width: 600, height: 600, top: '-15%', left: '10%', background: 'radial-gradient(circle, rgba(244,180,0,0.06) 0%, transparent 70%)' }} />
          <div className="rv-ambient-blob" style={{ width: 500, height: 500, bottom: '-10%', right: '5%', background: 'radial-gradient(circle, rgba(59,130,246,0.03) 0%, transparent 70%)', animationDelay: '3s' }} />
          <div className="rv-ambient-blob" style={{ width: 400, height: 400, top: '40%', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(244,180,0,0.03) 0%, transparent 70%)', animationDelay: '1.5s' }} />
        </div>

        <div className="max-w-3xl mx-auto flex flex-col items-center">

          {/* Badge */}
          <span className="rv-badge rv-badge-accent mb-5 rv-animate-fadeUp">
            Now Operating in Rajasthan & More
          </span>

          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] rv-animate-fadeUp rv-delay-1"
            style={{ color: 'var(--rv-text)' }}
          >
            Explore Your City with
            <br />
            <span className="font-sora text-5xl md:text-6xl font-extrabold tracking-tight">
              <span style={{ color: '#f5f5f7', }}>Ride</span>
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Vista
              </span>
            </span>
          </h1>

          {/* Animated Vehicle */}
          <div className="-mt-5 mb-4 flex flex-col items-center rv-animate-fadeUp rv-delay-1">
            <RideVistaLoader size="hero" />
          </div>

          {/* Subtitle */}
          <p
            className="text-sm sm:text-base max-w-lg mx-auto leading-relaxed -mt-0 mb-8 rv-animate-fadeUp rv-delay-3"
            style={{ color: 'var(--rv-text-secondary)' }}
          >
            Search top-tier vehicle rentals in your city, compare fleet profiles and connect
            directly with local agencies. Secure, direct, zero platform commission.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-lg relative group mb-8 rv-animate-fadeUp rv-delay-4"
          >
            <MapPin
              className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none transition-colors duration-200"
              style={{ color: 'var(--rv-text-muted)' }}
            />
            <input
              id="hero-city-search"
              type="text"
              placeholder="Search your city…  e.g. Jaipur, Udaipur, Jodhpur"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="w-full pl-11 pr-28 py-3.5 rounded-xl text-[13px] font-medium transition-all duration-200"
              style={{
                background: 'var(--rv-surface)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--rv-border)',
                color: 'var(--rv-text)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(244,180,0,0.35)';
                e.target.style.boxShadow = '0 0 0 3px rgba(244,180,0,0.06)';
                e.target.previousElementSibling.style.color = 'var(--rv-accent)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--rv-border)';
                e.target.style.boxShadow = 'none';
                e.target.previousElementSibling.style.color = 'var(--rv-text-muted)';
              }}
            />
            <button
              type="submit"
              className="rv-btn rv-btn-primary rv-btn-sm absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              style={{ padding: '8px 16px', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              Search
            </button>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 w-full max-w-sm sm:max-w-none rv-animate-fadeUp rv-delay-5">
            <Link
              to="/search"
              className="rv-btn rv-btn-primary rv-btn-lg cursor-pointer w-full sm:w-auto"
            >
              <Search className="w-4 h-4" />
              Explore Rental Fleet
            </Link>
            <Link
              to="/register/company"
              className="rv-btn rv-btn-secondary rv-btn-lg cursor-pointer w-full sm:w-auto"
            >
              Register Your Business
              <ArrowRight className="w-4 h-4" style={{ color: 'var(--rv-accent)' }} />
            </Link>
          </div>

          {/* Trust strip */}
          <div
            className="flex items-center justify-center gap-3 mt-10 text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: 'var(--rv-text-muted)' }}
          >
            <span>Trusted Rental Partners</span>
            <span className="w-1 h-1 rounded-full inline-block" style={{ background: 'rgba(244,180,0,0.3)' }} />
            <span>Verified Companies</span>
            <span className="w-1 h-1 rounded-full inline-block" style={{ background: 'rgba(244,180,0,0.3)' }} />
            <span>Zero Commission</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          ABOUT SECTION
      ═══════════════════════════════════════════════ */}
      <section
        id="about-section"
        className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-20"
        style={{ borderTop: '1px solid var(--rv-border)' }}
      >
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="rv-badge rv-badge-accent">About RideVista</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight" style={{ color: 'var(--rv-text)' }}>
              Direct, Transparent Local Rentals
            </h2>
            <p className="max-w-2xl mx-auto text-sm sm:text-base leading-relaxed" style={{ color: 'var(--rv-text-secondary)' }}>
              RideVista is Rajasthan's premier MERN-powered aggregator that connects travelers directly with physical
              local rental agencies. We remove the middleman and standard broker commissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: 'Verified Companies', desc: 'Every agency listed is physically validated by our system admins. Document verification and license checks happen face-to-face.' },
              { icon: HeartHandshake, title: 'Direct Offline Payments', desc: 'We do not collect commissions. Bookings and security deposits are handled directly with the agency upon vehicle pickup.' },
              { icon: Users, title: 'Pilot Tour Drivers', desc: 'Rent vehicles with local driver integration. Perfect for tourists seeking guided sightseeing around historical cities.' },
            ].map(({ icon: Ic, title, desc }) => (
              <div key={title} className="rv-card p-7 space-y-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--rv-accent-glow)', border: '1px solid rgba(244,180,0,0.1)' }}
                >
                  <Ic className="w-5 h-5" style={{ color: 'var(--rv-accent)' }} />
                </div>
                <h3 className="text-base font-bold" style={{ color: 'var(--rv-text)' }}>{title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--rv-text-secondary)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          RENTAL GUIDE SECTION
      ═══════════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ borderTop: '1px solid var(--rv-border)' }}>
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="rv-badge rv-badge-accent">Rental Guide</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center justify-center gap-2.5" style={{ color: 'var(--rv-text)' }}>
              <Info className="w-5 h-5" style={{ color: 'var(--rv-accent)' }} />
              Professional Rental Instructions
            </h2>
            <p className="max-w-lg mx-auto text-sm" style={{ color: 'var(--rv-text-secondary)' }}>
              Please review these guidelines before renting or booking a vehicle fleet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[13px] leading-relaxed">
            {[
              { emoji: '🔹', title: 'With Driver vs Without Driver', desc: 'Without Driver (Self-Drive) requires you to coordinate pickup and drive yourself. With Driver includes an assigned local pilot driver to navigate the sights.' },
              { emoji: '🔹', title: 'Driving License & Deposit', desc: 'Self-Drive rentals strictly require physical driving license verification at the agency counter. Refundable security deposits are paid offline upon keys collection.' },
              { emoji: '🔹', title: 'GPS Location Services', desc: 'RideVista does NOT perform active GPS tracking. If a company lists GPS, tracking is handled entirely through their third-party system.' },
            ].map(({ emoji, title, desc, bold }) => (
              <div key={title} className="rv-card-static p-6 space-y-3">
                <h4
                  className="font-bold text-sm"
                  style={{ color: 'var(--rv-accent)' }}
                >
                  {emoji} {title}
                </h4>

                <p
                  className="text-[13px] leading-relaxed font-normal"
                  style={{ color: 'var(--rv-text-secondary)' }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

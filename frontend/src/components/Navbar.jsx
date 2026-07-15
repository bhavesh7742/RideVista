import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import { showToast } from '../features/notificationSlice';
import { Car, Menu, X, LogOut, User, LayoutDashboard, ChevronDown, Building2, ShieldAlert, Briefcase } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loginDropOpen, setLoginDropOpen] = useState(false);
  const [registerDropOpen, setRegisterDropOpen] = useState(false);
  const loginRef = useRef(null);
  const registerRef = useRef(null);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSection, setActiveSection] = useState('home');

  // Track active section based on scroll position on Home page
  useEffect(() => {
    if (location.pathname !== '/') return;
    const handleScroll = () => {
      const aboutElement = document.getElementById('about-section');
      if (!aboutElement) return;
      const rect = aboutElement.getBoundingClientRect();
      setActiveSection(rect.top <= 160 ? 'about' : 'home');
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (loginRef.current && !loginRef.current.contains(e.target)) setLoginDropOpen(false);
      if (registerRef.current && !registerRef.current.contains(e.target)) setRegisterDropOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      navigate('/');
    }
    setIsOpen(false);
  };

  const handleScrollTopClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  const handleAboutClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById('about-section');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/?scroll=about');
    }
    setIsOpen(false);
  };

  /* ── Active state helpers ─────────────────────────────── */
  const isLinkActive = (path, isAboutSection = false) => {
    if (path === '/') {
      if (location.pathname === '/') {
        return isAboutSection ? activeSection === 'about' : activeSection === 'home';
      }
      return false;
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsOpen(false);
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'admin': return '/admin/dashboard';
      case 'rental_company': return '/company/dashboard';
      case 'driver': return '/driver/dashboard';
      default: return '/dashboard';
    }
  };

  const closeMobile = () => setIsOpen(false);

  /* ── NavLink component with animated underline ─────── */
  const NavLink = ({ to, onClick, isAbout, children }) => {
    const active = isLinkActive(to, isAbout);
    return (
      <Link
        to={to}
        onClick={onClick}
        className="relative px-1 py-1 text-[13px] font-medium transition-colors duration-200 group"
        style={{ color: active ? 'var(--rv-accent)' : 'var(--rv-text-secondary)' }}
      >
        <span className="group-hover:text-white transition-colors duration-200">{children}</span>
        {/* Animated underline indicator */}
        <span
          className="absolute bottom-[-6px] left-0 h-[2px] rounded-full transition-all duration-300"
          style={{
            width: active ? '100%' : '0%',
            background: 'var(--rv-accent)',
            opacity: active ? 1 : 0,
          }}
        />
        {/* Hover underline (only when not active) */}
        {!active && (
          <span className="absolute bottom-[-6px] left-0 h-[2px] w-0 group-hover:w-full rounded-full bg-white/20 transition-all duration-300" />
        )}
      </Link>
    );
  };

  /* ── Dropdown menu wrapper ─────────────────────────── */
  const DropdownMenu = ({ children }) => (
    <div
      className="absolute right-0 mt-3 w-56 py-2 rounded-xl border rv-animate-scaleIn"
      style={{
        background: 'rgba(15, 17, 22, 0.95)',
        backdropFilter: 'blur(20px)',
        borderColor: 'var(--rv-border)',
        boxShadow: 'var(--rv-shadow-xl)',
        transformOrigin: 'top right',
        zIndex: 50,
      }}
    >
      {children}
    </div>
  );

  const DropdownItem = ({ to, onClick: onClickProp, icon: IconComp, children, danger }) => (
    <Link
      to={to}
      onClick={onClickProp}
      className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-all duration-200"
      style={{ color: danger ? 'var(--rv-danger)' : 'var(--rv-text-secondary)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger ? 'var(--rv-danger-bg)' : 'var(--rv-surface-hover)';
        if (!danger) e.currentTarget.style.color = 'var(--rv-text)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = danger ? 'var(--rv-danger)' : 'var(--rv-text-secondary)';
      }}
    >
      <IconComp className="w-4 h-4" style={{ color: danger ? 'var(--rv-danger)' : 'var(--rv-accent)' }} />
      {children}
    </Link>
  );

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50"
      style={{
        background: 'rgba(7, 8, 10, 0.75)',
        backdropFilter: 'blur(20px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
        borderBottom: '1px solid var(--rv-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ──────────────────────────── */}
          <Link to="/" onClick={handleHomeClick} className="flex items-center gap-2.5 group flex-shrink-0">
            <div
              className="p-2 rounded-lg transition-all duration-300 group-hover:shadow-lg"
              style={{
                background: 'var(--rv-accent)',
                boxShadow: '0 0 0 0 rgba(244,180,0,0)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 16px rgba(244,180,0,0.35)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 0 0 rgba(244,180,0,0)'}
            >
              <Car className="h-4.5 w-4.5 text-gray-900" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Ride<span style={{ color: 'var(--rv-accent)' }}>Vista</span>
            </span>
          </Link>

          {/* ── Desktop Navigation ────────────── */}
          <div className="hidden md:flex items-center gap-6">

            {/* Guest links */}
            {!isAuthenticated && (
              <>
                <NavLink to="/" onClick={handleHomeClick}>Home</NavLink>
                <NavLink to="/search" onClick={handleScrollTopClick}>Explore Fleet</NavLink>
                <NavLink to="/companies" onClick={handleScrollTopClick}>Rental Companies</NavLink>
                <NavLink to="/?scroll=about" onClick={handleAboutClick} isAbout>About</NavLink>
                <NavLink to="/contact" onClick={handleScrollTopClick}>Contact</NavLink>
              </>
            )}

            {/* Authenticated links */}
            {isAuthenticated && (
              <>
                {user?.role === 'user' ? (
                  <>
                    <NavLink to="/search" onClick={handleScrollTopClick}>Explore Fleet</NavLink>
                    <NavLink to="/companies" onClick={handleScrollTopClick}>Rental Companies</NavLink>
                    <NavLink to="/dashboard" onClick={handleScrollTopClick}>My Requests</NavLink>
                    <NavLink to="/profile" onClick={handleScrollTopClick}>Profile</NavLink>
                  </>
                ) : (
                  <>
                    <Link
                      to={getDashboardLink()}
                      onClick={handleScrollTopClick}
                      className="flex items-center gap-1.5 text-[13px] font-medium transition-colors duration-200"
                      style={{ color: 'var(--rv-text-secondary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--rv-text)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--rv-text-secondary)'}
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <NavLink to="/profile" onClick={handleScrollTopClick}>Profile</NavLink>
                  </>
                )}
              </>
            )}

            {/* ── Separator + Auth Actions ────── */}
            <div className="w-px h-6 mx-1" style={{ background: 'var(--rv-border)' }} />

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--rv-surface)', border: '1px solid var(--rv-border)' }}
                >
                  <User className="w-3.5 h-3.5" style={{ color: 'var(--rv-accent)' }} />
                  <span className="text-[13px] font-medium" style={{ color: 'var(--rv-text-secondary)' }}>{user?.name}</span>
                  <span
                    className="rv-badge-accent text-[9px] px-1.5 py-0.5 capitalize"
                    style={{ fontSize: 9 }}
                  >
                    {user?.role?.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rv-btn rv-btn-danger rv-btn-sm cursor-pointer"
                  style={{ padding: '6px 12px', fontSize: 12 }}
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Login Dropdown */}
                <div className="relative" ref={loginRef}>
                  <button
                    onClick={() => { setLoginDropOpen(!loginDropOpen); setRegisterDropOpen(false); }}
                    className="flex items-center gap-1 px-3 py-2 text-[13px] font-medium transition-colors duration-200 cursor-pointer rounded-lg"
                    style={{ color: 'var(--rv-text-secondary)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--rv-text)'; e.currentTarget.style.background = 'var(--rv-surface)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--rv-text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    Sign In <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${loginDropOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {loginDropOpen && (
                    <DropdownMenu>
                      <DropdownItem to="/login/user" onClick={() => setLoginDropOpen(false)} icon={User}>User Login</DropdownItem>
                      <DropdownItem to="/login/company" onClick={() => setLoginDropOpen(false)} icon={Building2}>Company Login</DropdownItem>
                      <DropdownItem to="/login/driver" onClick={() => setLoginDropOpen(false)} icon={Briefcase}>Pilot Login</DropdownItem>
                      <div className="my-1 mx-3" style={{ borderTop: '1px solid var(--rv-border)' }} />
                      <DropdownItem to="/login/admin" onClick={() => setLoginDropOpen(false)} icon={ShieldAlert} danger>Admin Login</DropdownItem>
                    </DropdownMenu>
                  )}
                </div>

                {/* Register Dropdown */}
                <div className="relative" ref={registerRef}>
                  <button
                    onClick={() => { setRegisterDropOpen(!registerDropOpen); setLoginDropOpen(false); }}
                    className="rv-btn rv-btn-primary rv-btn-sm cursor-pointer"
                    style={{ padding: '8px 16px' }}
                  >
                    Register <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${registerDropOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {registerDropOpen && (
                    <DropdownMenu>
                      <DropdownItem to="/register/user" onClick={() => setRegisterDropOpen(false)} icon={User}>Tourist Registration</DropdownItem>
                      <DropdownItem to="/register/company" onClick={() => setRegisterDropOpen(false)} icon={Building2}>Business Registration</DropdownItem>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Mobile menu button ────────────── */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg transition-colors duration-200 cursor-pointer"
              style={{ color: 'var(--rv-text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--rv-surface)'; e.currentTarget.style.color = 'var(--rv-text)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--rv-text-secondary)'; }}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ─────────────────────── */}
      {isOpen && (
        <div
          className="md:hidden px-4 pt-2 pb-4 space-y-1 rv-animate-fadeUp"
          style={{
            background: 'rgba(7, 8, 10, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--rv-border)',
          }}
        >
          {/* Guest mobile links */}
          {!isAuthenticated && (
            <>
              {[
                { to: '/', label: 'Home', onClick: handleHomeClick },
                { to: '/search', label: 'Explore Fleet', onClick: handleScrollTopClick },
                { to: '/companies', label: 'Rental Companies', onClick: handleScrollTopClick },
                { to: '/?scroll=about', label: 'About', onClick: handleAboutClick, isAbout: true },
                { to: '/contact', label: 'Contact', onClick: handleScrollTopClick },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={item.onClick}
                  className="block py-2.5 px-3 rounded-lg text-[13px] font-medium transition-all duration-200"
                  style={{
                    color: isLinkActive(item.to, item.isAbout) ? 'var(--rv-accent)' : 'var(--rv-text-secondary)',
                    background: isLinkActive(item.to, item.isAbout) ? 'var(--rv-accent-glow)' : 'transparent',
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </>
          )}

          {/* Authenticated mobile links */}
          {isAuthenticated && (
            <>
              {user?.role === 'user' ? (
                <>
                  {[
                    { to: '/search', label: 'Explore Fleet' },
                    { to: '/companies', label: 'Rental Companies' },
                    { to: '/dashboard', label: 'My Requests' },
                    { to: '/profile', label: 'Profile' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={handleScrollTopClick}
                      className="block py-2.5 px-3 rounded-lg text-[13px] font-medium transition-all duration-200"
                      style={{
                        color: isLinkActive(item.to) ? 'var(--rv-accent)' : 'var(--rv-text-secondary)',
                        background: isLinkActive(item.to) ? 'var(--rv-accent-glow)' : 'transparent',
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              ) : (
                <>
                  <Link to={getDashboardLink()} onClick={handleScrollTopClick} className="flex items-center gap-2 py-2.5 px-3 rounded-lg text-[13px] font-medium" style={{ color: 'var(--rv-text-secondary)' }}>
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link to="/profile" onClick={handleScrollTopClick} className="block py-2.5 px-3 rounded-lg text-[13px] font-medium" style={{ color: 'var(--rv-text-secondary)' }}>
                    Profile
                  </Link>
                </>
              )}
            </>
          )}

          {/* Auth actions */}
          <div className="pt-2 mt-2" style={{ borderTop: '1px solid var(--rv-border)' }}>
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="py-2 px-3 text-[13px]" style={{ color: 'var(--rv-text-muted)' }}>
                  Logged in as <span className="font-semibold" style={{ color: 'var(--rv-accent)' }}>{user?.name}</span>
                </div>
                <button onClick={handleLogout} className="w-full rv-btn rv-btn-danger rv-btn-sm cursor-pointer">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest px-3 py-1" style={{ color: 'var(--rv-text-muted)' }}>Sign In</p>
                {[
                  { to: '/login/user', label: 'User Login', icon: User },
                  { to: '/login/company', label: 'Company Login', icon: Building2 },
                  { to: '/login/driver', label: 'Pilot Login', icon: Briefcase },
                  { to: '/login/admin', label: 'Admin Login', icon: ShieldAlert },
                ].map(({ to, label, icon: Ic }) => (
                  <Link key={to} to={to} onClick={closeMobile} className="flex items-center gap-2 py-2 px-3 rounded-lg text-[13px] font-medium transition-colors" style={{ color: 'var(--rv-text-secondary)' }}>
                    <Ic className="w-4 h-4" style={{ color: 'var(--rv-accent)' }} /> {label}
                  </Link>
                ))}
                <div className="my-2 mx-3" style={{ borderTop: '1px solid var(--rv-border)' }} />
                <p className="text-[10px] uppercase font-bold tracking-widest px-3 py-1" style={{ color: 'var(--rv-text-muted)' }}>Register</p>
                <Link to="/register/user" onClick={closeMobile} className="block text-center py-2.5 px-3 rounded-lg text-[13px] font-medium" style={{ color: 'var(--rv-text-secondary)' }}>
                  Tourist Registration
                </Link>
                <Link to="/register/company" onClick={closeMobile} className="block text-center py-2.5 rounded-lg rv-btn rv-btn-primary rv-btn-sm" style={{ width: '100%' }}>
                  Business Registration
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

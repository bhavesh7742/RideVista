import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import axiosInstance from '../api/axiosInstance';
import { showToast } from '../features/notificationSlice';
import CompanySetup from './CompanySetup';
import ConfirmationModal from '../components/ConfirmationModal';
import useSuccessFeedback from '../hooks/useSuccessFeedback';
import {
  Building2, Car, UserCheck, CalendarRange, Plus, Users,
  Phone, MapPin, Navigation, CheckCircle, CheckCircle2, HelpCircle, FileText,
  Lock, Mail, AlertCircle, BarChart3, Settings, ShieldCheck,
  Star, Trash2, Edit2, Search, SlidersHorizontal, Check, X, ShieldX, Image, Eye, LogOut
} from 'lucide-react';

const inputStyle = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--rv-border)',
  borderRadius: 'var(--rv-radius-md)', color: 'var(--rv-text)',
  fontSize: 13, transition: 'border-color 200ms ease, box-shadow 200ms ease', outline: 'none',
};
const focusIn = (e) => { e.target.style.borderColor = 'rgba(244,180,0,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(244,180,0,0.08)'; };
const focusOut = (e) => { e.target.style.borderColor = 'var(--rv-border)'; e.target.style.boxShadow = 'none'; };

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('company_dashboard_active_tab') || 'overview';
  });
  useEffect(() => {
    localStorage.setItem('company_dashboard_active_tab', activeTab);
  }, [activeTab]);

  const [company, setCompany] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });
  const { successMessage, setSuccessMessage, clearSuccess } = useSuccessFeedback();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login/company');
  };

  // Data lists
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [requests, setRequests] = useState([]);

  // Pagination States
  const [vehiclesPage, setVehiclesPage] = useState(1);
  const vehiclesLimit = 6;
  const [driversPage, setDriversPage] = useState(1);
  const driversLimit = 6;
  const [bookingsPage, setBookingsPage] = useState(1);
  const bookingsLimit = 6;

  // Load states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter states
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('');
  const [vehicleAvailabilityFilter, setVehicleAvailabilityFilter] = useState('');

  const [driverSearch, setDriverSearch] = useState('');
  const [driverStatusFilter, setDriverStatusFilter] = useState('');

  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');

  // Forms states
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isAddingDriver, setIsAddingDriver] = useState(false);
  const [viewingDriver, setViewingDriver] = useState(null);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formError, setFormError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [createdDriverCreds, setCreatedDriverCreds] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Profile Edit fields
  const [profileName, setProfileName] = useState('');
  const [profileOwnerName, setProfileOwnerName] = useState('');
  const [profileOwnerPhone, setProfileOwnerPhone] = useState('');
  const [profileManagerName, setProfileManagerName] = useState('');
  const [profileManagerPhone, setProfileManagerPhone] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileMapsLink, setProfileMapsLink] = useState('');
  const [profileDescription, setProfileDescription] = useState('');
  const [profileGps, setProfileGps] = useState(false);
  const [profileLogo, setProfileLogo] = useState('');

  // Vehicle Form Fields
  const [vehType, setVehType] = useState('car');
  const [vehModel, setVehModel] = useState('');
  const [vehCapacity, setVehCapacity] = useState('');
  const [vehPrice, setVehPrice] = useState('');
  const [vehDeposit, setVehDeposit] = useState('');
  const [vehWithDriver, setVehWithDriver] = useState(false);
  const [vehTotalQty, setVehTotalQty] = useState('1');
  const [vehAvailableQty, setVehAvailableQty] = useState('1');
  const [vehImages, setVehImages] = useState(''); // Single image URL
  const [vehFiles, setVehFiles] = useState(null); // Selected image file to upload

  useEffect(() => {
    if (vehType === 'auto') {
      setVehWithDriver(true);
    }
  }, [vehType]);

  // Driver Form Fields
  const [drvName, setDrvName] = useState('');
  const [drvEmail, setDrvEmail] = useState('');
  const [drvPhone, setDrvPhone] = useState('');
  const [drvLicense, setDrvLicense] = useState('');
  const [drvExperience, setDrvExperience] = useState('');
  const [drvLanguages, setDrvLanguages] = useState('');
  const [drvDescription, setDrvDescription] = useState('');
  const [drvAvatar, setDrvAvatar] = useState(null); // Photo File or String URL

  // Change Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordFormLoading, setPasswordFormLoading] = useState(false);
  const [passwordFormError, setPasswordFormError] = useState(null);

  const { user, isLoading: authLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'rental_company') {
      navigate('/login/company');
      return;
    }
    fetchDashboardData();
  }, [user, authLoading, navigate]);

  // Reset page states when search/filter inputs change
  useEffect(() => {
    setVehiclesPage(1);
  }, [vehicleSearch, vehicleTypeFilter, vehicleAvailabilityFilter]);

  useEffect(() => {
    setDriversPage(1);
  }, [driverSearch, driverStatusFilter]);

  useEffect(() => {
    setBookingsPage(1);
  }, [bookingSearch, bookingStatusFilter]);

  useEffect(() => {
    setVehiclesPage(1);
    setDriversPage(1);
    setBookingsPage(1);
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get Company details
      const compRes = await axiosInstance.get('/companies/my-company');
      const comp = compRes.data.data.company;
      setCompany(comp);

      // Seed Profile edit states
      setProfileName(comp.name || '');
      setProfileOwnerName(comp.ownerName || '');
      setProfileOwnerPhone(comp.ownerPhone || '');
      setProfileManagerName(comp.managerName || '');
      setProfileManagerPhone(comp.managerPhone || '');
      setProfileEmail(comp.email || '');
      setProfileAddress(comp.address || '');
      setProfileMapsLink(comp.googleMapsLink || '');
      setProfileDescription(comp.description || '');
      setProfileGps(comp.gpsTrackingAvailable || false);
      setProfileLogo(comp.logo || '');

      // 2. Fetch fleet vehicles
      const fleetRes = await axiosInstance.get('/vehicles/my-fleet');
      setVehicles(fleetRes.data.data || []);

      // 3. Fetch drivers of this company
      const drvRes = await axiosInstance.get('/drivers');
      setDrivers(drvRes.data.data || []);

      // 4. Fetch incoming requests
      const reqRes = await axiosInstance.get('/requests/company');
      setRequests(reqRes.data.data || []);

    } catch (err) {
      console.error('Fetch company dashboard data error:', err);
      if (err.response?.status === 404) {
        setCompany(null);
      } else {
        setError('Failed to load company business records. Please register your profile if you haven\'t.');
      }
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
      const response = await axiosInstance.put('/companies/my-company', {
        name: profileName,
        ownerName: profileOwnerName,
        ownerPhone: profileOwnerPhone,
        managerName: profileManagerName,
        managerPhone: profileManagerPhone,
        email: profileEmail,
        address: profileAddress,
        googleMapsLink: profileMapsLink,
        description: profileDescription,
        gpsTrackingAvailable: profileGps,
        logo: profileLogo,
      });

      setCompany(response.data.data.company);
      setSuccessMessage('Company Profile Updated successfully!');
    } catch (err) {
      console.error('Update profile error:', err);
      const errMsg = err.response?.data?.message || 'Failed to update company profile';
      setFormError(errMsg);
    } finally {
      setFormLoading(false);
    }
  };

  // Add/Edit Vehicle submission
  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    clearSuccess();

    // Rule: Auto must have driver
    if (vehType === 'auto' && !vehWithDriver) {
      setFormError('Auto rickshaws must be rented with driver.');
      setFormLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('type', vehType);
      formData.append('modelName', vehModel);
      formData.append('seatingCapacity', Number(vehCapacity));
      formData.append('pricingPerDay', Number(vehPrice));
      formData.append('securityDeposit', Number(vehDeposit || 0));
      formData.append('withDriver', vehWithDriver);
      formData.append('totalQuantity', Number(vehTotalQty));
      formData.append('availableQuantity', Number(vehAvailableQty));
      if (vehFiles) {
        formData.append('image', vehFiles);
      } else if (vehImages) {
        formData.append('image', vehImages);
      }

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };

      if (editingVehicle) {
        await axiosInstance.put(`/vehicles/${editingVehicle._id}`, formData, config);
        setSuccessMessage('Vehicle updated successfully!');
      } else {
        await axiosInstance.post('/vehicles', formData, config);
        setSuccessMessage('Vehicle added to fleet successfully!');
      }

      setIsAddingVehicle(false);
      setEditingVehicle(null);

      // Reset vehicle fields
      setVehModel('');
      setVehCapacity('');
      setVehPrice('');
      setVehDeposit('');
      setVehWithDriver(false);
      setVehTotalQty('1');
      setVehAvailableQty('1');
      setVehImages('');
      setVehFiles(null);

      fetchDashboardData();
    } catch (err) {
      console.error('Vehicle submit error:', err);
      const errMsg = err.response?.data?.message || 'Failed to save vehicle details';
      setFormError(errMsg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditVehicle = (veh) => {
    setFormError(null);
    clearSuccess();
    setEditingVehicle(veh);
    setVehType(veh.type);
    setVehModel(veh.modelName);
    setVehCapacity(veh.seatingCapacity.toString());
    setVehPrice(veh.pricingPerDay.toString());
    setVehDeposit(veh.securityDeposit.toString());
    setVehWithDriver(veh.withDriver);
    setVehTotalQty(veh.totalQuantity.toString());
    setVehAvailableQty(veh.availableQuantity.toString());
    setVehImages(veh.image || '');
    setIsAddingVehicle(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const handleDeleteVehicle = (vehId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Vehicle From Fleet',
      message: 'Are you sure you want to remove this vehicle from your fleet? This action cannot be undone.',
      confirmText: 'Remove Vehicle',
      isDanger: true,
      onConfirm: async () => {
        setActionError(null);
        try {
          await axiosInstance.delete(`/vehicles/${vehId}`);
          setSuccessMessage('Vehicle deleted successfully.');
          fetchDashboardData();
        } catch (err) {
          console.error('Delete vehicle error:', err);
          setActionError(err.response?.data?.message || 'Failed to remove vehicle');
        }
      }
    });
  };

  const handleEditDriver = (drv) => {
    setFormError(null);
    clearSuccess();
    setEditingDriver(drv);
    setDrvName(drv.user?.name || '');
    setDrvEmail(drv.user?.email || '');
    setDrvPhone(drv.user?.phone || '');
    setDrvLicense(drv.licenseNumber || '');
    setDrvExperience(drv.experience?.toString() || '');
    setDrvLanguages(drv.languages ? drv.languages.join(', ') : '');
    setDrvDescription(drv.tourDescription || '');
    setDrvAvatar(drv.user?.avatar || '');
    setIsAddingDriver(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const handleCopyCredentials = () => {
    if (!createdDriverCreds) return;
    const text = `Company ID: ${createdDriverCreds.companyId}\nDriver Email: ${createdDriverCreds.email}\nPassword: ${createdDriverCreds.password}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Add Driver submission (direct addition by owner)
  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    clearSuccess();

    if (!drvAvatar && !editingDriver) {
      setFormError('Driver profile photo is mandatory');
      setFormLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', drvName);
      formData.append('phone', drvPhone);
      formData.append('licenseNumber', drvLicense);
      formData.append('experience', Number(drvExperience || 0));
      formData.append('tourDescription', drvDescription);

      const languagesList = drvLanguages ? drvLanguages.split(',').map(l => l.trim()) : ['Hindi'];
      languagesList.forEach(lang => {
        formData.append('languages', lang);
      });

      if (drvAvatar) {
        formData.append('avatar', drvAvatar);
      }

      if (editingDriver) {
        await axiosInstance.put(`/drivers/${editingDriver._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        setSuccessMessage('Driver details updated successfully!');
      } else {
        const generatedPassword = `pilot@${Math.floor(1000 + Math.random() * 9000)}`;
        formData.append('email', drvEmail);
        formData.append('password', generatedPassword);

        await axiosInstance.post('/drivers', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Set credentials to trigger modal display
        setCreatedDriverCreds({
          companyId: company?.companyId || '',
          email: drvEmail,
          password: generatedPassword,
        });
      }

      // Reset driver fields
      setDrvName('');
      setDrvEmail('');
      setDrvPhone('');
      setDrvLicense('');
      setDrvExperience('');
      setDrvLanguages('');
      setDrvDescription('');
      setDrvAvatar(null);

      setIsAddingDriver(false);
      setEditingDriver(null);
      fetchDashboardData();
    } catch (err) {
      console.error('Driver submit error:', err);
      const errMsg = err.response?.data?.message || 'Failed to save driver details';
      setFormError(errMsg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleApproveDriver = async (driverId) => {
    setActionError(null);
    try {
      await axiosInstance.patch(`/drivers/${driverId}/approve`);
      setSuccessMessage('Driver Approved Successfully');
      fetchDashboardData();
    } catch (err) {
      console.error('Approve driver error:', err);
      setActionError(err.response?.data?.message || 'Failed to approve driver');
    }
  };

  const handleRejectDriver = async (driverId) => {
    setActionError(null);
    try {
      await axiosInstance.patch(`/drivers/${driverId}/reject`);
      setSuccessMessage('Driver Application Rejected');
      fetchDashboardData();
    } catch (err) {
      console.error('Reject driver error:', err);
      setActionError(err.response?.data?.message || 'Failed to reject driver');
    }
  };

  const handleDeleteDriver = (driverId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Driver Profile',
      message: 'Are you sure you want to remove this driver profile?',
      confirmText: 'Remove Driver',
      isDanger: true,
      onConfirm: async () => {
        setActionError(null);
        try {
          await axiosInstance.delete(`/drivers/${driverId}`);
          setSuccessMessage('Driver deleted successfully.');
          fetchDashboardData();
        } catch (err) {
          console.error('Remove driver error:', err);
          setActionError(err.response?.data?.message || 'Failed to remove driver');
        }
      }
    });
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

  if (!authLoading && !loading && error) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl max-w-md text-center space-y-4 animate-scaleUp">
          <ShieldX className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-sm text-gray-400">{error}</p>
          <button onClick={handleLogout} className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (!authLoading && !loading && !company) {
    return <CompanySetup onComplete={fetchDashboardData} />;
  }

  // Filter listings
  const filteredVehicles = vehicles.filter(v => {
    const isSearchMatched = v.modelName.toLowerCase().includes(vehicleSearch.toLowerCase()) || v.type.toLowerCase().includes(vehicleSearch.toLowerCase());
    const isTypeMatched = !vehicleTypeFilter || v.type === vehicleTypeFilter;
    const isAvailMatched = !vehicleAvailabilityFilter || (vehicleAvailabilityFilter === 'available' ? v.availableQuantity > 0 : v.availableQuantity === 0);
    return isSearchMatched && isTypeMatched && isAvailMatched;
  });

  const filteredDrivers = drivers.filter(d => {
    const isSearchMatched = d.user?.name?.toLowerCase().includes(driverSearch.toLowerCase()) || d.licenseNumber.toLowerCase().includes(driverSearch.toLowerCase());
    const isStatusMatched = !driverStatusFilter || d.status === driverStatusFilter;
    return isSearchMatched && isStatusMatched;
  });

  const filteredRequests = requests.filter(r => {
    const isSearchMatched = r.user?.name?.toLowerCase().includes(bookingSearch.toLowerCase()) || r.vehicle?.modelName?.toLowerCase().includes(bookingSearch.toLowerCase()) || r.pickupLocation?.toLowerCase().includes(bookingSearch.toLowerCase());
    const isStatusMatched = !bookingStatusFilter || r.status === bookingStatusFilter;
    return isSearchMatched && isStatusMatched;
  });

  return (
    <div className="bg-[#0b0c10] min-h-screen text-[#c5c6c7] flex flex-col md:flex-row">

      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 flex flex-col p-6 space-y-2 flex-shrink-0 md:h-screen md:sticky md:top-0 overflow-y-auto"
        style={{ background: 'rgba(255,255,255,0.01)', borderRight: '1px solid var(--rv-border)' }}>
        <div className="flex items-center gap-3 pb-4 mb-4" style={{ borderBottom: '1px solid var(--rv-border)' }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--rv-accent-glow)', border: '1px solid rgba(244,180,0,0.15)' }}>
            <Building2 className="w-5 h-5" style={{ color: 'var(--rv-accent)' }} />
          </div>
          <div>
            <h3 className="font-bold text-sm truncate max-w-[150px]" style={{ color: 'var(--rv-text)' }}>{company?.name || 'Loading Business...'}</h3>
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--rv-text-muted)' }}>{company?.city || 'Partner'}</p>
          </div>
        </div>

        {[
          { id: 'overview', label: 'Dashboard Overview', icon: BarChart3 },
          { id: 'profile', label: 'Company Profile', icon: Building2 },
          { id: 'vehicles', label: 'Vehicle Management', icon: Car },
          { id: 'drivers', label: 'Driver Management', icon: Users },
          { id: 'bookings', label: 'Booking Requests', icon: CalendarRange },
          { id: 'analytics', label: 'Analytics Insights', icon: BarChart3 },
          { id: 'settings', label: 'Portal Settings', icon: Settings }
        ].map((tab) => {
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
            <p className="text-[13px] font-medium" style={{ color: 'var(--rv-accent)' }}>Loading Rental Portal Content...</p>
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

        {/* Driver Credentials Confirmation Modal */}
        {createdDriverCreds && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
            <div className="rv-glass max-w-md w-full p-6 space-y-4 relative rv-animate-scaleIn" style={{ boxShadow: 'var(--rv-shadow-xl)' }}>
              
              {/* Icon & Title */}
              <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--rv-border)' }}>
                <div className="p-2 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--rv-accent-glow)', border: '1px solid rgba(244,180,0,0.15)', color: 'var(--rv-accent)' }}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--rv-text)' }}>Driver Account Created</h3>
                </div>
              </div>

              {/* Message */}
              <p className="text-[12px] leading-relaxed font-medium" style={{ color: 'var(--rv-text-secondary)' }}>
                Please note these credentials carefully. They will be required to log in to the Driver (Pilot) Portal.
              </p>

              {/* Display Credentials */}
              <div className="rv-card-static p-4 space-y-2.5 text-[12px]">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--rv-text-muted)' }}>Company ID:</span>
                  <span className="font-mono select-all" style={{ color: 'var(--rv-text)' }}>{createdDriverCreds.companyId}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--rv-text-muted)' }}>Driver Email:</span>
                  <span className="font-mono select-all" style={{ color: 'var(--rv-text)' }}>{createdDriverCreds.email}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--rv-text-muted)' }}>Generated Password:</span>
                  <span className="font-mono select-all" style={{ color: 'var(--rv-accent)' }}>{createdDriverCreds.password}</span>
                </div>
              </div>

              {copySuccess && (
                <p className="text-[10px] text-center animate-fadeIn" style={{ color: 'var(--rv-success)' }}>Credentials copied to clipboard!</p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="flex-1 rv-btn rv-btn-secondary rv-btn-sm cursor-pointer"
                >
                  Copy Credentials
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreatedDriverCreds(null);
                    setCopySuccess(false);
                  }}
                  className="flex-1 rv-btn rv-btn-primary rv-btn-sm cursor-pointer"
                >
                  Close Modal
                </button>
              </div>

            </div>
          </div>
        )}


        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 rv-animate-fadeUp">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4" style={{ borderBottom: '1px solid var(--rv-border)' }}>
              <div>
                <h1 className="text-2xl font-black text-white">Dashboard Overview</h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--rv-text-muted)' }}>Realtime listings count and pilot coordinator operations</p>
              </div>
              <div className="flex items-center gap-2">
                {company.isVerified ? (
                  <span className="rv-badge rv-badge-success">
                    <ShieldCheck className="w-4 h-4" /> Verified Business
                  </span>
                ) : (
                  <span className="rv-badge rv-badge-accent animate-pulse">
                    <AlertCircle className="w-4 h-4" /> Pending Verification
                  </span>
                )}
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              <div className="rv-card p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase" style={{ color: 'var(--rv-text-muted)' }}>Total Fleet Vehicles</p>
                  <p className="text-3xl font-black mt-1" style={{ color: 'var(--rv-text)' }}>{vehicles.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold"
                  style={{ background: 'var(--rv-accent-glow)', border: '1px solid rgba(244,180,0,0.15)', color: 'var(--rv-accent)', fontSize: 18 }}>
                  🚗
                </div>
              </div>

              <div className="rv-card p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase" style={{ color: 'var(--rv-text-muted)' }}>Available Vehicles</p>
                  <p className="text-3xl font-black mt-1" style={{ color: 'var(--rv-success)' }}>
                    {vehicles.filter(v => v.availableQuantity > 0).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold"
                  style={{ background: 'var(--rv-success-bg)', border: '1px solid rgba(52,211,153,0.15)', color: 'var(--rv-success)', fontSize: 18 }}>
                  ✓
                </div>
              </div>

              <div className="rv-card p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase" style={{ color: 'var(--rv-text-muted)' }}>Total Active Pilots</p>
                  <p className="text-3xl font-black mt-1" style={{ color: 'var(--rv-text)' }}>
                    {drivers.filter(d => d.status !== 'pending_approval' && d.status !== 'inactive').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold"
                  style={{ background: 'var(--rv-accent-glow)', border: '1px solid rgba(244,180,0,0.15)', color: 'var(--rv-accent)', fontSize: 18 }}>
                  👥
                </div>
              </div>

              <div className="rv-card p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase" style={{ color: 'var(--rv-text-muted)' }}>Pending Pilot Requests</p>
                  <p className="text-3xl font-black mt-1" style={{ color: 'var(--rv-accent)' }}>
                    {drivers.filter(d => d.status === 'pending_approval').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold"
                  style={{ background: 'var(--rv-accent-glow)', border: '1px solid rgba(244,180,0,0.15)', color: 'var(--rv-accent)', fontSize: 18 }}>
                  ✉
                </div>
              </div>

              <div className="rv-card p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase" style={{ color: 'var(--rv-text-muted)' }}>Tour Requests Received</p>
                  <p className="text-3xl font-black mt-1" style={{ color: 'var(--rv-text)' }}>{requests.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold"
                  style={{ background: 'var(--rv-accent-glow)', border: '1px solid rgba(244,180,0,0.15)', color: 'var(--rv-accent)', fontSize: 18 }}>
                  📋
                </div>
              </div>

              <div className="rv-card p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase" style={{ color: 'var(--rv-text-muted)' }}>Company Rating</p>
                  <p className="text-3xl font-black mt-1 flex items-center gap-1" style={{ color: 'var(--rv-accent)' }}>
                    <Star className="w-6 h-6 fill-current" />
                    {company.rating ? company.rating.toFixed(1) : 'New'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold"
                  style={{ background: 'var(--rv-accent-glow)', border: '1px solid rgba(244,180,0,0.15)', color: 'var(--rv-accent)', fontSize: 18 }}>
                  ★
                </div>
              </div>
            </div>

            {/* Quick alert if unverified */}
            {!company.isVerified && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl text-xs leading-relaxed text-amber-400 space-y-1 animate-pulse">
                <h4 className="font-bold flex items-center gap-1 text-sm"><AlertCircle className="w-4 h-4" /> Company Verification Status: Pending</h4>
                <p>Your business is currently in pending verification mode. Central administrators are reviewing your uploaded verification documents. Once approved, your listings will automatically display the Verified badge across tourist search results.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMPANY PROFILE */}
        {activeTab === 'profile' && (
          <div className="rv-card p-6 sm:p-8 space-y-6 rv-animate-fadeUp">
            <div className="pb-4" style={{ borderBottom: '1px solid var(--rv-border)' }}>
              <h1 className="text-xl sm:text-2xl font-black text-white">Company Profile Settings</h1>
              <p className="text-xs" style={{ color: 'var(--rv-text-muted)' }}>Edit business contact coordinates and maps placement</p>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-4 rounded-xl text-[12px]" style={{ background: 'var(--rv-danger-bg)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--rv-danger)' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {formError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-6">

              {/* Readonly ID */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--rv-text-muted)' }}>UNIQUE COMPANY ID (READ ONLY)</label>
                <input
                  type="text"
                  readOnly
                  value={company.companyId || 'RV-COMP-PENDING'}
                  style={{ ...inputStyle, background: 'rgba(255,255,255,0.02)', cursor: 'not-allowed', color: 'var(--rv-text-muted)', fontFamily: 'monospace' }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Company / Brand Name', value: profileName, setter: setProfileName },
                  { label: 'Business Email', value: profileEmail, setter: setProfileEmail, type: 'email' },
                  { label: 'Owner Name', value: profileOwnerName, setter: setProfileOwnerName },
                  { label: 'Owner Phone', value: profileOwnerPhone, setter: setProfileOwnerPhone, type: 'tel' },
                  { label: 'Manager Name', value: profileManagerName, setter: setProfileManagerName },
                  { label: 'Manager Phone', value: profileManagerPhone, setter: setProfileManagerPhone, type: 'tel' }
                ].map(({ label, value, setter, type = 'text' }) => (
                  <div key={label} className="space-y-1.5">
                    <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>{label}</label>
                    <input
                      type={type}
                      required
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      style={inputStyle}
                      onFocus={focusIn}
                      onBlur={focusOut}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Google Maps Location link</label>
                <input
                  type="url"
                  required
                  value={profileMapsLink}
                  onChange={(e) => setProfileMapsLink(e.target.value)}
                  style={inputStyle}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Office Full Address</label>
                <textarea
                  required
                  rows={2}
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  style={{ ...inputStyle, resize: 'none' }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Company Logo URL (Optional)</label>
                <input
                  type="url"
                  value={profileLogo}
                  onChange={(e) => setProfileLogo(e.target.value)}
                  style={inputStyle}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Company Description</label>
                <textarea
                  required
                  rows={3}
                  value={profileDescription}
                  onChange={(e) => setProfileDescription(e.target.value)}
                  style={{ ...inputStyle, resize: 'none' }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>

              {/* GPS toggle */}
              <div className="rv-card-static p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-[12px] font-semibold flex items-center gap-1" style={{ color: 'var(--rv-text)' }}>
                    <ShieldCheck className="w-4 h-4" style={{ color: 'var(--rv-accent)' }} /> GPS Fleet Tracking Integration
                  </h4>
                  <p className="text-[10px]" style={{ color: 'var(--rv-text-muted)' }}>Provide coordinate integration with 3rd-party mapping services</p>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileGps(!profileGps)}
                  className="w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300"
                  style={{ background: profileGps ? 'var(--rv-accent)' : 'rgba(255,255,255,0.1)' }}
                >
                  <div className="w-4 h-4 rounded-full shadow-md transform transition-all duration-300"
                    style={{ background: 'var(--rv-bg)', transform: profileGps ? 'translateX(24px)' : 'translateX(0)' }} />
                </button>
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
                  ) : 'Update Profile Info'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: VEHICLE MANAGEMENT */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6 animate-fadeIn">
            {!isAddingVehicle && formError && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-xs">
                {formError}
              </div>
            )}

            {/* Header / Trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-yellow-500/10 pb-4">
              <div>
                <h1 className="text-2xl font-black text-white">Vehicle Management</h1>
                <p className="text-xs text-gray-500">Add, edit or update availability quantity of fleet vehicles</p>
              </div>
              <button
                onClick={() => { setIsAddingVehicle(!isAddingVehicle); setEditingVehicle(null); setFormError(null); clearSuccess(); }}
                className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Vehicle
              </button>
            </div>

            {/* Add/Edit Vehicle Form overlay or inline */}
            {isAddingVehicle && (
              <div className="bg-[#1f2833]/15 border border-yellow-500/15 p-6 rounded-2xl shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-yellow-500/10 pb-2">
                  <h3 className="font-bold text-white text-sm">{editingVehicle ? 'Edit Vehicle Profile' : 'Register New Vehicle'}</h3>
                  <button onClick={() => { setIsAddingVehicle(false); setEditingVehicle(null); }} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                </div>

                <form onSubmit={handleVehicleSubmit} className="space-y-4 text-xs">
                  {formError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl text-[12px]" style={{ background: 'var(--rv-danger-bg)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--rv-danger)' }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {formError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

                    <div className="space-y-1.5">
                      <label className="text-gray-300 font-semibold">Vehicle Type</label>
                      <select
                        value={vehType}
                        onChange={(e) => setVehType(e.target.value)}
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                        className="cursor-pointer"
                      >
                        <option value="car" className="bg-[#111]">Car</option>
                        <option value="bike" className="bg-[#111]">Bike</option>
                        <option value="scooty" className="bg-[#111]">Scooty</option>
                        <option value="auto" className="bg-[#111]">Auto</option>
                      </select>
                    </div>

                    {[
                      { label: 'Model Name (e.g. Maruti Swift)', value: vehModel, setter: setVehModel },
                      { label: 'Seating Capacity', value: vehCapacity, setter: setVehCapacity, type: 'number', min: '1' },
                      { label: 'Rent Per Day (₹)', value: vehPrice, setter: setVehPrice, type: 'number', min: '0' },
                      { label: 'Security Deposit Amount (₹)', value: vehDeposit, setter: setVehDeposit, type: 'number', min: '0' },
                      { label: 'Total Quantity', value: vehTotalQty, setter: setVehTotalQty, type: 'number', min: '1' },
                      { label: 'Available Quantity', value: vehAvailableQty, setter: setVehAvailableQty, type: 'number', min: '0' }
                    ].map(({ label, value, setter, type = 'text', min }) => (
                      <div key={label} className="space-y-1.5">
                        <label className="text-gray-300 font-semibold">{label}</label>
                        <input
                          type={type}
                          required
                          min={min}
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          style={inputStyle}
                          onFocus={focusIn}
                          onBlur={focusOut}
                        />
                      </div>
                    ))}

                    <div className="space-y-1.5 flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={vehType === 'auto' ? true : vehWithDriver}
                          disabled={vehType === 'auto'}
                          onChange={(e) => setVehWithDriver(e.target.checked)}
                          className="w-4 h-4 rounded cursor-pointer"
                          style={{ accentColor: 'var(--rv-accent)' }}
                        />
                        <span className="font-semibold text-gray-300">Includes driver tour assistance</span>
                      </label>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-gray-300 font-semibold">Image URL</label>
                      <input
                        type="text"
                        value={vehImages}
                        onChange={(e) => setVehImages(e.target.value)}
                        placeholder="https://images.com/pic1.jpg"
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-gray-300 font-semibold">Upload Vehicle Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setVehFiles(e.target.files[0])}
                        className="block w-full text-[12px] cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold"
                        style={{ color: 'var(--rv-text-secondary)', ...inputStyle, padding: '7px 12px' }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="rv-btn rv-btn-primary rv-btn-sm cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {formLoading ? (
                        <>
                          <div className="rv-spinner flex-shrink-0" style={{ width: 12, height: 12, borderWidth: 2 }} />
                          <span>Saving...</span>
                        </>
                      ) : (editingVehicle ? 'Update Vehicle' : 'Add Vehicle')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Filters */}
            <div className="rv-card-static p-4 flex flex-col sm:flex-row items-center gap-4 text-xs">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color: 'var(--rv-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search vehicle model..."
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 36 }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>

              <select
                value={vehicleTypeFilter}
                onChange={(e) => setVehicleTypeFilter(e.target.value)}
                style={inputStyle}
                onFocus={focusIn}
                onBlur={focusOut}
                className="w-full sm:w-40 cursor-pointer"
              >
                <option value="" className="bg-[#111]">All Types</option>
                <option value="car" className="bg-[#111]">Car</option>
                <option value="bike" className="bg-[#111]">Bike</option>
                <option value="scooty" className="bg-[#111]">Scooty</option>
                <option value="auto" className="bg-[#111]">Auto</option>
              </select>

              <select
                value={vehicleAvailabilityFilter}
                onChange={(e) => setVehicleAvailabilityFilter(e.target.value)}
                style={inputStyle}
                onFocus={focusIn}
                onBlur={focusOut}
                className="w-full sm:w-40 cursor-pointer"
              >
                <option value="" className="bg-[#111]">All Availability</option>
                <option value="available" className="bg-[#111]">Available Only</option>
                <option value="unavailable" className="bg-[#111]">Not Available (Qty 0)</option>
              </select>
            </div>

            {/* Table */}
            <div className="rv-card-static overflow-x-auto shadow-md">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b font-bold uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.01)', borderColor: 'var(--rv-border)', color: 'var(--rv-accent)' }}>
                    <th className="p-4">Vehicle Model</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Quantity (Total/Avail)</th>
                    <th className="p-4">Daily Rent</th>
                    <th className="p-4">Deposit</th>
                    <th className="p-4">Driver Option</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-300" style={{ borderColor: 'var(--rv-border)' }}>
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-500">
                        No vehicles found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredVehicles.slice((vehiclesPage - 1) * vehiclesLimit, vehiclesPage * vehiclesLimit).map((veh) => (
                      <tr key={veh._id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <td className="p-4 font-bold text-white flex items-center gap-2">
                          {veh.image ? (
                            <img src={veh.image} alt={veh.modelName} className="w-9 h-9 rounded object-cover border" style={{ borderColor: 'var(--rv-border)' }} />
                          ) : (
                            <div className="w-9 h-9 rounded flex items-center justify-center text-[10px] border" style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'var(--rv-border)' }}>No Pic</div>
                          )}
                          {veh.modelName}
                        </td>
                        <td className="p-4 capitalize">{veh.type}</td>
                        <td className="p-4 font-semibold">{veh.totalQuantity} total / {veh.availableQuantity} avail</td>
                        <td className="p-4 font-bold">₹{veh.pricingPerDay}</td>
                        <td className="p-4">₹{veh.securityDeposit}</td>
                        <td className="p-4">
                          {veh.withDriver ? (
                            <span style={{ color: 'var(--rv-accent)' }} className="font-medium">With Pilot</span>
                          ) : (
                            <span style={{ color: 'var(--rv-text-muted)' }}>Self-Drive</span>
                          )}
                        </td>
                        <td className="p-4">
                          {veh.availableQuantity > 0 ? (
                            <span className="rv-badge rv-badge-success text-[10px]">Available</span>
                          ) : (
                            <span className="rv-badge rv-badge-danger text-[10px]">Unavailable</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditVehicle(veh)}
                              className="p-1.5 rounded-lg cursor-pointer transition-colors border text-yellow-400 hover:bg-yellow-500 hover:text-gray-900"
                              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--rv-border)' }}
                              title="Edit Vehicle"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(veh._id)}
                              className="p-1.5 rounded-lg cursor-pointer transition-colors border text-red-400 hover:bg-red-500 hover:text-white"
                              style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.15)' }}
                              title="Delete Vehicle"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Vehicles Pagination */}
            {filteredVehicles.length > vehiclesLimit && (
              <div className="flex items-center justify-center gap-4 pt-4 pb-2 text-xs">
                <button
                  disabled={vehiclesPage === 1}
                  onClick={() => setVehiclesPage(prev => Math.max(prev - 1, 1))}
                  className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer"
                >
                  Prev
                </button>
                <span className="font-medium" style={{ color: 'var(--rv-text-muted)' }}>
                  Page {vehiclesPage} of {Math.ceil(filteredVehicles.length / vehiclesLimit)} ({filteredVehicles.length} total)
                </span>
                <button
                  disabled={vehiclesPage === Math.ceil(filteredVehicles.length / vehiclesLimit)}
                  onClick={() => setVehiclesPage(prev => Math.min(prev + 1, Math.ceil(filteredVehicles.length / vehiclesLimit)))}
                  className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}

          </div>
        )}

        {/* TAB 4: DRIVER MANAGEMENT */}
        {activeTab === 'drivers' && (
          <div className="space-y-6 rv-animate-fadeUp">
            {!isAddingDriver && formError && (
              <div className="flex items-center gap-2 p-4 rounded-xl text-[12px]" style={{ background: 'var(--rv-danger-bg)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--rv-danger)' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {formError}
              </div>
            )}

            {/* Header / Trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-yellow-500/10 pb-4">
              <div>
                <h1 className="text-2xl font-black text-white">Driver Management</h1>
                <p className="text-xs text-gray-500">Coordinate and verify assigned local tour guide pilots</p>
              </div>
              <button
                onClick={() => { setIsAddingDriver(!isAddingDriver); setEditingDriver(null); setFormError(null); clearSuccess(); }}
                className="rv-btn rv-btn-primary rv-btn-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Driver
              </button>
            </div>

            {/* Add Driver Form */}
            {isAddingDriver && (
              <div className="bg-[#1f2833]/15 border border-yellow-500/15 p-6 rounded-2xl shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-yellow-500/10 pb-2">
                  <h3 className="font-bold text-white text-sm">{editingDriver ? 'Edit Pilot Driver details' : 'Add New Pilot Driver'}</h3>
                  <button onClick={() => { setIsAddingDriver(false); setEditingDriver(null); }} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                </div>

                <form onSubmit={handleDriverSubmit} className="space-y-4 text-xs">
                  {formError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl text-[12px]" style={{ background: 'var(--rv-danger-bg)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--rv-danger)' }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {formError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

                    <div className="space-y-1.5">
                      <label className="text-gray-300 font-semibold">Driver Full Name *</label>
                      <input
                        type="text"
                        required
                        value={drvName}
                        onChange={(e) => setDrvName(e.target.value)}
                        placeholder="Pilot Name"
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-gray-300 font-semibold">Driver Email (For Credentials) *</label>
                      <input
                        type="email"
                        required
                        disabled={!!editingDriver}
                        value={drvEmail}
                        onChange={(e) => setDrvEmail(e.target.value)}
                        placeholder="pilot@gmail.com"
                        style={{ ...inputStyle, ...(editingDriver ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
                        onFocus={focusIn}
                        onBlur={focusOut}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-gray-300 font-semibold">Driver Phone *</label>
                      <input
                        type="tel"
                        required
                        value={drvPhone}
                        onChange={(e) => setDrvPhone(e.target.value)}
                        placeholder="Mobile Number"
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-gray-300 font-semibold">Driving License (DL) Number *</label>
                      <input
                        type="text"
                        required
                        value={drvLicense}
                        onChange={(e) => setDrvLicense(e.target.value)}
                        placeholder="e.g. DL-RJ19XXXXXXXX"
                        style={{ ...inputStyle, fontFamily: 'monospace' }}
                        onFocus={focusIn}
                        onBlur={focusOut}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-gray-300 font-semibold">Experience (In Years) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={drvExperience}
                        onChange={(e) => setDrvExperience(e.target.value)}
                        placeholder="e.g. 5"
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-gray-300 font-semibold">Languages Spoken (Comma separated) *</label>
                      <input
                        type="text"
                        required
                        value={drvLanguages}
                        onChange={(e) => setDrvLanguages(e.target.value)}
                        placeholder="Hindi, English, Marwari"
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                      />
                    </div>

                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-300 font-semibold">Profile Photo (Required) *</label>
                    <input
                      type="file"
                      required={!editingDriver}
                      accept="image/*"
                      onChange={(e) => setDrvAvatar(e.target.files[0])}
                      className="block w-full text-[12px] cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold"
                      style={{ color: 'var(--rv-text-secondary)', ...inputStyle, padding: '7px 12px' }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-300 font-semibold">Tour Description / Specialty Bio *</label>
                    <textarea
                      rows={2}
                      required
                      value={drvDescription}
                      onChange={(e) => setDrvDescription(e.target.value)}
                      placeholder="Describe tour guiding specialties, city palace routes, fort history experience..."
                      style={{ ...inputStyle, resize: 'none' }}
                      onFocus={focusIn}
                      onBlur={focusOut}
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="rv-btn rv-btn-primary rv-btn-sm cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {formLoading ? (
                        <>
                          <div className="rv-spinner flex-shrink-0" style={{ width: 12, height: 12, borderWidth: 2 }} />
                          <span>Saving...</span>
                        </>
                      ) : (editingDriver ? 'Update Pilot Details' : 'Add & Generate Credentials')}
                    </button>
                  </div>
                </form>
              </div>
            )}
            {/* Independent requests pending block */}
            {drivers.filter(d => d.status === 'pending_approval').length > 0 && (
              <div className="rv-card p-5 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <AlertCircle className="w-5 h-5 animate-pulse" style={{ color: 'var(--rv-accent)' }} /> Pending Driver Onboarding Requests
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {drivers.filter(d => d.status === 'pending_approval').map(drv => (
                    <div key={drv._id} className="p-4 rounded-xl border flex flex-col justify-between gap-3"
                      style={{ background: 'rgba(0,0,0,0.15)', borderColor: 'var(--rv-border)' }}>
                      <div className="flex items-center gap-3">
                        {drv.user?.avatar ? (
                          <img src={drv.user.avatar} alt={drv.user?.name} className="w-12 h-12 rounded-full object-cover border" style={{ borderColor: 'var(--rv-border)' }} />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#111] flex items-center justify-center font-bold">P</div>
                        )}
                        <div>
                          <p className="font-bold text-white text-sm">{drv.user?.name}</p>
                          <p className="text-[11px] font-medium" style={{ color: 'var(--rv-text-muted)' }}>DL: {drv.licenseNumber}</p>
                          <p className="font-semibold text-[11px]" style={{ color: 'var(--rv-text-secondary)' }}>{drv.experience || 0} Years Exp | {drv.languages?.join(', ')}</p>
                        </div>
                      </div>
                      <p className="italic font-medium leading-relaxed" style={{ color: 'var(--rv-text-secondary)' }}>"{drv.tourDescription || 'No bio provided'}"</p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveDriver(drv._id)}
                          className="flex-1 rv-btn rv-btn-sm cursor-pointer"
                          style={{ background: 'var(--rv-success)', color: 'var(--rv-bg)' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectDriver(drv._id)}
                          className="flex-1 rv-btn rv-btn-sm cursor-pointer"
                          style={{ background: 'var(--rv-danger)', color: '#fff' }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="rv-card-static p-4 flex flex-col sm:flex-row items-center gap-4 text-xs">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color: 'var(--rv-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search pilot name or DL..."
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 36 }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>

              <select
                value={driverStatusFilter}
                onChange={(e) => setDriverStatusFilter(e.target.value)}
                style={inputStyle}
                onFocus={focusIn}
                onBlur={focusOut}
                className="w-full sm:w-40 cursor-pointer"
              >
                <option value="" className="bg-[#111]">All Statuses</option>
                <option value="available" className="bg-[#111]">Available (Active)</option>
                <option value="on-tour" className="bg-[#111]">On Tour (Busy)</option>
                <option value="inactive" className="bg-[#111]">Inactive (Rejected)</option>
                <option value="pending_approval" className="bg-[#111]">Pending Approval</option>
              </select>
            </div>

            {/* Drivers list table */}
            <div className="rv-card-static overflow-x-auto shadow-md">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b font-bold uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.01)', borderColor: 'var(--rv-border)', color: 'var(--rv-accent)' }}>
                    <th className="px-2 py-3 text-[11px]">Pilot Name</th>
                    <th className="px-2 py-3 text-[11px]">Email</th>
                    <th className="px-2 py-3 text-[11px]">Contact Phone</th>
                    <th className="px-2 py-3 text-[11px]">DL Number</th>
                    <th className="px-2 py-3 text-[11px] text-center">Experience</th>
                    <th className="px-2 py-3 text-[11px] text-center text-amber-400">Accepted</th>
                    <th className="px-2 py-3 text-[11px] text-center text-emerald-400">Completed</th>
                    <th className="px-2 py-3 text-[11px]">Status</th>
                    <th className="px-2 py-3 text-[11px] text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-300" style={{ borderColor: 'var(--rv-border)' }}>
                  {filteredDrivers.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-gray-500">
                        No pilots registered or pending under this company.
                      </td>
                    </tr>
                  ) : (
                    filteredDrivers.slice((driversPage - 1) * driversLimit, driversPage * driversLimit).map((drv) => (
                      <tr key={drv._id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <td className="px-2 py-3 font-bold text-white max-w-[130px] truncate" title={drv.user?.name}>
                          <div className="flex items-center gap-1.5">
                            {drv.user?.avatar ? (
                              <img src={drv.user.avatar} alt={drv.user?.name} className="w-6 h-6 rounded-full object-cover border flex-shrink-0" style={{ borderColor: 'var(--rv-border)' }} />
                            ) : (
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] border flex-shrink-0" style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'var(--rv-border)' }}>No Pic</div>
                            )}
                            <span className="truncate">{drv.user?.name || 'Deleted Account'}</span>
                          </div>
                        </td>
                        <td className="px-2 py-3 max-w-[120px] truncate" title={drv.user?.email}>{drv.user?.email || 'N/A'}</td>
                        <td className="px-2 py-3 max-w-[100px] truncate" title={drv.user?.phone}>{drv.user?.phone || 'N/A'}</td>
                        <td className="px-2 py-3 font-mono font-semibold max-w-[100px] truncate" title={drv.licenseNumber}>{drv.licenseNumber}</td>
                        <td className="px-2 py-3 font-medium text-center">{drv.experience || 0} yrs</td>
                        <td className="px-2 py-3 text-center font-bold text-amber-400">{drv.acceptedRequestsCount || 0}</td>
                        <td className="px-2 py-3 text-center font-bold text-emerald-400">{drv.completedToursCount || 0}</td>
                        <td className="px-2 py-3">
                          {drv.status === 'available' ? (
                            <span className="rv-badge rv-badge-success" style={{ fontSize: 9, padding: '2px 6px' }}>Active</span>
                          ) : drv.status === 'on-tour' ? (
                            <span className="rv-badge" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa', fontSize: 9, padding: '2px 6px' }}>On Tour</span>
                          ) : drv.status === 'pending_approval' ? (
                            <span className="rv-badge rv-badge-accent" style={{ fontSize: 9, padding: '2px 6px' }}>Pending</span>
                          ) : (
                            <span className="rv-badge" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--rv-text-muted)', fontSize: 9, padding: '2px 6px' }}>Inactive</span>
                          )}
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewingDriver(drv)}
                              className="p-1 rounded-lg cursor-pointer transition-colors border text-yellow-400 hover:bg-yellow-500 hover:text-gray-900"
                              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--rv-border)' }}
                              title="View Bio Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleEditDriver(drv)}
                              className="p-1 rounded-lg cursor-pointer transition-colors border text-yellow-400 hover:bg-yellow-500 hover:text-gray-900"
                              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--rv-border)' }}
                              title="Edit Pilot"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDriver(drv._id)}
                              className="p-1 rounded-lg cursor-pointer transition-colors border text-red-400 hover:bg-red-500 hover:text-white"
                              style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.15)' }}
                              title="Remove Pilot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Drivers Pagination */}
            {filteredDrivers.length > driversLimit && (
              <div className="flex items-center justify-center gap-4 pt-4 pb-2 text-xs">
                <button
                  disabled={driversPage === 1}
                  onClick={() => setDriversPage(prev => Math.max(prev - 1, 1))}
                  className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer"
                >
                  Prev
                </button>
                <span className="font-medium" style={{ color: 'var(--rv-text-muted)' }}>
                  Page {driversPage} of {Math.ceil(filteredDrivers.length / driversLimit)} ({filteredDrivers.length} total)
                </span>
                <button
                  disabled={driversPage === Math.ceil(filteredDrivers.length / driversLimit)}
                  onClick={() => setDriversPage(prev => Math.min(prev + 1, Math.ceil(filteredDrivers.length / driversLimit)))}
                  className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}

          </div>
        )}

        {/* TAB 5: BOOKING REQUESTS */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 rv-animate-fadeUp">
            <div className="pb-4" style={{ borderBottom: '1px solid var(--rv-border)' }}>
              <h1 className="text-xl sm:text-2xl font-black text-white">Booking Requests Management</h1>
              <p className="text-xs" style={{ color: 'var(--rv-text-muted)' }}>Monitor local driver tour assignments and validation statuses</p>
            </div>

            {/* Filters */}
            <div className="rv-card-static p-4 flex flex-col sm:flex-row items-center gap-4 text-xs">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color: 'var(--rv-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search client tourist name or vehicle..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 36 }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>

              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                style={inputStyle}
                onFocus={focusIn}
                onBlur={focusOut}
                className="w-full sm:w-40 cursor-pointer"
              >
                <option value="" className="bg-[#111]">All Bookings</option>
                <option value="pending" className="bg-[#111]">Pending</option>
                <option value="accepted" className="bg-[#111]">Accepted</option>
                <option value="rejected" className="bg-[#111]">Rejected</option>
                <option value="completed" className="bg-[#111]">Completed</option>
              </select>
            </div>

            {/* Bookings list */}
            <div className="rv-card-static overflow-x-auto shadow-md">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b font-bold uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.01)', borderColor: 'var(--rv-border)', color: 'var(--rv-accent)' }}>
                    <th className="p-4">Tourist Name</th>
                    <th className="p-4">Contact Number</th>
                    <th className="p-4">Vehicle Model</th>
                    <th className="p-4">Assigned Pilot</th>
                    <th className="p-4">Pickup Location</th>
                    <th className="p-4">Booking Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-300" style={{ borderColor: 'var(--rv-border)' }}>
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500">
                        No tour booking coordination requests found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.slice((bookingsPage - 1) * bookingsLimit, bookingsPage * bookingsLimit).map((req) => (
                      <tr key={req._id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <td className="p-4 font-bold text-white">{req.user?.name || 'Tourist Guest'}</td>
                        <td className="p-4">{req.user?.phone || 'N/A'}</td>
                        <td className="p-4 font-semibold text-yellow-400">{req.vehicle?.modelName || 'Deleted Vehicle'}</td>
                        <td className="p-4 capitalize">{req.driver?.user?.name || 'Unassigned'}</td>
                        <td className="p-4 max-w-[150px] truncate" title={req.pickupLocation}>{req.pickupLocation}</td>
                        <td className="p-4">{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          {req.status === 'accepted' ? (
                            <span className="rv-badge rv-badge-success">Accepted</span>
                          ) : req.status === 'rejected' ? (
                            <span className="rv-badge rv-badge-danger">Rejected</span>
                          ) : req.status === 'completed' ? (
                            <span className="rv-badge" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}>Completed</span>
                          ) : (
                            <span className="rv-badge rv-badge-accent animate-pulse">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bookings Pagination */}
            {filteredRequests.length > bookingsLimit && (
              <div className="flex items-center justify-center gap-4 pt-4 pb-2 text-xs">
                <button
                  disabled={bookingsPage === 1}
                  onClick={() => setBookingsPage(prev => Math.max(prev - 1, 1))}
                  className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer"
                >
                  Prev
                </button>
                <span className="font-medium" style={{ color: 'var(--rv-text-muted)' }}>
                  Page {bookingsPage} of {Math.ceil(filteredRequests.length / bookingsLimit)} ({filteredRequests.length} total)
                </span>
                <button
                  disabled={bookingsPage === Math.ceil(filteredRequests.length / bookingsLimit)}
                  onClick={() => setBookingsPage(prev => Math.min(prev + 1, Math.ceil(filteredRequests.length / bookingsLimit)))}
                  className="rv-btn rv-btn-secondary rv-btn-sm cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}

          </div>
        )}

        {/* TAB 6: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 rv-animate-fadeUp">
            <div className="pb-4" style={{ borderBottom: '1px solid var(--rv-border)' }}>
              <h1 className="text-xl sm:text-2xl font-black text-white">Company Analytics Insights</h1>
              <p className="text-xs" style={{ color: 'var(--rv-text-muted)' }}>Operational performance metrics and tour counts</p>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              <div className="rv-card p-6 space-y-2">
                <span className="block text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--rv-text-muted)' }}>Total Inventory Assets</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-white">{vehicles.length} Models</span>
                  <span className="text-xs" style={{ color: 'var(--rv-text-muted)' }}>Total Units: {vehicles.reduce((acc, curr) => acc + (curr.totalQuantity || 1), 0)}</span>
                </div>
              </div>

              <div className="rv-card p-6 space-y-2">
                <span className="block text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--rv-text-muted)' }}>Available Inventory Assets</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black" style={{ color: 'var(--rv-success)' }}>{vehicles.filter(v => v.availableQuantity > 0).length} Models</span>
                  <span className="text-xs" style={{ color: 'var(--rv-text-muted)' }}>Avail Units: {vehicles.reduce((acc, curr) => acc + (curr.availableQuantity || 0), 0)}</span>
                </div>
              </div>

              <div className="rv-card p-6 space-y-2">
                <span className="block text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--rv-text-muted)' }}>Verification Document Records</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-white">1 Submitted</span>
                  <a href={company.verificationDocs && company.verificationDocs[0]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--rv-accent)' }} className="text-xs hover:underline">View Document</a>
                </div>
              </div>

              <div className="rv-card p-6 space-y-2">
                <span className="block text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--rv-text-muted)' }}>Active On-Tour Pilots</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black" style={{ color: 'var(--rv-accent)' }}>
                    {drivers.filter(d => d.status === 'on-tour').length} Pilots
                  </span>
                  <span className="text-xs" style={{ color: 'var(--rv-text-muted)' }}>Busy coordinate</span>
                </div>
              </div>

              <div className="rv-card p-6 space-y-2">
                <span className="block text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--rv-text-muted)' }}>Completed Tours History</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black" style={{ color: 'var(--rv-accent)' }}>
                    {requests.filter(r => r.status === 'completed').length} Tours
                  </span>
                  <span className="text-xs" style={{ color: 'var(--rv-text-muted)' }}>Completed rides</span>
                </div>
              </div>

              <div className="rv-card p-6 space-y-2">
                <span className="block text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--rv-text-muted)' }}>Rejected Tour Coordination</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black" style={{ color: 'var(--rv-danger)' }}>
                    {requests.filter(r => r.status === 'rejected').length} Requests
                  </span>
                  <span className="text-xs" style={{ color: 'var(--rv-text-muted)' }}>Rejected jobs</span>
                </div>
              </div>

            </div>

            {/* Performance charts mockup */}
            <div className="rv-card p-6 flex flex-col justify-center items-center text-center py-12 space-y-2">
              <BarChart3 className="w-10 h-10 animate-pulse" style={{ color: 'var(--rv-accent-glow)' }} />
              <h4 className="font-bold text-white text-sm">Analytics Graph Compilation</h4>
              <p className="text-xs max-w-sm" style={{ color: 'var(--rv-text-muted)' }}>Graph representation updates dynamically as tours scale across Jaipur, Udaipur and Jodhpur operations.</p>
            </div>
          </div>
        )}

        {/* TAB 7: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="rv-card p-6 sm:p-8 space-y-6 rv-animate-fadeUp max-w-lg mx-auto">
            <div className="pb-4" style={{ borderBottom: '1px solid var(--rv-border)' }}>
              <h1 className="text-xl sm:text-2xl font-black text-white">Portal Settings</h1>
              <p className="text-xs" style={{ color: 'var(--rv-text-muted)' }}>Update security parameters and coordinate credentials</p>
            </div>

            {passwordFormError && (
              <div className="flex items-center gap-2 p-4 rounded-xl text-[12px]" style={{ background: 'var(--rv-danger-bg)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--rv-danger)' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {passwordFormError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Registered Email Address</label>
                <input
                  type="text"
                  readOnly
                  value={user?.email}
                  style={{ ...inputStyle, background: 'rgba(255,255,255,0.02)', cursor: 'not-allowed', color: 'var(--rv-text-muted)' }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={inputStyle}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold block" style={{ color: 'var(--rv-text-secondary)' }}>New Login Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
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
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  style={inputStyle}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordFormLoading}
                  className="rv-btn rv-btn-primary rv-btn-sm cursor-pointer animate-none flex items-center justify-center gap-1.5"
                >
                  {passwordFormLoading ? (
                    <>
                      <div className="rv-spinner flex-shrink-0" style={{ width: 12, height: 12, borderWidth: 2 }} />
                      <span>Saving...</span>
                    </>
                  ) : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        )}
          </>
        )}
      </main>

      {/* Driver detail profile modal */}
      {viewingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1f2833] border border-yellow-500/15 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 relative animate-scaleUp text-xs">

            <button
              onClick={() => setViewingDriver(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-yellow-500/10 pb-3 flex items-center gap-3">
              {viewingDriver.user?.avatar ? (
                <img src={viewingDriver.user.avatar} alt="Pilot" className="w-12 h-12 rounded-full object-cover border border-yellow-500/25" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#0b0c10] flex items-center justify-center font-bold">P</div>
              )}
              <div>
                <h3 className="text-sm font-bold text-white">{viewingDriver.user?.name}</h3>
                <p className="text-[10px] text-yellow-400 font-medium">License: {viewingDriver.licenseNumber}</p>
              </div>
            </div>

            <div className="space-y-2 text-gray-300">
              <p><span className="font-semibold text-yellow-400">Current Status:</span> <span className="uppercase font-bold text-yellow-500">{viewingDriver.status}</span></p>
              <p><span className="font-semibold text-yellow-400">Accepted Requests:</span> {viewingDriver.acceptedRequestsCount || 0} rides</p>
              <p><span className="font-semibold text-yellow-400">Completed Tours:</span> {viewingDriver.completedToursCount || 0} tours</p>
              <p><span className="font-semibold text-yellow-400">Experience:</span> {viewingDriver.experience || 0} Years in tourism coordination</p>
              <p><span className="font-semibold text-yellow-400">Languages:</span> {viewingDriver.languages?.join(', ')}</p>
              <p><span className="font-semibold text-yellow-400">Phone Contact:</span> {viewingDriver.user?.phone}</p>
              <p><span className="font-semibold text-yellow-400">Email Address:</span> {viewingDriver.user?.email}</p>
              <div className="pt-2 border-t border-yellow-500/5">
                <span className="font-semibold text-yellow-400 block mb-1">Guiding Specialty Bio:</span>
                <p className="italic text-gray-400">"{viewingDriver.tourDescription || 'No specialty description provided by the pilot.'}"</p>
              </div>
            </div>

          </div>
        </div>
      )}

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

export default CompanyDashboard;

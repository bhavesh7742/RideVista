import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { logout } from '../features/authSlice';
import { showToast } from '../features/notificationSlice';
import ConfirmationModal from '../components/ConfirmationModal';
import useSuccessFeedback from '../hooks/useSuccessFeedback';
import {
  ShieldAlert, ShieldCheck, Building2, Users, UserCog, Car,
  ClipboardList, MessageSquare, LineChart, Settings, Check, X,
  MapPin, Phone, Mail, Search, Clock, Compass, Trash2,
  Menu, LogOut, ChevronRight, CheckCircle2, ChevronDown, User
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('admin_dashboard_active_tab') || 'overview';
  });
  useEffect(() => {
    localStorage.setItem('admin_dashboard_active_tab', activeTab);
  }, [activeTab]);

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(7);
  const { successMessage, setSuccessMessage, clearSuccess } = useSuccessFeedback();

  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      if (height > 1200) {
        setLimit(15);
      } else if (height > 950) {
        setLimit(10);
      } else if (height > 750) {
        setLimit(7);
      } else {
        setLimit(5);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [actionError, setActionError] = useState(null);

  // Data State
  const [analytics, setAnalytics] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [requests, setRequests] = useState([]);
  const [feedback, setFeedback] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      navigate('/login/admin');
      return;
    }
    fetchAllData();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, feedbackCategory]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [
        analyticsRes, compRes, userRes, driverRes,
        vehRes, reqRes, feedRes
      ] = await Promise.all([
        axiosInstance.get('/analytics/admin-dashboard'),
        axiosInstance.get('/companies'),
        axiosInstance.get('/users'),
        axiosInstance.get('/drivers/admin/all'),
        axiosInstance.get('/vehicles/admin/all'),
        axiosInstance.get('/requests/admin/all'),
        axiosInstance.get('/feedback')
      ]);

      setAnalytics(analyticsRes.data.data);
      setCompanies(compRes.data.data.companies);
      setUsers(userRes.data.data.users);
      setDrivers(driverRes.data.data.drivers);
      setVehicles(vehRes.data.data);
      setRequests(reqRes.data.data.requests);
      setFeedback(feedRes.data.data.feedback);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleVerifyCompany = async (companyId, status) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await axiosInstance.patch(`/companies/${companyId}/verify`, { isVerified: status });
      setSuccessMessage(status ? 'Company Verified Successfully' : 'Company Rejected');
      fetchAllData();
    } catch (error) {
      setActionError(error.response?.data?.message || 'Failed to update verification status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (endpoint, id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Database Record',
      message: 'Are you sure you want to delete this record? This action cannot be undone and will delete it from all tables.',
      confirmText: 'Delete Record',
      isDanger: true,
      onConfirm: async () => {
        setActionLoading(true);
        setActionError(null);
        try {
          await axiosInstance.delete(`/${endpoint}/${id}`);
          let msg = 'Record deleted successfully.';
          if (endpoint === 'users') {
            msg = 'User deleted successfully.';
          } else if (endpoint === 'companies') {
            msg = 'Company deleted successfully.';
          } else if (endpoint === 'drivers') {
            msg = 'Driver deleted successfully.';
          } else if (endpoint === 'vehicles') {
            msg = 'Vehicle deleted successfully.';
          } else if (endpoint === 'feedback') {
            msg = 'Feedback deleted successfully.';
          }
          setSuccessMessage(msg);
          fetchAllData();
        } catch (error) {
          setActionError(error.response?.data?.message || 'Failed to delete record');
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleResolveFeedback = async (id) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await axiosInstance.patch(`/feedback/${id}/resolve`);
      setSuccessMessage('Feedback Marked as Resolved');
      fetchAllData();
    } catch (error) {
      setActionError(error.response?.data?.message || 'Failed to resolve feedback');
    } finally {
      setActionLoading(false);
    }
  };

  // ----- TAB RENDERS -----

  const renderPagination = (totalItems) => {
    const totalPages = Math.ceil(totalItems / limit);
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-4 pt-6 text-xs">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          className="px-4 py-2 bg-[#1f2833]/30 border border-yellow-500/10 hover:border-yellow-500/30 disabled:opacity-40 disabled:hover:border-yellow-500/10 rounded-xl text-white font-semibold transition-all cursor-pointer animate-fadeIn"
        >
          Previous
        </button>
        <span className="text-gray-400 font-semibold">
          Page {currentPage} of {totalPages} ({totalItems} total)
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          className="px-4 py-2 bg-[#1f2833]/30 border border-yellow-500/10 hover:border-yellow-500/30 disabled:opacity-40 disabled:hover:border-yellow-500/10 rounded-xl text-white font-semibold transition-all cursor-pointer animate-fadeIn"
        >
          Next
        </button>
      </div>
    );
  };

  const renderOverview = () => {
    if (!analytics) return null;
    const { metrics } = analytics;

    const StatCard = ({ title, value, icon: Icon, color }) => (
      <div className="bg-[#1f2833]/20 border border-yellow-500/10 p-6 rounded-2xl flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</span>
          <h3 className="text-3xl font-extrabold text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    );

    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <LineChart className="text-yellow-500" /> Platform Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={metrics.totalUsers} icon={Users} color="bg-blue-500/20 text-blue-400" />
          <StatCard title="Total Companies" value={metrics.totalCompanies} icon={Building2} color="bg-yellow-500/20 text-yellow-400" />
          <StatCard title="Total Vehicles" value={metrics.totalVehicles} icon={Car} color="bg-emerald-500/20 text-emerald-400" />
          <StatCard title="Total Drivers" value={metrics.totalDrivers} icon={UserCog} color="bg-purple-500/20 text-purple-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1f2833]/20 border border-yellow-500/10 p-5 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase">Pending Driver Requests</p>
              <h3 className="text-2xl font-bold text-amber-400">{metrics.pendingRequests}</h3>
            </div>
            <Clock className="w-8 h-8 text-amber-500/30" />
          </div>
          <div className="bg-[#1f2833]/20 border border-yellow-500/10 p-5 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase">Completed Tours</p>
              <h3 className="text-2xl font-bold text-emerald-400">{metrics.completedTours}</h3>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500/30" />
          </div>
          <div className="bg-[#1f2833]/20 border border-yellow-500/10 p-5 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase">Pending Businesses</p>
              <h3 className="text-2xl font-bold text-red-400">{metrics.pendingCompanies}</h3>
            </div>
            <Building2 className="w-8 h-8 text-red-500/30" />
          </div>
        </div>
      </div>
    );
  };

  const renderVerification = () => {
    const pendingCompanies = companies.filter(c => !c.isVerified);

    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <ShieldAlert className="text-yellow-500" /> Business Verification Queue
        </h2>

        {pendingCompanies.length === 0 ? (
          <div className="text-center py-12 bg-[#1f2833]/20 border border-yellow-500/10 rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">All Caught Up!</h3>
            <p className="text-sm text-gray-400">No pending business verifications in the queue.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingCompanies.slice((currentPage - 1) * limit, currentPage * limit).map(comp => (
              <div key={comp._id} className="bg-[#1f2833]/20 border border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-between shadow-lg">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{comp.name}</h3>
                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase rounded">Pending</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mt-4">
                    <div><strong>Owner:</strong> {comp.ownerName} ({comp.ownerPhone})</div>
                    <div><strong>Manager:</strong> {comp.managerName} ({comp.managerPhone})</div>
                    <div><strong>Location:</strong> {comp.city}</div>
                    <div><strong>Email:</strong> {comp.email}</div>
                  </div>
                  <div className="pt-4 flex gap-4">
                    {comp.verificationDocs && comp.verificationDocs.length > 0 && (
                      <a href={comp.verificationDocs[0]} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm flex items-center gap-1">
                        <ClipboardList className="w-4 h-4" /> View Documents
                      </a>
                    )}
                    <a href={comp.googleMapsLink} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline text-sm flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> Google Maps
                    </a>
                  </div>
                </div>

                <div className="flex flex-col gap-3 justify-center min-w-[150px]">
                  <button onClick={() => handleVerifyCompany(comp._id, true)} disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-4 rounded-xl font-bold flex items-center justify-center gap-2">
                    {actionLoading ? (
                      <>
                        <div className="rv-spinner flex-shrink-0" style={{ width: 12, height: 12, borderWidth: 2 }} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Approve
                      </>
                    )}
                  </button>
                  <button onClick={() => handleDelete('companies', comp._id)} disabled={actionLoading} className="bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-400 py-2 px-4 rounded-xl font-bold flex items-center justify-center gap-2">
                    {actionLoading ? (
                      <>
                        <div className="rv-spinner flex-shrink-0" style={{ width: 12, height: 12, borderWidth: 2 }} />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" /> Reject/Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
            {renderPagination(pendingCompanies.length)}
          </div>
        )}
      </div>
    );
  };

  const renderCompanies = () => {
    const filtered = companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.city.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Building2 className="text-yellow-500" /> Rental Companies
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or city..."
              className="w-full bg-[#1f2833]/30 border border-yellow-500/20 text-white rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-yellow-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-[#1f2833]/20 border border-yellow-500/10 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#1f2833]/50 border-b border-yellow-500/10 text-gray-400 text-xs uppercase font-bold">
                <th className="p-4">Company Name</th>
                <th className="p-4">City</th>
                <th className="p-4">Status</th>
                <th className="p-4">Fleet</th>
                <th className="p-4">Pilots</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice((currentPage - 1) * limit, currentPage * limit).map(comp => (
                <tr key={comp._id} className="border-b border-yellow-500/5 hover:bg-[#1f2833]/40 transition text-sm">
                  <td className="p-4">
                    <div className="font-bold text-white">{comp.name}</div>
                    <div className="text-xs text-gray-500">{comp.email}</div>
                  </td>
                  <td className="p-4 text-gray-300">{comp.city}</td>
                  <td className="p-4">
                    {comp.isVerified ? (
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs">Verified</span>
                    ) : (
                      <span className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded text-xs">Pending</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-300">{comp.stats?.totalVehicles || 0} units</td>
                  <td className="p-4 text-gray-300">{comp.stats?.totalDrivers || 0} registered</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete('companies', comp._id)} disabled={actionLoading} className="text-red-400 hover:text-red-300 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No companies found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {renderPagination(filtered.length)}
      </div>
    );
  };

  const renderUsers = () => {
    const filtered = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="text-yellow-500" /> Registered Tourists
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full bg-[#1f2833]/30 border border-yellow-500/20 text-white rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-yellow-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-[#1f2833]/20 border border-yellow-500/10 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#1f2833]/50 border-b border-yellow-500/10 text-gray-400 text-xs uppercase font-bold">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Registration Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice((currentPage - 1) * limit, currentPage * limit).map(u => (
                <tr key={u._id} className="border-b border-yellow-500/5 hover:bg-[#1f2833]/40 transition text-sm">
                  <td className="p-4 font-bold text-white flex items-center gap-3">
                    <img src={u.avatar || 'https://via.placeholder.com/40'} alt={u.name} className="w-8 h-8 rounded-full border border-yellow-500/30 object-cover" />
                    {u.name}
                  </td>
                  <td className="p-4 text-gray-300">{u.email}</td>
                  <td className="p-4 text-gray-300">{u.phone || 'N/A'}</td>
                  <td className="p-4 text-gray-300">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete('users', u._id)} disabled={actionLoading} className="text-red-400 hover:text-red-300 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {renderPagination(filtered.length)}
      </div>
    );
  };

  const renderDrivers = () => {
    const filtered = drivers.filter(d =>
      d.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <UserCog className="text-yellow-500" /> Active Pilots
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search drivers or company..."
              className="w-full bg-[#1f2833]/30 border border-yellow-500/20 text-white rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-yellow-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice((currentPage - 1) * limit, currentPage * limit).map(d => (
            <div key={d._id} className="bg-[#1f2833]/20 border border-yellow-500/10 rounded-2xl p-5 shadow flex flex-col items-center text-center relative overflow-hidden group">
              <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${d.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' :
                d.status === 'on-tour' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                {d.status.replace('_', ' ')}
              </span>
              <img src={d.user?.avatar || 'https://via.placeholder.com/80'} alt="pilot" className="w-16 h-16 rounded-full border-2 border-yellow-500 mb-3 object-cover" />
              <h3 className="font-bold text-white text-lg">{d.user?.name}</h3>
              <p className="text-xs text-yellow-400 font-medium mb-1">{d.company?.name}</p>
              <p className="text-xs text-gray-500 mb-4">{d.experience} Years Exp. | L.: {d.licenseNumber}</p>
              <div className="w-full border-t border-yellow-500/10 pt-3 flex justify-between">
                <button onClick={() => handleDelete('drivers', d._id)} className="w-full text-xs text-red-400 hover:text-red-300 font-bold flex items-center justify-center gap-1">
                  <Trash2 className="w-3 h-3" /> Remove Pilot
                </button>
              </div>
            </div>
          ))}
        </div>
        {renderPagination(filtered.length)}
      </div>
    );
  };

  const renderVehicles = () => {
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Car className="text-yellow-500" /> Global Fleet Inventory
        </h2>
        <div className="bg-[#1f2833]/20 border border-yellow-500/10 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#1f2833]/50 border-b border-yellow-500/10 text-gray-400 text-xs uppercase font-bold">
                <th className="p-4">Vehicle</th>
                <th className="p-4">Type</th>
                <th className="p-4">Company</th>
                <th className="p-4">Available Qty</th>
                <th className="p-4">Price/Day</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.slice((currentPage - 1) * limit, currentPage * limit).map(v => (
                <tr key={v._id} className="border-b border-yellow-500/5 hover:bg-[#1f2833]/40 transition text-sm">
                  <td className="p-4 font-bold text-white flex items-center gap-3">
                    <img src={v.image || 'https://via.placeholder.com/40'} alt={v.modelName} className="w-10 h-10 rounded border border-yellow-500/30 object-cover" />
                    <div>
                      {v.brand} {v.modelName}
                      <div className="text-xs text-gray-500 font-normal">Seats: {v.seatingCapacity}</div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300 capitalize">{v.type}</td>
                  <td className="p-4 text-gray-300 font-medium">{v.company?.name || 'Unknown'}</td>
                  <td className="p-4">
                    <span className={v.availableQuantity > 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {v.availableQuantity} / {v.totalQuantity}
                    </span>
                  </td>
                  <td className="p-4 text-yellow-400 font-bold">₹{v.pricingPerDay}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete('vehicles', v._id)} disabled={actionLoading} className="text-red-400 hover:text-red-300 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {renderPagination(vehicles.length)}
      </div>
    );
  };

  const renderRequests = () => {
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <ClipboardList className="text-yellow-500" /> Booking Requests Monitor
        </h2>
        <div className="bg-[#1f2833]/20 border border-yellow-500/10 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#1f2833]/50 border-b border-yellow-500/10 text-gray-400 text-xs uppercase font-bold">
                <th className="p-4">Date</th>
                <th className="p-4">Tourist</th>
                <th className="p-4">Driver</th>
                <th className="p-4">Company & Vehicle</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.slice((currentPage - 1) * limit, currentPage * limit).map(r => (
                <tr key={r._id} className="border-b border-yellow-500/5 hover:bg-[#1f2833]/40 transition text-sm">
                  <td className="p-4 text-gray-400 text-xs">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="p-4 text-white font-medium">{r.user?.name}</td>
                  <td className="p-4 text-gray-300">{r.driver?.user?.name || 'Unassigned'}</td>
                  <td className="p-4 text-gray-300">
                    <div className="font-bold text-yellow-400">{r.company?.name}</div>
                    <div className="text-xs">{r.vehicle?.brand} {r.vehicle?.modelName}</div>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${r.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                      r.status === 'accepted' ? 'bg-blue-500/10 text-blue-400' :
                        r.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                          'bg-amber-500/10 text-amber-400'
                      }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {renderPagination(requests.length)}
      </div>
    );
  };

  const renderFeedback = () => {
    const filteredFeedback = feedback.filter(f => {
      const matchesSearch = f.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.user?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = feedbackCategory === '' || f.category === feedbackCategory;

      return matchesSearch && matchesCategory;
    });

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="text-yellow-500" /> User Feedback
          </h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search feedback..."
                className="w-full bg-[#1f2833]/30 border border-yellow-500/20 text-white rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-yellow-500 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={feedbackCategory}
              onChange={(e) => setFeedbackCategory(e.target.value)}
              className="bg-[#1f2833]/30 border border-yellow-500/20 text-white rounded-xl px-3 py-2 focus:outline-none text-xs"
            >
              <option value="" className="bg-[#1f2833]">All Categories</option>
              <option value="feedback" className="bg-[#1f2833]">Feedback</option>
              <option value="suggestion" className="bg-[#1f2833]">Suggestion</option>
              <option value="bug_report" className="bg-[#1f2833]">Bug Report</option>
              <option value="support_request" className="bg-[#1f2833]">Support Request</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFeedback.slice((currentPage - 1) * limit, currentPage * limit).map(f => (
            <div key={f._id} className="bg-[#1f2833]/20 border border-yellow-500/10 rounded-2xl p-6 relative">
              <div className="absolute top-4 right-4">
                {f.status === 'resolved' ? (
                  <span className="text-emerald-400 text-xs font-bold uppercase flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Resolved</span>
                ) : (
                  <span className="text-amber-400 text-xs font-bold uppercase">Pending</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white pr-20">{f.subject}</h3>
              <p className="text-xs text-yellow-500 mb-4 uppercase tracking-wider font-bold">{f.category.replace('_', ' ')}</p>
              <p className="text-sm text-gray-300 bg-[#0b0c10]/50 p-4 rounded-xl border border-yellow-500/5 mb-4">
                "{f.description}"
              </p>
              <div className="flex justify-between items-center text-xs text-gray-500 border-t border-yellow-500/10 pt-4">
                <span>By: <strong className="text-gray-300">{f.user?.name}</strong></span>
                <span>{new Date(f.createdAt).toLocaleDateString()}</span>
              </div>

              {f.status !== 'resolved' && (
                <div className="mt-4 flex gap-2">
                  <button onClick={() => handleResolveFeedback(f._id)} disabled={actionLoading} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5">
                    {actionLoading ? (
                      <>
                        <div className="rv-spinner flex-shrink-0" style={{ width: 12, height: 12, borderWidth: 2 }} />
                        <span>Resolving...</span>
                      </>
                    ) : 'Mark Resolved'}
                  </button>
                  <button onClick={() => handleDelete('feedback', f._id)} disabled={actionLoading} className="flex-1 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-400 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5">
                    {actionLoading ? (
                      <>
                        <div className="rv-spinner flex-shrink-0" style={{ width: 12, height: 12, borderWidth: 2 }} />
                        <span>Deleting...</span>
                      </>
                    ) : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          ))}
          {filteredFeedback.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-500 text-sm">
              No matching feedback found
            </div>
          )}
        </div>
        {renderPagination(filteredFeedback.length)}
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!analytics) return null;
    const { charts } = analytics;

    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <LineChart className="text-yellow-500" /> Advanced Analytics
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1f2833]/20 border border-yellow-500/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Top Companies by Fleet Size</h3>
            <div className="space-y-4">
              {charts.vehiclesPerCompany.map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 font-medium">{c.companyName}</span>
                    <span className="text-yellow-400 font-bold">{c.count}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${Math.min((c.count / 30) * 100, 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1f2833]/20 border border-yellow-500/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Most Active Companies (Requests)</h3>
            <div className="space-y-4">
              {charts.mostActiveCompanies.map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 font-medium">{c.companyName}</span>
                    <span className="text-emerald-400 font-bold">{c.requestCount}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min((c.requestCount / 20) * 100, 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <User className="text-yellow-500" /> Admin Profile Info
        </h2>

        <div className="bg-[#1f2833]/20 border border-yellow-500/10 p-8 rounded-3xl shadow-xl space-y-6 max-w-xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/5 rounded-full blur-2xl"></div>

          {/* User Icon */}
          <div className="flex items-center gap-4 border-b border-yellow-500/10 pb-6">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center">
              <User className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{user?.name || 'Admin'}</h2>
              <span className="inline-block px-2.5 py-0.5 mt-1 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold uppercase tracking-wider">
                System Administrator
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 text-sm text-[#c5c6c7]">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Email Address</p>
                <p className="text-gray-300 font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Phone Number</p>
                <p className="text-gray-300 font-medium">{user?.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Security Role</p>
                <p className="text-gray-300 font-medium">System Administrator (Full access read/write/verify permissions)</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-yellow-500/5 flex gap-2 mt-6">
            <button
              onClick={() => {
                setConfirmModal({
                  isOpen: true,
                  title: 'Logout Required',
                  message: 'To explore the vehicle fleet, you must log out of your Admin account. Would you like to log out and proceed to the fleet explore page?',
                  confirmText: 'Logout & Explore',
                  isDanger: false,
                  onConfirm: () => {
                    dispatch(logout());
                    navigate('/search');
                  }
                });
              }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer text-center"
            >
              <Compass className="w-3.5 h-3.5" /> Explore Vehicles
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (authLoading || isLoading) {
      return (
        <div className="flex justify-center items-center h-full min-h-[300px]">
          <div className="w-12 h-12 border-4 border-yellow-500/25 border-t-yellow-500 rounded-full animate-spin"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'verification': return renderVerification();
      case 'companies': return renderCompanies();
      case 'users': return renderUsers();
      case 'drivers': return renderDrivers();
      case 'vehicles': return renderVehicles();
      case 'requests': return renderRequests();
      case 'feedback': return renderFeedback();
      case 'analytics': return renderAnalytics();
      case 'profile': return renderProfile();
      default: return renderOverview();
    }
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: LineChart },
    { id: 'verification', label: 'Business Verification', icon: ShieldAlert },
    { id: 'companies', label: 'Rental Companies', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'drivers', label: 'Drivers', icon: UserCog },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'requests', label: 'Driver Requests', icon: ClipboardList },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#0b0c10] flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed lg:static top-0 left-0 z-40 h-full w-64 border-r flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: 'rgba(255,255,255,0.01)', borderColor: 'var(--rv-border)' }}>
        <div className="p-6 flex justify-between items-center" style={{ borderBottom: '1px solid var(--rv-border)' }}>
          <div>
            <h1 className="text-2xl font-black tracking-tighter" style={{ color: 'var(--rv-accent)' }}>RideVista</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--rv-text-muted)' }}>Admin Portal</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchTerm(''); setSidebarOpen(false); setActionError(null); clearSuccess(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer"
                style={{
                  background: isActive ? 'var(--rv-accent)' : 'transparent',
                  color: isActive ? 'var(--rv-bg)' : 'var(--rv-text-muted)'
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--rv-text)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--rv-text-muted)'; }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-semibold">{tab.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t" style={{ borderColor: 'var(--rv-border)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 justify-center py-2.5 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer"
            style={{ color: 'var(--rv-danger)', border: '1px solid rgba(248,113,113,0.15)', background: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--rv-danger-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full lg:w-[calc(100%-16rem)]">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 flex justify-between items-center border-b" style={{ background: 'rgba(255,255,255,0.01)', borderColor: 'var(--rv-border)' }}>
          <h1 className="text-xl font-black text-yellow-500">RideVista</h1>
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white p-2 cursor-pointer">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {successMessage && (
              <div className="mb-6 flex items-center gap-3 p-4 rounded-xl text-[13px] rv-animate-scaleIn"
                style={{ background: 'var(--rv-success-bg)', border: '1px solid rgba(52,211,153,0.15)', color: 'var(--rv-success)' }}>
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{successMessage}</span>
                <button onClick={clearSuccess} className="ml-auto cursor-pointer transition-colors" style={{ color: 'var(--rv-success)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {actionError && (
              <div className="mb-6 flex items-center gap-3 p-4 rounded-xl text-[13px] rv-animate-scaleIn"
                style={{ background: 'var(--rv-danger-bg)', border: '1px solid rgba(248,113,113,0.15)', color: 'var(--rv-danger)' }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--rv-danger)' }} />
                <span className="font-medium">{actionError}</span>
                <button onClick={() => setActionError(null)} className="ml-auto cursor-pointer transition-colors" style={{ color: 'var(--rv-danger)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm" />
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

export default AdminDashboard;

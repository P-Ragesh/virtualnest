import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import MobileBottomNav from '../components/MobileBottomNav';
import api from '../utils/api';
import { gsap } from 'gsap';
import { useAuth } from '../hooks/useAuth';

export default function Leave() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [balances, setBalances] = useState({
    sick: { limit: 12, used: 0, remaining: 12 },
    casual: { limit: 12, used: 0, remaining: 12 },
    earned: { limit: 15, used: 0, remaining: 15 },
    unpaid: { limit: 999, used: 0, remaining: 999 }
  });

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'casual',
    fromDate: '',
    toDate: '',
    reason: ''
  });
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/employees');
      if (user?.role === 'employee') {
        const matched = data.find(e => e.email === user.email);
        const filtered = matched ? [matched] : [];
        setEmployees(filtered);
        if (filtered.length > 0) {
          setSelectedEmpId(filtered[0].id);
          setFormData(prev => ({ ...prev, employeeId: filtered[0].id }));
        }
      } else {
        setEmployees(data);
        if (data.length > 0) {
          setSelectedEmpId(data[0].id);
          setFormData(prev => ({ ...prev, employeeId: data[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params = {};
      if (user?.role === 'employee') {
        const { data: emps } = await api.get('/employees');
        const matched = emps.find(e => e.email === user.email);
        if (matched) {
          params.employeeId = matched.id;
        }
      }
      const { data } = await api.get('/leave', { params });
      setLeaves(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalances = async () => {
    if (!selectedEmpId) return;
    try {
      const { data } = await api.get(`/leave/balances/${selectedEmpId}`);
      setBalances(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchLeaves();
  }, []);

  useEffect(() => {
    fetchBalances();
  }, [selectedEmpId]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!loading && leaves.length > 0) {
      gsap.fromTo('.leave-row', 
        { y: 10, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.03, ease: 'power2.out' }
      );
    }
  }, [loading, leaves]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/leave/${id}`, { status });
      fetchLeaves();
      fetchBalances();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update leave status');
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/leave', formData);
      fetchLeaves();
      fetchBalances();
      setShowApplyModal(false);
      setFormData(prev => ({
        ...prev,
        fromDate: '',
        toDate: '',
        reason: ''
      }));
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to apply for leave');
    }
  };

  const getDaysDiff = (from, to) => {
    const diffTime = Math.abs(new Date(to) - new Date(from));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // ── Mobile View ─────────────────────────────────────────────────
  if (isMobile) {
    const balanceTypes = [
      { key: 'sick',    label: 'Sick',    icon: 'medical_services', bg: 'bg-red-50',    border: 'border-red-100',    val: 'text-red-600'   },
            { key: 'casual', label: 'Casual',  icon: 'weekend',           bg: 'bg-[#C8D5BB]/20',   border: 'border-[#94A293]',   val: 'text-[#536164]'  },
            { key: 'earned', label: 'Earned',  icon: 'star',              bg: 'bg-green-50',  border: 'border-green-100',  val: 'text-green-600' },
    ];

    return (
      <div className="min-h-screen bg-white font-sans">
        <div className="px-5 pt-6 pb-28">

          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Leave</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Manage your time off</p>
            </div>
            {user?.role === 'employee' && (
              <button
                onClick={() => setShowApplyModal(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#536164] to-[#C8D5BB] text-white text-[11px] font-bold px-4 py-2.5 rounded-full shadow-sm active:scale-95 transition-all hover:opacity-90"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Apply
              </button>
            )}
          </div>

          {/* Leave Balances */}
          <h3 className="text-[12px] font-bold text-slate-600 uppercase tracking-wider mb-3">My Balance</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {balanceTypes.map(({ key, label, icon, bg, border, val }) => (
              <div key={key} className={`${bg} ${border} border rounded-[18px] p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`material-symbols-outlined text-[16px] ${val}`}>{icon}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-black ${val}`}>{balances[key]?.remaining ?? 0}</span>
                  <span className="text-[10px] text-slate-400">/ {balances[key]?.limit === 999 ? '∞' : balances[key]?.limit}</span>
                </div>
                <div className="w-full bg-white/70 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${val.replace('text', 'bg')}`}
                    style={{ width: `${Math.min(100, ((balances[key]?.used || 0) / (balances[key]?.limit === 999 ? 1 : balances[key]?.limit || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Leave Requests */}
          <h3 className="text-[12px] font-bold text-slate-600 uppercase tracking-wider mb-3">Leave Requests</h3>
          {loading ? (
            <div className="flex flex-col items-center py-10 text-slate-400">
              <span className="material-symbols-outlined animate-spin text-[28px] mb-2">refresh</span>
              <p className="text-xs">Loading...</p>
            </div>
          ) : leaves.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-slate-400">
              <span className="material-symbols-outlined text-[40px] mb-2 text-slate-200">event_available</span>
              <p className="text-xs font-medium">No leave requests found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaves.map(l => {
                const statusStyle = l.status === 'approved'
                  ? 'bg-green-50 text-green-700 border-green-100'
                  : l.status === 'rejected'
                  ? 'bg-red-50 text-red-600 border-red-100'
                  : 'bg-amber-50 text-amber-700 border-amber-100';
                const statusIcon = l.status === 'approved' ? 'check_circle' : l.status === 'rejected' ? 'cancel' : 'schedule';
                return (
                  <div key={l.id} className="bg-white border border-slate-100 rounded-[18px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#C8D5BB]/30 text-primary flex items-center justify-center font-bold text-sm uppercase">
                          {l.employee.firstName[0]}
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-slate-800 leading-tight">{l.employee.firstName} {l.employee.lastName}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{l.leaveType} Leave</p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full border capitalize ${statusStyle}`}>
                        <span className="material-symbols-outlined text-[11px]">{statusIcon}</span>
                        {l.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-50 rounded-[10px] p-2 text-center">
                        <p className="text-[8px] text-slate-400 font-bold uppercase mb-0.5">From</p>
                        <p className="text-[10px] font-bold text-slate-700">{new Date(l.fromDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</p>
                      </div>
                      <div className="bg-slate-50 rounded-[10px] p-2 text-center">
                        <p className="text-[8px] text-slate-400 font-bold uppercase mb-0.5">To</p>
                        <p className="text-[10px] font-bold text-slate-700">{new Date(l.toDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</p>
                      </div>
                      <div className="bg-[#C8D5BB]/20 rounded-[10px] p-2 text-center">
                        <p className="text-[8px] text-primary font-bold uppercase mb-0.5">Days</p>
                        <p className="text-[10px] font-bold text-[#536164]">{getDaysDiff(l.fromDate, l.toDate)}</p>
                      </div>
                    </div>
                    {l.reason && (
                      <p className="text-[10px] text-slate-400 mt-2 truncate italic">"{l.reason}"</p>
                    )}
                    {user?.role !== 'employee' && l.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleStatusChange(l.id, 'approved')}
                          className="flex-1 flex items-center justify-center gap-1 bg-green-50 border border-green-200 text-green-700 text-[11px] font-bold py-2 rounded-[12px] active:scale-95 transition-all"
                        >
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(l.id, 'rejected')}
                          className="flex-1 flex items-center justify-center gap-1 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold py-2 rounded-[12px] active:scale-95 transition-all"
                        >
                          <span className="material-symbols-outlined text-[14px]">cancel</span>
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Apply Modal (shared with desktop) */}
        {showApplyModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className="bg-white rounded-t-[28px] w-full max-w-md shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-base tracking-tight">Apply for Leave</h4>
                <button onClick={() => setShowApplyModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              <form onSubmit={handleApplySubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs">{formError}</div>
                )}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Leave Type</label>
                  <select
                      value={formData.leaveType}
                      onChange={(e) => setFormData(prev => ({ ...prev, leaveType: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-surface border border-outline-variant text-on-surface text-sm rounded-[14px] outline-none focus:border-secondary"
                    >
                      <option value="casual">Casual Leave</option>
                      <option value="sick">Sick Leave</option>
                      <option value="earned">Earned Leave</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">From</label>
                      <input type="date" required value={formData.fromDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, fromDate: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-surface border border-outline-variant text-on-surface text-sm rounded-[14px] outline-none focus:border-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">To</label>
                      <input type="date" required value={formData.toDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, toDate: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-surface border border-outline-variant text-on-surface text-sm rounded-[14px] outline-none focus:border-secondary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Reason</label>
                    <textarea value={formData.reason} onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      rows={3} className="w-full px-4 py-2.5 bg-surface border border-outline-variant text-on-surface text-sm rounded-[14px] outline-none focus:border-secondary resize-none"
                    />
                  </div>
                <button type="submit"
                  className="w-full bg-gradient-to-r from-[#536164] to-[#C8D5BB] text-white font-bold text-sm py-3.5 rounded-[16px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm mt-2 hover:opacity-90"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Submit Request
                </button>
              </form>
            </div>
          </div>
        )}

        <MobileBottomNav />
      </div>
    );
  }

  // ── Desktop View ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface font-sans">
      <Sidebar />
      <main className="lg:ml-[280px] ml-0 min-h-screen relative">
        <Topbar />
        
        <div className="p-container-margin-mobile lg:p-container-margin-desktop max-w-[1600px] mx-auto pb-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-headline-lg font-headline-lg text-primary tracking-tight">Leave Records</h2>
              <p className="text-body-md text-on-surface-variant">Audit staff leave requests and balance allocations.</p>
            </div>
            {user?.role === 'employee' && (
              <button
                onClick={() => setShowApplyModal(true)}
                style={{ 
                  background: 'linear-gradient(to top, #536164, #94A293, #C8D5BB)', 
                  boxShadow: '0px 4px 16px rgba(0,0,0,0.08), 0px 2px 4px rgba(0,0,0,0.04)'
                }}
                className="px-6 py-2.5 text-white text-label-md font-bold rounded-xl inline-flex items-center gap-2 transition-all hover:opacity-90"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Apply Leave</span>
              </button>
            )}
          </div>

          {/* Balance Tracker Panel */}
          <div className="bg-white rounded-xl card-shadow border border-outline-variant p-6 mb-stack-lg">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">verified_user</span>
                <span>Leave Balance Calculator</span>
              </h4>
              {user?.role !== 'employee' && employees.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
                  <select
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    className="bg-surface border border-outline-variant text-body-md text-on-surface rounded-lg px-3 py-2 outline-none focus:border-secondary"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {employees.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant flex flex-col items-center">
                <span className="material-symbols-outlined text-[48px] text-outline mb-2">person_off</span>
                <p className="text-body-md font-medium">No employees registered yet. Go to the Staff Registry to add an employee.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Object.keys(balances).filter(k => k !== 'unpaid').map(k => {
                  const colors = {
                    sick: 'bg-red-500',
                    casual: 'bg-gradient-to-r from-[#536164] to-[#C8D5BB]',
                    earned: 'bg-green-500'
                  };
                  
                  return (
                    <div key={k} className="bg-surface border border-outline-variant rounded-xl p-5 relative overflow-hidden group">
                      <span className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wide block capitalize">{k} Leaves</span>
                      <div className="flex items-baseline space-x-2 mt-3 relative z-10">
                        <span className="text-[32px] leading-tight font-extrabold text-primary">{balances[k].remaining}</span>
                        <span className="text-body-md text-on-surface-variant">left of {balances[k].limit}</span>
                      </div>
                      <div className="w-full bg-surface-container-high h-2 rounded-full mt-4 overflow-hidden relative z-10">
                        <div 
                          className={`${colors[k]} h-full rounded-full transition-all duration-500 ease-out`} 
                          style={{ width: `${Math.min(100, (balances[k].used / balances[k].limit) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Requests Queue */}
          <div className="bg-white rounded-xl card-shadow border border-outline-variant overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h4 className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">event_busy</span>
                <span>Leave Requests Queue</span>
              </h4>
            </div>

            {loading ? (
              <div className="p-12 text-center text-on-surface-variant flex flex-col items-center">
                 <span className="material-symbols-outlined animate-spin text-[32px] text-secondary mb-4">refresh</span>
                 <p>Loading leave ledger...</p>
              </div>
            ) : leaves.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant flex flex-col items-center">
                 <span className="material-symbols-outlined text-[48px] text-outline mb-4">check_circle</span>
                 <p>All staff are active. No leave requests found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface">
                    <tr>
                      <th className="px-6 py-4 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-4 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Leave Type</th>
                      <th className="px-6 py-4 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-4 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Days</th>
                      <th className="px-6 py-4 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-4 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Status</th>
                      {user?.role !== 'employee' && <th className="px-6 py-4 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider text-right">Approvals</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {leaves.map(l => (
                      <tr key={l.id} className="leave-row hover:bg-surface-container transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold">
                              {l.employee.firstName[0]}
                            </div>
                            <div>
                              <p className="font-bold text-body-md text-on-surface">{l.employee.firstName} {l.employee.lastName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 capitalize font-bold text-on-surface">{l.leaveType}</td>
                        <td className="px-6 py-4 text-body-md text-on-surface">
                          {new Date(l.fromDate).toLocaleDateString()} to {new Date(l.toDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-headline-sm font-bold text-primary">{getDaysDiff(l.fromDate, l.toDate)}</td>
                        <td className="px-6 py-4 text-body-md max-w-[200px] truncate text-on-surface-variant" title={l.reason}>
                          {l.reason || 'No reason provided'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            l.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : l.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            <span className="material-symbols-outlined text-[12px]">
                              {l.status === 'approved' ? 'check_circle' : l.status === 'rejected' ? 'cancel' : 'schedule'}
                            </span>
                            {l.status}
                          </span>
                        </td>
                        {user?.role !== 'employee' && (
                          <td className="px-6 py-4 text-right">
                            {l.status === 'pending' && (
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleStatusChange(l.id, 'approved')}
                                  className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors border border-transparent hover:border-green-200"
                                  title="Approve"
                                >
                                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                </button>
                                <button
                                  onClick={() => handleStatusChange(l.id, 'rejected')}
                                  className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors border border-transparent hover:border-red-200"
                                  title="Reject"
                                >
                                  <span className="material-symbols-outlined text-[20px]">cancel</span>
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Apply Leave Modal */}
          {showApplyModal && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md card-shadow border border-outline-variant overflow-hidden">
                
                <div className="flex justify-between items-center px-6 py-5 border-b border-outline-variant bg-surface-container-low">
                  <h4 className="font-headline-sm font-bold text-on-surface tracking-tight">Request Staff Time-Off</h4>
                  <button onClick={() => setShowApplyModal(false)} className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <form onSubmit={handleApplySubmit} className="p-6 space-y-5">
                  {formError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-body-md flex items-center gap-2">
                       <span className="material-symbols-outlined text-red-600">error</span>
                      {formError}
                    </div>
                  )}

                  <div>
                    <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Requesting Employee</label>
                    <select
                      required
                      disabled={user?.role === 'employee'}
                      value={formData.employeeId}
                      onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary disabled:opacity-60"
                    >
                      <option value="">Select Staff...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.empId})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Leave Category</label>
                    <select
                      value={formData.leaveType}
                      onChange={(e) => setFormData(prev => ({ ...prev, leaveType: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary"
                    >
                      <option value="casual">Casual Leave</option>
                      <option value="sick">Sick Leave</option>
                      <option value="earned">Earned Leave</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">From Date</label>
                      <input
                        type="date"
                        required
                        value={formData.fromDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, fromDate: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">To Date</label>
                      <input
                        type="date"
                        required
                        value={formData.toDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, toDate: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Reason</label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      rows="3"
                      className="w-full px-4 py-2.5 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary resize-none"
                    ></textarea>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-outline-variant">
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="px-5 py-2.5 bg-surface hover:bg-surface-container text-on-surface text-label-md font-bold rounded-lg border border-outline-variant transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ 
                        background: 'linear-gradient(to top, #536164, #94A293, #C8D5BB)', 
                        boxShadow: '0px 4px 16px rgba(0,0,0,0.08), 0px 2px 4px rgba(0,0,0,0.04)'
                      }}
                      className="px-6 py-2.5 text-white text-label-md font-bold rounded-lg inline-flex items-center gap-2 transition-all hover:opacity-90"
                    >
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Submit Request</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

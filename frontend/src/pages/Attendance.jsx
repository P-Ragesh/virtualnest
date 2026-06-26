import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import MobileBottomNav from '../components/MobileBottomNav';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { gsap } from 'gsap';
import * as XLSX from 'xlsx';

export default function Attendance() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState('');
  
  const [showLogModal, setShowLogModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [checkedOutToday, setCheckedOutToday] = useState(false);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().substring(0, 10),
    checkIn: '',
    checkOut: '',
    status: 'present'
  });

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

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      let matchedEmployeeId = null;
      
      if (user?.role === 'employee') {
        const { data: emps } = await api.get('/employees');
        const matched = emps.find(e => e.email === user.email);
        if (matched) {
          params.employeeId = matched.id;
          matchedEmployeeId = matched.id;
        }
      }
      
      const { data } = await api.get('/attendance', { params });
      setLogs(data);
      
      // Check today's attendance status
      if (user?.role === 'employee' && matchedEmployeeId) {
        const todayStr = new Date().toDateString();
        const todayLog = data.find(l => new Date(l.date).toDateString() === todayStr);
        if (todayLog) {
          setCheckedInToday(true);
          if (todayLog.checkOut) {
            setCheckedOutToday(true);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchLogs();
  }, []);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!loading && logs.length > 0) {
      gsap.fromTo('.log-row', 
        { y: 10, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.03, ease: 'power2.out' }
      );
    }
  }, [loading, logs]);

  const handleManualCheckIn = async (empId) => {
    setMessage('');
    try {
      await api.post('/attendance/check-in', { employeeId: empId });
      setCheckedInToday(true);
      fetchLogs();
      setMessage('Staff Check-In recorded successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Check-in failed');
    }
  };

  const handleManualCheckOut = async (empId) => {
    setMessage('');
    try {
      await api.post('/attendance/check-out', { employeeId: empId });
      setCheckedOutToday(true);
      fetchLogs();
      setMessage('Staff Check-Out recorded successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Check-out failed');
    }
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    try {
      const logData = {
        ...formData,
        employeeId: parseInt(formData.employeeId),
        checkIn: formData.checkIn ? new Date(`${formData.date}T${formData.checkIn}`) : null,
        checkOut: formData.checkOut ? new Date(`${formData.date}T${formData.checkOut}`) : null
      };

      await api.post('/attendance/log', logData);
      fetchLogs();
      setShowLogModal(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Log record failed');
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredLogs = logs.filter(log => {
    const name = `${log.employee.firstName} ${log.employee.lastName}`.toLowerCase();
    const id = log.employee.empId.toLowerCase();
    const query = search.toLowerCase();
    return name.includes(query) || id.includes(query);
  });

  const exportAttendance = () => {
    const data = filteredLogs.map(l => ({
      "Employee Name": `${l.employee.firstName} ${l.employee.lastName}`,
      "Employee ID": l.employee.empId,
      "Department": l.employee.department,
      "Date": new Date(l.date).toLocaleDateString(),
      "Clock In": formatTime(l.checkIn),
      "Clock Out": formatTime(l.checkOut),
      "Status": l.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "attendance_report.xlsx");
  };

  // ── Mobile View ──────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <div className="px-5 pt-6 pb-28">

          {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Attendance</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Your shift history</p>
          </div>
          <button
            onClick={exportAttendance}
            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
            title="Export Excel"
          >
            <span className="material-symbols-outlined text-[20px]">table_chart</span>
          </button>
        </div>

          {/* Check In / Out Quick Actions */}
          {user?.role === 'employee' && employees.length > 0 && (
            <div className="bg-slate-50 border border-slate-100 rounded-[20px] p-4 mb-6 space-y-3">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Shift</p>
              {message && (
                <div className="text-[11px] font-bold text-green-700 bg-green-50 px-3 py-2 rounded-xl border border-green-100">
                  {message}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={checkedInToday}
                      onClick={() => handleManualCheckIn(employees[0]?.id)}
                      className={`flex items-center justify-center gap-2 text-[12px] font-bold py-3 rounded-[16px] active:scale-95 transition-all shadow-sm ${
                        checkedInToday 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-[#2563EB] text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      Clock In
                    </button>
                    <button
                      disabled={!checkedInToday || checkedOutToday}
                      onClick={() => handleManualCheckOut(employees[0]?.id)}
                      className={`flex items-center justify-center gap-2 text-[12px] font-bold py-3 rounded-[16px] active:scale-95 transition-all shadow-sm ${
                        !checkedInToday || checkedOutToday
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-black text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Clock Out
                    </button>
                  </div>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-[14px] text-[12px] text-on-surface placeholder-on-surface-variant outline-none focus:border-secondary transition-colors"
            />
          </div>

          {/* Shift Logs as Cards */}
          {loading ? (
            <div className="flex flex-col items-center py-12 text-slate-400">
              <span className="material-symbols-outlined animate-spin text-[32px] mb-3">refresh</span>
              <p className="text-xs">Loading logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-slate-400">
              <span className="material-symbols-outlined text-[48px] mb-3 text-slate-200">search_off</span>
              <p className="text-xs font-medium">No records found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map(l => {
                const statusStyle = l.status === 'present'
                  ? 'bg-green-50 text-green-700'
                  : l.status === 'absent'
                  ? 'bg-red-50 text-red-600'
                  : l.status === 'half-day'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-slate-100 text-slate-500';
                return (
                  <div key={l.id} className="bg-white border border-slate-100 rounded-[18px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm uppercase">
                          {l.employee.firstName[0]}
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-slate-800 leading-tight">{l.employee.firstName} {l.employee.lastName}</p>
                          <p className="text-[10px] text-slate-400">{l.employee.empId}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase ${statusStyle}`}>
                        {l.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="bg-slate-50 rounded-[10px] p-2 text-center">
                        <p className="text-[8px] text-slate-400 font-bold uppercase mb-0.5">Date</p>
                        <p className="text-[10px] font-bold text-slate-700">{new Date(l.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</p>
                      </div>
                      <div className="bg-green-50 rounded-[10px] p-2 text-center">
                        <p className="text-[8px] text-green-500 font-bold uppercase mb-0.5">In</p>
                        <p className="text-[10px] font-bold text-green-700">{formatTime(l.checkIn)}</p>
                      </div>
                      <div className="bg-amber-50 rounded-[10px] p-2 text-center">
                        <p className="text-[8px] text-amber-500 font-bold uppercase mb-0.5">Out</p>
                        <p className="text-[10px] font-bold text-amber-700">{formatTime(l.checkOut)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-headline-lg font-headline-lg text-primary tracking-tight">Attendance Management</h2>
              <p className="text-body-md text-on-surface-variant">Monitor daily workforce presence, shifts, and time tracking.</p>
            </div>
            <div className="flex items-center gap-stack-md">
              <button 
                onClick={exportAttendance}
                className="px-4 py-2 border border-outline-variant rounded-lg font-label-md bg-white hover:bg-surface-container-low transition-colors flex items-center gap-2 card-shadow"
              >
                <span className="material-symbols-outlined text-[20px]">table_chart</span> Export Excel
              </button>

            </div>
          </div>

          {/* Quick Terminal Gate */}
          {user?.role === 'employee' && (
            <div className="bg-white p-6 rounded-xl card-shadow border border-outline-variant mb-stack-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
               <div className="relative z-10 w-full md:w-auto flex-1">
                 <h4 className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider mb-2">Virtual Terminal</h4>
                 <p className="text-body-md text-on-surface-variant mb-4">Quickly log shift starts and ends for any staff member.</p>
                 {employees.length === 0 ? (
                   <select
                      disabled
                      className="w-full md:max-w-md bg-surface border border-outline-variant text-label-md text-on-surface-variant rounded-lg px-4 py-2 outline-none opacity-60"
                    >
                      <option value="">No active employees found</option>
                    </select>
                 ) : (
                   <select
                      disabled={user?.role === 'employee'}
                      value={selectedEmpId}
                      onChange={(e) => setSelectedEmpId(e.target.value)}
                      className="w-full md:max-w-md bg-surface border border-outline-variant text-label-md text-on-surface rounded-lg px-4 py-2 outline-none focus:border-secondary disabled:opacity-60"
                    >
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.empId})</option>
                      ))}
                    </select>
                 )}
               </div>

               <div className="relative z-10 flex flex-col w-full md:w-auto items-center gap-3 border-t md:border-t-0 md:border-l border-outline-variant pt-6 md:pt-0 md:pl-8">
                  <div className="flex items-center gap-3 w-full">
                    <button
                      disabled={!selectedEmpId || checkedInToday}
                      onClick={() => handleManualCheckIn(selectedEmpId)}
                      className={`flex-1 flex items-center justify-center space-x-2 text-label-md font-bold px-6 py-2.5 rounded-lg transition-all shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${
                        checkedInToday 
                          ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed' 
                          : 'bg-secondary text-on-secondary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">login</span>
                      <span>Clock In</span>
                    </button>
                    <button
                      disabled={!selectedEmpId || !checkedInToday || checkedOutToday}
                      onClick={() => handleManualCheckOut(selectedEmpId)}
                      className={`flex-1 flex items-center justify-center space-x-2 text-label-md font-bold px-6 py-2.5 rounded-lg transition-all shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${
                        !checkedInToday || checkedOutToday
                          ? 'bg-surface border border-outline-variant text-on-surface-variant' 
                          : 'bg-surface border border-outline-variant hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      <span>Clock Out</span>
                    </button>
                  </div>
                  {message && (
                    <div className="text-label-sm font-bold text-green-600 flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>{message}</span>
                    </div>
                  )}
               </div>
            </div>
          )}

          {/* Logs lists filter and grid */}
          <div className="bg-white rounded-xl card-shadow border border-outline-variant overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-headline-md font-bold text-on-surface">Shift History Logs</h3>
              
              <div className="flex gap-2">
                <div className="flex items-center bg-surface px-4 py-1.5 rounded-full w-full md:w-64 border border-outline-variant">
                  <span className="material-symbols-outlined text-outline mr-2 text-[18px]">search</span>
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-body-md w-full placeholder:text-on-surface-variant outline-none"
                  />
                </div>
                <button className="p-1.5 border border-outline-variant rounded-full hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-[20px]">filter_list</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-on-surface-variant flex flex-col items-center">
                <span className="material-symbols-outlined animate-spin text-[32px] text-secondary mb-4">refresh</span>
                <p>Loading registry logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] text-outline mb-4">search_off</span>
                <p>No shift recordings found matching parameters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low">
                    <tr>
                      <th className="px-6 py-4 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-4 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">In Time</th>
                      <th className="px-6 py-4 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Out Time</th>
                      <th className="px-6 py-4 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {filteredLogs.map(l => (
                      <tr key={l.id} className="log-row hover:bg-surface-container transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold">
                              {l.employee.firstName[0]}
                            </div>
                            <div>
                              <p className="font-bold text-body-md text-on-surface">{l.employee.firstName} {l.employee.lastName}</p>
                              <p className="text-label-sm text-on-surface-variant">ID: {l.employee.empId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-body-md">
                          {new Date(l.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-body-md font-medium text-on-surface">
                            <span className="material-symbols-outlined text-[16px] text-green-600">login</span>
                            {formatTime(l.checkIn)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-body-md font-medium text-on-surface">
                            <span className="material-symbols-outlined text-[16px] text-amber-600">logout</span>
                            {formatTime(l.checkOut)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            l.status === 'present'
                              ? 'bg-green-100 text-green-700'
                              : l.status === 'absent'
                              ? 'bg-red-100 text-red-700'
                              : l.status === 'half-day'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-surface-container-highest text-on-surface-variant'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="p-4 bg-surface border-t border-outline-variant flex justify-between items-center">
              <span className="text-label-sm text-on-surface-variant">Showing {filteredLogs.length} records</span>
            </div>
          </div>

          {/* Manual Entry Modal - Styled with MD3 */}
          {showLogModal && (
            <div style={{ backgroundColor: 'rgba(83, 97, 100, 0.2)' }} className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
                <div className="p-6 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                  <h3 className="text-headline-md font-bold text-on-surface">Manual Override</h3>
                  <button onClick={() => setShowLogModal(false)} className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <form onSubmit={handleLogSubmit} className="p-6 space-y-6">
                  <div>
                    <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Target Employee</label>
                    <select
                      required
                      value={formData.employeeId}
                      onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                      className="w-full px-4 py-3 bg-surface border border-outline-variant text-body-md rounded-lg outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                    >
                      <option value="">Select Staff...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.empId})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Shift Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 bg-surface border border-outline-variant text-body-md rounded-lg outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Clock In Time</label>
                      <input
                        type="time"
                        value={formData.checkIn}
                        onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                        className="w-full px-4 py-3 bg-surface border border-outline-variant text-body-md rounded-lg outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Clock Out Time</label>
                      <input
                        type="time"
                        value={formData.checkOut}
                        onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                        className="w-full px-4 py-3 bg-surface border border-outline-variant text-body-md rounded-lg outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Shift Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-3 bg-surface border border-outline-variant text-body-md rounded-lg outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="half-day">Half Day</option>
                      <option value="wfh">Work From Home (WFH)</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                    <button
                      type="button"
                      onClick={() => setShowLogModal(false)}
                      className="px-5 py-2.5 text-on-surface-variant font-bold hover:bg-surface-container-high rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ 
                        background: 'linear-gradient(to top, #536164, #94A293, #C8D5BB)', 
                        boxShadow: '0px 4px 16px rgba(0,0,0,0.08), 0px 2px 4px rgba(0,0,0,0.04)'
                      }}
                      className="px-6 py-2.5 text-white font-bold rounded-lg hover:opacity-90 transition-all"
                    >
                      Save Override
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Floating Action Button (FAB) */}
          <button 
             onClick={() => setShowLogModal(true)}
             style={{ 
               background: 'linear-gradient(to top, #536164, #94A293, #C8D5BB)', 
               boxShadow: '0px 4px 16px rgba(0,0,0,0.08), 0px 2px 4px rgba(0,0,0,0.04)'
             }}
             className="fixed bottom-10 right-10 w-14 h-14 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 md:hidden"
          >
             <span className="material-symbols-outlined text-[28px]" data-icon="add">add</span>
          </button>

        </div>
      </main>
    </div>
  );
}

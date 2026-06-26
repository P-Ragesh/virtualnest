import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role !== 'employee';
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [performancePeriod, setPerformancePeriod] = useState('Last Year');
  const [hoursPeriod, setHoursPeriod] = useState('This Week');
  const [notes, setNotes] = useState([
    { id: 1, title: 'Promotion Feedback', date: '10 January 2025', desc: '' },
    { id: 2, title: 'Employee Appreciation', date: '01 May 2025', desc: '' }
  ]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteFormData, setNoteFormData] = useState({ title: '', date: '', desc: '' });

  const fetchEmployee = async () => {
    try {
      const { data } = await api.get(`/employees/${id}`);
      setEmployee(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = () => {
      const dropdowns = document.querySelectorAll('.absolute.hidden');
      dropdowns.forEach(dropdown => dropdown.classList.add('hidden'));
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleOpenNoteModal = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setNoteFormData({ title: note.title, date: note.date, desc: note.desc });
      setEditingNoteId(noteId);
      setShowNoteModal(true);
    }
  };

  const handleSaveNote = () => {
    setNotes(prev => prev.map(note => {
      if (note.id === editingNoteId) {
        return { ...note, ...noteFormData };
      }
      return note;
    }));
    setShowNoteModal(false);
    setEditingNoteId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen font-sans">
        <Sidebar />
        <main className="lg:ml-[280px] ml-0 min-h-screen p-4">
          <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 p-4">
            <Topbar />
            <div className="p-container-margin-mobile lg:p-container-margin-desktop max-w-[1600px] mx-auto pb-24">
              <div className="flex items-center justify-center h-[60vh]">
                <span className="material-symbols-outlined animate-spin text-[48px] text-secondary">refresh</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen font-sans">
        <Sidebar />
        <main className="lg:ml-[280px] ml-0 min-h-screen p-4">
          <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 p-4">
            <Topbar />
            <div className="p-container-margin-mobile lg:p-container-margin-desktop max-w-[1600px] mx-auto pb-24">
              <div className="flex flex-col items-center justify-center h-[60vh]">
                <span className="material-symbols-outlined text-[48px] text-outline mb-4">search_off</span>
                <p className="text-on-surface-variant text-body-md">Employee not found</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const leaveStats = [
    { label: 'All Leaves', value: '14', total: '20', color: '#3a4446' },
    { label: 'Annual Leaves', value: '10', total: '15', color: '#94A293' },
    { label: 'Casual Leaves', value: '8', total: '12', color: '#536164' },
    { label: 'Sick Leaves', value: '3', total: '8', color: '#C8D5BB' }
  ];

  const performanceData = [65, 72, 78, 82, 75, 85, 88];
  const hoursData = [8, 7.5, 8, 6, 9, 8.5, 7];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  const renderCalendar = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date();
    
    const calendarDays = [];
    
    // Empty days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
      const isWeekend = date.getDay() === 0; // Only Sunday
      
      // Determine day status - remove hardcoded dummy data for now
      let dayStatus = null;
      
      calendarDays.push({ day, isToday, isWeekend, status: dayStatus, date });
    }
    
    return { monthName: monthNames[month], year, days: calendarDays };
  };

  const calendar = renderCalendar();

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-[#C8D5BB] to-white">
      <Sidebar />
      <main className="lg:ml-[280px] ml-0 min-h-screen p-4">
        <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 p-4">
          <Topbar />
          
          <div className="p-container-margin-mobile lg:p-container-margin-desktop max-w-[1600px] mx-auto pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => navigate('/employees')}
                className="w-10 h-10 rounded-full bg-white border border-[#C8D5BB] flex items-center justify-center text-[#3a4446] hover:bg-[#C8D5BB]/30 transition-all"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h2 className="text-headline-lg font-headline-lg tracking-tight" style={{ color: '#3a4446' }}>
                Employee Details
              </h2>
              <div className="ml-auto flex gap-2">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#C8D5BB] flex items-center justify-center text-[#3a4446]">
                  <span className="material-symbols-outlined">edit</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white border border-[#C8D5BB] flex items-center justify-center text-[#3a4446]">
                  <span className="material-symbols-outlined">settings</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#536164] to-[#C8D5BB] flex items-center justify-center text-white font-bold">
                  {employee.firstName[0]}
                </div>
                <span className="text-[#3a4446] font-bold">{employee.firstName} {employee.lastName}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Employee Profile Card */}
                <div className="bg-white rounded-2xl border border-[#C8D5BB] p-6">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#536164] to-[#C8D5BB] mb-6 flex items-center justify-center">
                    {employee.photo ? (
                      <img src={employee.photo} alt={employee.firstName} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <span className="text-5xl font-bold text-white">{employee.firstName[0]}</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-[#3a4446] mb-2">{employee.firstName} {employee.lastName}</h3>
                  <p className="text-sm text-[#94A293] mb-4">{employee.designation}</p>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#C8D5BB]/30 text-[#3a4446]">
                      {employee.empId}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">
                      {employee.status}
                    </span>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[#C8D5BB]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#94A293]">Employment Type</span>
                      <span className="text-sm font-bold text-[#3a4446]">Full-Time</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#94A293]">Join Date</span>
                      <span className="text-sm font-bold text-[#3a4446]">
                        {new Date(employee.joinDate).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6">
                    <div className="w-10 h-10 rounded-xl bg-[#C8D5BB]/30 flex items-center justify-center text-[#3a4446]">
                      <span className="material-symbols-outlined">link</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#C8D5BB]/30 flex items-center justify-center text-[#3a4446]">
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="bg-white rounded-2xl border border-[#C8D5BB] p-6">
                  <h4 className="text-lg font-bold text-[#3a4446] mb-4">Personal Info</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#94A293]">person</span>
                      <div>
                        <p className="text-xs text-[#94A293]">Gender</p>
                        <p className="text-sm font-bold text-[#3a4446]">{employee.gender || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#94A293]">phone</span>
                      <div>
                        <p className="text-xs text-[#94A293]">Phone</p>
                        <p className="text-sm font-bold text-[#3a4446]">{employee.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#94A293]">mail</span>
                      <div>
                        <p className="text-xs text-[#94A293]">Email Address</p>
                        <p className="text-sm font-bold text-[#3a4446]">{employee.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#94A293]">home</span>
                      <div>
                        <p className="text-xs text-[#94A293]">Address</p>
                        <p className="text-sm font-bold text-[#3a4446]">{employee.address || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#94A293]">business</span>
                      <div>
                        <p className="text-xs text-[#94A293]">Department</p>
                        <p className="text-sm font-bold text-[#3a4446]">{employee.department}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#94A293]">supervisor_account</span>
                      <div>
                        <p className="text-xs text-[#94A293]">Reporting Manager</p>
                        <p className="text-sm font-bold text-[#3a4446]">{employee.reportingManager || 'Not assigned'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Leave Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {leaveStats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-2xl border border-[#C8D5BB] p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="relative w-12 h-12">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#C8D5BB" strokeWidth="3" />
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke={stat.color} strokeWidth="3"
                              strokeDasharray="100" strokeDashoffset={100 - (stat.value / stat.total) * 100}
                              strokeLinecap="round" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-[#3a4446]">{stat.value}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-[#94A293]">days</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-[#3a4446]">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Performance Overview */}
                <div className="bg-white rounded-2xl border border-[#C8D5BB] p-4 max-h-[220px]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-[#3a4446]">Performance Overview</h4>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const dropdown = e.currentTarget.nextElementSibling;
                          dropdown.classList.toggle('hidden');
                        }}
                        className="text-xs font-bold px-3 py-1 rounded-full bg-[#C8D5BB]/30 text-[#3a4446] flex items-center gap-2"
                      >
                        {performancePeriod}
                        <span className="material-symbols-outlined text-sm">expand_more</span>
                      </button>
                      <div 
                        className="absolute right-0 top-full mt-2 bg-white border border-[#C8D5BB] rounded-xl shadow-lg z-10 hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {['This Year', 'This Month', 'Previous Month', 'Last Year'].map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setPerformancePeriod(option);
                              const dropdown = document.querySelector('.absolute.hidden');
                              dropdown.classList.add('hidden');
                            }}
                            className={`w-full px-4 py-2 text-left text-xs font-bold text-[#3a4446] hover:bg-[#C8D5BB]/30 transition-colors ${option === performancePeriod ? 'bg-[#C8D5BB]/50' : ''}`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end gap-6 mb-3">
                    <div>
                      <p className="text-2xl font-bold text-[#3a4446]">86.75%</p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        +2.05% increased by last year
                      </p>
                    </div>
                    <div className="ml-auto">
                      <div className="w-14 h-8 rounded-lg bg-white border border-[#C8D5BB] flex items-center justify-center mb-1">
                        <span className="text-sm font-bold text-[#3a4446]">80.5</span>
                      </div>
                      <p className="text-xs text-[#94A293]">Sep, 2025</p>
                    </div>
                  </div>
                  <div className="flex items-end gap-2 h-16 mb-0">
                    {performanceData.map((value, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-0.5">
                        <div 
                          className="w-full rounded-t-lg transition-all" 
                          style={{ 
                            height: `${(value / 100) * 100}%`, 
                            minHeight: '20px',
                            background: 'linear-gradient(to top, #536164, #94A293, #C8D5BB)' 
                          }}
                        ></div>
                        <span className="text-xs text-[#94A293]">{['J', 'F', 'M', 'A', 'M', 'J', 'J'][index]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hours Logged, Calendar & Documents */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {/* Hours Logged */}
                    <div className="bg-white rounded-2xl border border-[#C8D5BB] p-4 max-h-[200px]">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-bold text-[#3a4446]">Hours Logged</h4>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const dropdown = e.currentTarget.nextElementSibling;
                              dropdown.classList.toggle('hidden');
                            }}
                            className="text-xs font-bold px-3 py-1 rounded-full bg-[#C8D5BB]/30 text-[#3a4446] flex items-center gap-2"
                          >
                            {hoursPeriod}
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                          </button>
                          <div 
                            className="absolute right-0 top-full mt-2 bg-white border border-[#C8D5BB] rounded-xl shadow-lg z-10 hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {['This Week', 'This Month', 'Previous Month', 'Last Week'].map((option) => (
                              <button
                                key={option}
                                onClick={() => {
                                  setHoursPeriod(option);
                                  const dropdown = document.querySelectorAll('.absolute.hidden')[1];
                                  dropdown.classList.add('hidden');
                                }}
                                className={`w-full px-4 py-2 text-left text-xs font-bold text-[#3a4446] hover:bg-[#C8D5BB]/30 transition-colors ${option === hoursPeriod ? 'bg-[#C8D5BB]/50' : ''}`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-end gap-4 mb-3">
                        <div>
                          <p className="text-2xl font-bold text-[#3a4446]">34h 30m</p>
                        </div>
                      </div>
                      <div className="flex items-end gap-2 h-16 mb-0">
                        {hoursData.map((value, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center gap-0.5">
                            <div 
                              className="w-full rounded-t-lg transition-all" 
                              style={{ 
                                height: `${(value / 10) * 100}%`, 
                                minHeight: '10px',
                                background: index === 4 ? '#3a4446' : 'linear-gradient(to top, #536164, #94A293, #C8D5BB)'
                              }}
                            ></div>
                            <span className="text-xs text-[#94A293]">{days[index]}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Calendar */}
                    <div className="bg-white rounded-2xl border border-[#C8D5BB] p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-[#3a4446]">{calendar.monthName} {calendar.year}</h4>
                        <div className="flex gap-2">
                          <button 
                            onClick={prevMonth}
                            className="w-8 h-8 rounded-lg bg-[#C8D5BB]/30 flex items-center justify-center text-[#3a4446] hover:bg-[#C8D5BB]/50 transition-all"
                          >
                            <span className="material-symbols-outlined">chevron_left</span>
                          </button>
                          <button 
                            onClick={nextMonth}
                            className="w-8 h-8 rounded-lg bg-[#C8D5BB]/30 flex items-center justify-center text-[#3a4446] hover:bg-[#C8D5BB]/50 transition-all"
                          >
                            <span className="material-symbols-outlined">chevron_right</span>
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                          <div key={i} className="w-8 h-8 flex items-center justify-center text-xs font-bold text-[#94A293]">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {calendar.days.map((dayData, i) => {
                          if (!dayData) {
                            return <div key={i} className="w-8 h-8" />;
                          }
                          
                          const { day, isToday, isWeekend, status } = dayData;
                          
                          let bgClass = '';
                          let textClass = 'text-[#3a4446]';
                          
                          if (isToday) {
                            bgClass = 'bg-[#94A293]';
                            textClass = 'text-white';
                          } else if (status === 'present') {
                            bgClass = 'bg-[#94A293]';
                            textClass = 'text-white';
                          } else if (status === 'half') {
                            bgClass = 'bg-[#C8D5BB]';
                            textClass = 'text-[#3a4446]';
                          } else if (status === 'leave') {
                            bgClass = 'bg-[#dc2626]';
                            textClass = 'text-white';
                          } else if (isWeekend) {
                            bgClass = 'bg-[#536164]';
                            textClass = 'text-white';
                          } else {
                            bgClass = 'hover:bg-[#C8D5BB]/20';
                          }
                          
                          return (
                            <div
                              key={i}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${bgClass} ${textClass}`}
                            >
                              {day}
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-6 pt-4 border-t border-[#C8D5BB]">
                        <div className="flex items-center gap-6 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#94A293]"></div>
                            <span className="text-xs text-[#3a4446]">Present</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#C8D5BB]"></div>
                            <span className="text-xs text-[#3a4446]">Half Day</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#dc2626]"></div>
                            <span className="text-xs text-[#3a4446]">Leave</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#536164]"></div>
                            <span className="text-xs text-[#3a4446]">Weekend</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="bg-white rounded-2xl border border-[#C8D5BB] p-6">
                    <h4 className="text-lg font-bold text-[#3a4446] mb-6">Documents</h4>
                    <div className="space-y-4">
                      {[
                        { name: 'Performance Evaluation', date: 'PDF', size: '124 MB' },
                        { name: 'Contract Agreement', date: 'PDF', size: '895 KB' },
                        { name: 'Curriculum Vitae', date: 'PDF', size: '1.2 MB' },
                        { name: 'Portfolio', date: 'PDF', size: '3.68 MB' }
                      ].map((doc, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-[#C8D5BB]/20">
                          <div className="w-10 h-10 rounded-lg bg-[#536164] flex items-center justify-center">
                            <span className="material-symbols-outlined text-white">description</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-[#3a4446]">{doc.name}</p>
                            <p className="text-xs text-[#94A293]">{doc.date} • {doc.size}</p>
                          </div>
                          <span className="material-symbols-outlined text-[#94A293]">download</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-white rounded-2xl border border-[#C8D5BB] p-6 relative">
                      {isAdmin && (
                        <button
                          onClick={() => handleOpenNoteModal(note.id)}
                          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#C8D5BB]/30 flex items-center justify-center text-[#3a4446] hover:bg-[#C8D5BB]/50 transition-all"
                          title="Edit Note"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-sm font-bold text-[#3a4446]">{note.title}</h5>
                        <span className="text-xs text-[#94A293]">{note.date}</span>
                      </div>
                      {note.desc ? (
                        <p className="text-sm text-[#3a4446]">{note.desc}</p>
                      ) : (
                        <p className="text-sm text-[#94A293] italic">No notes yet</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Payroll */}
              <div className="space-y-6">
                {/* Payroll Summary */}
                <div className="bg-white rounded-2xl border border-[#C8D5BB] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-[#3a4446]">Payroll Summary</h4>
                    <span className="material-symbols-outlined text-[#94A293]">more_vert</span>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-[#94A293] mb-2">Total Monthly Value</p>
                    <p className="text-3xl font-bold text-[#3a4446]">₹3,855</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Note Edit Modal */}
        {showNoteModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-lg border border-[#C8D5BB]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#C8D5BB]">
                <h4 className="text-lg font-bold text-[#3a4446]">Edit Note</h4>
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="p-2 hover:bg-[#C8D5BB]/30 rounded-lg text-[#94A293] transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#3a4446] mb-2">Title</label>
                  <input
                    type="text"
                    value={noteFormData.title}
                    onChange={(e) => setNoteFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-[#C8D5BB] text-[#3a4446] focus:outline-none focus:border-[#94A293]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#3a4446] mb-2">Date</label>
                  <input
                    type="text"
                    value={noteFormData.date}
                    onChange={(e) => setNoteFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-[#C8D5BB] text-[#3a4446] focus:outline-none focus:border-[#94A293]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#3a4446] mb-2">Description</label>
                  <textarea
                    value={noteFormData.desc}
                    onChange={(e) => setNoteFormData(prev => ({ ...prev, desc: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-[#C8D5BB] text-[#3a4446] focus:outline-none focus:border-[#94A293] resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#C8D5BB]">
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#C8D5BB] text-[#3a4446] font-semibold hover:bg-[#C8D5BB]/30 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-2 rounded-xl text-white font-semibold transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(to top, #536164, #94A293, #C8D5BB)' }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

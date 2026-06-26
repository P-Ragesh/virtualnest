import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import SkeletonLoader from '../components/SkeletonLoader';
import MobileBottomNav from '../components/MobileBottomNav';
import { useNavigate } from 'react-router-dom';

export default function MyProfile() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isAdmin = user?.role !== 'employee';

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: emps } = await api.get('/employees');
      const matched = emps.find(e => e.email === user.email);
      if (matched) {
        setEmployee(matched);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dummy data for widgets
  const leaveData = [
    { type: 'All Leaves', used: 14, total: 24 },
    { type: 'Annual Leaves', used: 10, total: 18 },
    { type: 'Casual Leaves', used: 8, total: 12 },
    { type: 'Sick Leaves', used: 3, total: 10 }
  ];

  const performanceData = {
    score: 86.75,
    change: '+2.05%',
    isPositive: true,
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    values: [75, 80, 78, 82, 85, 83, 86, 84, 87, 86.75, 86.75, 86.75]
  };

  const hoursData = [38, 42, 40, 36, 34, 38, 35];
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

  const [editingNotes, setEditingNotes] = useState({});
  const [noteValues, setNoteValues] = useState({});

  const toggleEditNote = (id) => {
    setEditingNotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const saveNote = (id) => {
    setEditingNotes(prev => ({ ...prev, [id]: false }));
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-white">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-sans flex flex-col items-center justify-center min-h-screen">
            <span className="material-symbols-outlined animate-spin text-[32px] text-primary mb-4">refresh</span>
            <p className="text-xs font-bold">Fetching profile folder...</p>
          </div>
        ) : !employee ? (
          <div className="p-8 text-center text-slate-500 font-sans flex flex-col items-center justify-center min-h-screen">
            <span className="material-symbols-outlined text-[32px] text-slate-400 mb-4">person_off</span>
            <p className="text-xs font-bold">Employee record not found</p>
          </div>
        ) : (
          <div className="bg-white min-h-screen px-5 pt-6 pb-28 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => navigate('/')}
                className="w-10 h-10 rounded-full bg-white border border-[#C8D5BB] flex items-center justify-center text-[#3a4446] hover:bg-[#C8D5BB]/30 transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h2 className="text-lg font-bold text-[#3a4446]">My Profile</h2>
              <div className="w-10"></div>
            </div>
            
            {/* Mobile content would go here, but for now, show desktop view */}
            <div className="lg:hidden">
              <p className="text-sm text-gray-500">Please use desktop view for full profile details</p>
            </div>
          </div>
        )}
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-surface">
      <Sidebar />
      <main className="lg:ml-[280px] ml-0 min-h-screen p-4">
        <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 p-4">
          <Topbar />
          
          <div className="p-container-margin-mobile lg:p-container-margin-desktop max-w-[1600px] mx-auto pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => navigate('/')}
                className="w-10 h-10 rounded-full bg-white border border-[#C8D5BB] flex items-center justify-center text-[#3a4446] hover:bg-[#C8D5BB]/30 transition-all"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h2 className="text-headline-lg font-headline-lg tracking-tight" style={{ color: '#3a4446' }}>
                My Profile
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <SkeletonLoader className="lg:col-span-1 h-96 rounded-2xl" />
                <div className="lg:col-span-3 space-y-6">
                  <SkeletonLoader className="h-48 rounded-2xl" />
                  <SkeletonLoader className="h-48 rounded-2xl" />
                </div>
              </div>
            ) : !employee ? (
              <div className="bg-white rounded-2xl border border-[#C8D5BB] p-8 text-center">
                <span className="material-symbols-outlined text-[#94A293] text-[64px] mb-4">person_off</span>
                <p className="text-lg font-bold text-[#3a4446]">Employee record not found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column - Profile Card & Personal Info */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Profile Card */}
                  <div className="bg-white rounded-2xl border border-[#C8D5BB] p-6">
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#536164] to-[#94A293] to-[#C8D5BB] flex items-center justify-center mb-6">
                      {employee.photo ? (
                        <img src={employee.photo} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <span className="text-5xl font-bold text-white">{employee.firstName[0]}</span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-[#3a4446] mb-1">
                      {employee.firstName} {employee.lastName}
                    </h3>
                    <p className="text-sm text-[#94A293] mb-2">{employee.designation}</p>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-[#C8D5BB]/30 text-[#3a4446] text-xs font-bold rounded-full">
                        {employee.empId}
                      </span>
                      <span className="px-3 py-1 bg-[#94A293]/20 text-[#3a4446] text-xs font-bold rounded-full">
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="bg-white rounded-2xl border border-[#C8D5BB] p-6">
                    <h4 className="text-lg font-bold text-[#3a4446] mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#94A293]">info</span>
                      Personal Info
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-[#94A293] mb-1">Gender</p>
                        <p className="text-sm font-bold text-[#3a4446]">{employee.gender || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#94A293] mb-1">Phone</p>
                        <p className="text-sm font-bold text-[#3a4446]">{employee.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#94A293] mb-1">Email Address</p>
                        <p className="text-sm font-bold text-[#3a4446]">{employee.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#94A293] mb-1">Address</p>
                        <p className="text-sm font-bold text-[#3a4446]">{employee.address || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#94A293] mb-1">Department</p>
                        <p className="text-sm font-bold text-[#3a4446]">{employee.department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#94A293] mb-1">Reporting Manager</p>
                        <p className="text-sm font-bold text-[#3a4446]">{employee.reportingManager || 'Not assigned'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[#C8D5BB]">
                      <div className="w-9 h-9 rounded-lg bg-[#C8D5BB]/30 flex items-center justify-center text-[#536164]">
                        <span className="material-symbols-outlined">link</span>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-[#C8D5BB]/30 flex items-center justify-center text-[#536164]">
                        <span className="material-symbols-outlined">alternate_email</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Widgets */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Top Row - Leave Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {leaveData.map((item, idx) => {
                      const colors = [
                        { fill: 'from-[#536164] to-[#3a4446]', bg: 'bg-[#536164]/10' },
                        { fill: 'from-[#94A293] to-[#536164]', bg: 'bg-[#94A293]/10' },
                        { fill: 'from-[#C8D5BB] to-[#94A293]', bg: 'bg-[#C8D5BB]/20' },
                        { fill: 'from-[#3a4446] to-[#536164]', bg: 'bg-[#3a4446]/10' }
                      ];
                      const percentage = (item.used / item.total) * 100;
                      
                      return (
                        <div key={idx} className="bg-white rounded-2xl border border-[#C8D5BB] p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="relative w-16 h-16">
                              {/* SVG Circle */}
                              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" stroke="#C8D5BB" strokeWidth="4" strokeDasharray="100" strokeDashoffset="0" />
                                <circle 
                                  cx="18" cy="18" r="16" fill="none" 
                                  stroke={idx === 0 ? '#536164' : idx === 1 ? '#94A293' : idx === 2 ? '#C8D5BB' : '#3a4446'} 
                                  strokeWidth="4" 
                                  strokeDasharray={`${percentage} 100`} 
                                  strokeDashoffset="0"
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold text-[#3a4446]">{item.used}</span>
                              </div>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-[#94A293]/20 flex items-center justify-center text-[#536164]">
                              <span className="material-symbols-outlined">calendar_month</span>
                            </div>
                          </div>
                          <h4 className="text-sm font-bold text-[#3a4446]">{item.type}</h4>
                          <p className="text-xs text-[#94A293]">
                            {item.total - item.used} days left from {item.total}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Middle Row - Performance & Hours Logged */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Sub-Column - Performance & Notes */}
                    <div className="space-y-6">
                      {/* Performance Overview */}
                      <div className="bg-white rounded-2xl border border-[#C8D5BB] p-6 max-h-72">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-[#3a4446]">Performance Overview</h4>
                          <button className="px-4 py-2 bg-[#C8D5BB]/30 text-[#3a4446] text-xs font-bold rounded-xl">
                            Last Year
                          </button>
                        </div>

                        <div className="flex items-end gap-4 mb-4">
                          <div>
                            <p className="text-3xl font-bold text-[#3a4446]">{performanceData.score}</p>
                            <p className="text-xs text-[#94A293]">
                              <span className="text-[#94A293] font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                                {performanceData.change} increased by last year
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Chart */}
                        <div className="flex items-end justify-between h-20 gap-2">
                          {performanceData.months.slice(0, 12).map((month, idx) => {
                            const height = (performanceData.values[idx] / 100) * 100;
                            return (
                              <div key={month} className="flex flex-col items-center gap-1 flex-1">
                                <div 
                                  className="w-full rounded-t-lg transition-all"
                                  style={{ 
                                    height: `${height}%`, 
                                    background: idx === 11 ? '#3a4446' : 'linear-gradient(to top, #536164, #94A293, #C8D5BB)',
                                    minHeight: '8px'
                                  }}
                                />
                                <span className="text-xs text-[#94A293]">{month}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Internal Notes */}
                      <div className="grid grid-cols-1 gap-6">
                        {/* Note 1 */}
                        <div className="bg-white rounded-2xl border border-[#C8D5BB] p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h5 className="text-sm font-bold text-[#3a4446]">Promotion Feedback</h5>
                              <p className="text-xs text-[#94A293]">10 January 2025</p>
                            </div>
                            {isAdmin && (
                              <button
                                onClick={() => toggleEditNote(1)}
                                className="w-8 h-8 rounded-lg hover:bg-[#C8D5BB]/20 flex items-center justify-center text-[#536164]"
                              >
                                <span className="material-symbols-outlined">edit</span>
                              </button>
                            )}
                          </div>
                          {editingNotes[1] ? (
                            <div>
                              <textarea
                                value={noteValues[1] || ''}
                                onChange={(e) => setNoteValues(prev => ({ ...prev, 1: e.target.value }))}
                                className="w-full p-3 border border-[#C8D5BB] rounded-xl text-sm text-[#3a4446] focus:outline-none focus:border-[#94A293] resize-none"
                                rows={4}
                                placeholder="Add feedback here..."
                              />
                              <div className="flex justify-end mt-3">
                                <button
                                  onClick={() => saveNote(1)}
                                  className="px-4 py-2 bg-gradient-to-r from-[#536164] to-[#C8D5BB] text-white text-xs font-bold rounded-xl"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            noteValues[1] ? (
                              <p className="text-sm text-[#3a4446] leading-relaxed">{noteValues[1]}</p>
                            ) : (
                              <p className="text-sm text-[#94A293] leading-relaxed italic">No feedback yet</p>
                            )
                          )}
                        </div>

                        {/* Note 2 */}
                        <div className="bg-white rounded-2xl border border-[#C8D5BB] p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h5 className="text-sm font-bold text-[#3a4446]">Employee Appreciation</h5>
                              <p className="text-xs text-[#94A293]">01 May 2025</p>
                            </div>
                            {isAdmin && (
                              <button
                                onClick={() => toggleEditNote(2)}
                                className="w-8 h-8 rounded-lg hover:bg-[#C8D5BB]/20 flex items-center justify-center text-[#536164]"
                              >
                                <span className="material-symbols-outlined">edit</span>
                              </button>
                            )}
                          </div>
                          {editingNotes[2] ? (
                            <div>
                              <textarea
                                value={noteValues[2] || ''}
                                onChange={(e) => setNoteValues(prev => ({ ...prev, 2: e.target.value }))}
                                className="w-full p-3 border border-[#C8D5BB] rounded-xl text-sm text-[#3a4446] focus:outline-none focus:border-[#94A293] resize-none"
                                rows={4}
                                placeholder="Add appreciation note here..."
                              />
                              <div className="flex justify-end mt-3">
                                <button
                                  onClick={() => saveNote(2)}
                                  className="px-4 py-2 bg-gradient-to-r from-[#536164] to-[#C8D5BB] text-white text-xs font-bold rounded-xl"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            noteValues[2] ? (
                              <p className="text-sm text-[#3a4446] leading-relaxed">{noteValues[2]}</p>
                            ) : (
                              <p className="text-sm text-[#94A293] leading-relaxed italic">No appreciation note yet</p>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Sub-Column - Hours Logged & Calendar */}
                    <div className="grid grid-cols-1 gap-6">
                      {/* Hours Logged */}
                      <div className="bg-white rounded-2xl border border-[#C8D5BB] p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-[#3a4446]">Hours Logged</h4>
                          <button className="px-4 py-2 bg-[#C8D5BB]/30 text-[#3a4446] text-xs font-bold rounded-xl">
                            This Week
                          </button>
                        </div>

                        <p className="text-3xl font-bold text-[#3a4446] mb-6">34h 30m</p>

                        {/* Chart */}
                        <div className="flex items-end justify-between h-24 gap-2">
                          {hoursData.map((value, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                              <div 
                                className="w-full rounded-t-lg transition-all" 
                                style={{ 
                                  height: `${(value / 10) * 100}%`, 
                                  minHeight: '10px',
                                  background: idx === 4 ? '#3a4446' : 'linear-gradient(to top, #536164, #94A293, #C8D5BB)'
                                }}
                              />
                              <span className="text-xs text-[#94A293]">{days[idx]}</span>
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
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

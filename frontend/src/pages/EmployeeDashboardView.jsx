import React, { useState, useRef, useEffect } from 'react';

export default function EmployeeDashboardView({ 
  user, 
  stats, 
  checkedInToday, 
  checkedOutToday, 
  checking, 
  lastCheckInTime, 
  handleSelfCheckIn, 
  handleSelfCheckOut, 
  personalBalances, 
  personalLeaves,
  message,
  tasks = [],
  announcements = [],
  meetings = [],
  events = []
}) {
  const [activeTab, setActiveTab] = useState('Last Year');
  const [activeScheduleTab, setActiveScheduleTab] = useState('Meetings');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Function to check if a task is due today
  const isToday = (dateStr) => {
    const taskDate = new Date(dateStr);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString();
  };
  
  const todayTasks = tasks.filter(t => isToday(t.dueDate));
  const pendingTasks = todayTasks.filter(t => ['pending', 'in_progress', 'review'].includes(t.status));
  const completedTasks = todayTasks.filter(t => t.status === 'completed');

  const formatMonthYear = (date) => {
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);
  };

  const getWeekDaysAroundSelected = (selectedDate) => {
    const days = [];
    for (let i = -2; i <= 2; i++) {
      const date = new Date(selectedDate);
      date.setDate(selectedDate.getDate() + i);
      days.push({
        date: date,
        day: date.getDate(),
        weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
        isSelected: date.toDateString() === selectedDate.toDateString()
      });
    }
    return days;
  };

  const weekDays = getWeekDaysAroundSelected(selectedDay);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDay);
    newDate.setDate(selectedDay.getDate() - 1);
    setSelectedDay(newDate);
    if (newDate.getMonth() !== selectedDay.getMonth()) {
      setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    }
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDay);
    newDate.setDate(selectedDay.getDate() + 1);
    setSelectedDay(newDate);
    if (newDate.getMonth() !== selectedDay.getMonth()) {
      setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    }
  };

  const handleSelectDay = (date) => {
    setSelectedDay(date);
    if (date.getMonth() !== currentMonth.getMonth()) {
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/60 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-600">insights</span>
            <h3 className="text-sm font-bold text-gray-800">Total Overview</h3>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setOpenDropdown(!openDropdown)}
              style={{ 
                backgroundColor: 'white', 
                borderColor: '#C8D5BB',
                borderRadius: '12px'
              }}
              className="flex items-center gap-1 border px-3 py-1.5 text-xs font-semibold text-[#3a4446] hover:border-[#94A293] focus:outline-none transition-colors"
            >
              {activeTab}
              <span className="material-symbols-outlined text-[16px] text-[#3a4446]">expand_more</span>
            </button>
            {openDropdown && (
              <div className="absolute top-full right-0 mt-1 w-full bg-white border border-[#C8D5BB] rounded-xl shadow-lg overflow-hidden z-10">
                {['Last Year', 'This Year', 'Last 6 Months'].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setActiveTab(option);
                      setOpenDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold transition-colors ${
                      activeTab === option ? 'bg-[#C8D5BB]' : 'hover:bg-[#C8D5BB]/30'
                    } text-[#3a4446]`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ borderBottomColor: '#C8D5BB' }} className="border-b mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Assigned Tasks */}
          <div style={{ borderRightColor: '#C8D5BB' }} className="flex items-center gap-3 p-4 rounded-2xl border-r md:border-r-2xl">
            <div style={{ backgroundColor: '#C8D5BB' }} className="w-11 h-11 rounded-full flex items-center justify-center">
              <span style={{ color: '#536164' }} className="material-symbols-outlined text-[24px]">assignment</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigned Tasks</p>
              <p className="text-xl font-bold text-gray-800">{tasks.length}</p>
            </div>
          </div>

          {/* Pending Tasks */}
          <div style={{ borderRightColor: '#C8D5BB' }} className="flex items-center gap-3 p-4 rounded-2xl border-r md:border-r-2xl">
            <div style={{ backgroundColor: '#C8D5BB' }} className="w-11 h-11 rounded-full flex items-center justify-center">
              <span style={{ color: '#536164' }} className="material-symbols-outlined text-[24px]">pending_actions</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Tasks</p>
              <p className="text-xl font-bold text-gray-800">{pendingTasks.length}</p>
            </div>
          </div>

          {/* Completed Tasks */}
          <div style={{ borderRightColor: '#C8D5BB' }} className="flex items-center gap-3 p-4 rounded-2xl border-r md:border-r-2xl">
            <div style={{ backgroundColor: '#C8D5BB' }} className="w-11 h-11 rounded-full flex items-center justify-center">
              <span style={{ color: '#536164' }} className="material-symbols-outlined text-[24px]">task_alt</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed Tasks</p>
              <p className="text-xl font-bold text-gray-800">{completedTasks.length}</p>
            </div>
          </div>

          {/* Earned Leave */}
          <div className="flex items-center gap-3 p-4 rounded-2xl">
            <div style={{ backgroundColor: '#C8D5BB' }} className="w-11 h-11 rounded-full flex items-center justify-center">
              <span style={{ color: '#536164' }} className="material-symbols-outlined text-[24px]">flight_takeoff</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Earned Leave</p>
              <p className="text-xl font-bold text-gray-800">{personalBalances?.earned?.remaining || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Charts & Tasks */}
        <div className="lg:col-span-2 space-y-4">
          {/* Check-in/Check-out & Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Check-in */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/60 p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-600">login</span>
                  <h3 className="text-sm font-bold text-gray-800">Attendance</h3>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Gate Status</p>
                  <p className="text-sm font-bold text-gray-800">
                    {checkedInToday ? (checkedOutToday ? 'Shift Ended' : 'Checked In') : 'Not Checked In'}
                  </p>
                </div>
                
                {!checkedInToday ? (
                  <button disabled={checking} onClick={handleSelfCheckIn} className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-[20px]">login</span> <span>Check In</span>
                  </button>
                ) : !checkedOutToday ? (
                  <button disabled={checking} onClick={handleSelfCheckOut} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-[20px]">logout</span> <span>Check Out</span>
                  </button>
                ) : (
                   <div className="px-6 py-3 bg-gray-200 border border-gray-300 text-gray-600 font-bold rounded-xl flex items-center justify-center gap-2 text-sm">
                     <span className="material-symbols-outlined text-[20px]">check_circle</span> <span>Completed</span>
                   </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/60 p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-600">lightbulb</span>
                  <h3 className="text-sm font-bold text-gray-800">Quick Actions</h3>
                </div>
              </div>
              
              <div className="space-y-3">
                <a href="/leave" className="flex items-center gap-3 p-4 bg-surface-container rounded-xl border border-outline-variant hover:bg-surface-container-highest transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C8D5BB] to-[#94A293] text-[#536164] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">edit_calendar</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface">Apply for Leave</span>
                </a>
                <a href="/attendance" className="flex items-center gap-3 p-4 bg-surface-container rounded-xl border border-outline-variant hover:bg-surface-container-highest transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C8D5BB] to-[#94A293] text-[#536164] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">history</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface">View Shift Logs</span>
                </a>
              </div>
            </div>
          </div>

          {/* My Tasks */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/60 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-600">description</span>
                <h3 className="text-sm font-bold text-gray-800">Today Tasks</h3>
              </div>
              <a href="/my-tasks" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
                View All <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </a>
            </div>

            <div className="space-y-2">
              {pendingTasks.length === 0 ? (
                <div className="p-6 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[28px] text-gray-400">done_all</span>
                  </div>
                  <h5 className="text-sm font-bold text-gray-800 mb-1">All Caught Up!</h5>
                  <p className="text-xs text-gray-500">You have no pending tasks assigned at the moment.</p>
                </div>
              ) : (
                pendingTasks.slice(0, 4).map(task => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.priority === 'critical' ? 'bg-red-500 border-red-500' : task.priority === 'high' ? 'bg-amber-500 border-amber-500' : 'bg-[#94A293] border-[#94A293]'}`}>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800">{task.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[10px] text-gray-500">
                          <span className="material-symbols-outlined text-[12px]">calendar_today</span> 
                          {new Date(task.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          task.priority === 'critical' ? 'bg-red-100 text-red-700' : 
                          task.priority === 'high' ? 'bg-amber-100 text-amber-700' : 
                          'bg-[#C8D5BB]/30 text-[#536164]'
                        }`}>{task.priority}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Schedule & Balances */}
        <div className="space-y-4">
          {/* Leave Balances */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/60 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-600">calendar_month</span>
                <h3 className="text-sm font-bold text-gray-800">Leave Balances</h3>
              </div>
              <a href="/leave" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
                Apply <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </a>
            </div>
            
            <div className="space-y-4">
              {['casual', 'sick', 'earned'].map(k => {
                if (!personalBalances[k]) return null;
                const bal = personalBalances[k];
                const pct = Math.min(100, ((bal.limit - bal.remaining) / bal.limit) * 100);
                return (
                  <div key={k}>
                    <div className="flex justify-between text-xs font-bold capitalize mb-2">
                      <span className="text-gray-800 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${k==='sick' ? 'bg-red-500' : k==='earned' ? 'bg-green-500' : 'bg-[#94A293]'}`}></span>
                        {k} Leave
                      </span>
                      <span className="text-gray-500">{bal.remaining} / {bal.limit}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${k==='sick' ? 'bg-red-500' : k==='earned' ? 'bg-green-500' : 'bg-gradient-to-r from-[#536164] to-[#C8D5BB]'}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/60 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">campaign</span>
                <h3 className="text-sm font-bold text-gray-800">Announcements</h3>
              </div>
            </div>
            
            <div className="space-y-3">
              {announcements.length === 0 ? (
                <p className="text-xs text-gray-500 text-center">No recent announcements.</p>
              ) : (
                announcements.slice(0, 3).map(ann => (
                  <div key={ann.id} className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">{ann.type === 'holiday' ? 'festival' : 'notifications'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-gray-800">{ann.title}</h5>
                      <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{ann.content}</p>
                      <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{new Date(ann.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Schedule (Calendar View) */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/60 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-600">calendar_today</span>
                <h3 className="text-sm font-bold text-gray-800">Schedule</h3>
              </div>
              <button className="text-xs font-semibold text-gray-600 hover:text-gray-800">See All</button>
            </div>

            {/* Month Navigation Box */}
            <div className="flex items-center justify-between bg-gray-100 rounded-xl px-3 py-2 mb-4 border border-gray-200 gap-2">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-white rounded-lg transition-colors shrink-0">
                <span className="material-symbols-outlined text-gray-600 text-[18px]">chevron_left</span>
              </button>
              <h4 className="text-xs font-bold text-gray-800 text-center flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {formatMonthYear(currentMonth)}
              </h4>
              <button onClick={handleNextMonth} className="p-1 hover:bg-white rounded-lg transition-colors shrink-0">
                <span className="material-symbols-outlined text-gray-600 text-[18px]">chevron_right</span>
              </button>
            </div>

            {/* Day Pills */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              <button onClick={handlePrevDay} className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
                <span className="material-symbols-outlined text-gray-600 text-[18px]">chevron_left</span>
              </button>
              <div className="flex items-center justify-center gap-2 flex-1">
                {weekDays.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectDay(item.date)}
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl shrink-0 transition-all ${
                    item.isSelected 
                      ? 'text-white shadow-md' 
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                  style={item.isSelected ? { 
                    background: 'linear-gradient(to top, #536164, #94A293, #C8D5BB)' 
                  } : {}}
                  >
                    <span className="text-[10px] font-bold">{item.weekday}</span>
                    <span className="text-sm font-bold">{item.day}</span>
                  </button>
                ))}
              </div>
              <button onClick={handleNextDay} className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
                <span className="material-symbols-outlined text-gray-600 text-[18px]">chevron_right</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[16px]">search</span>
              <input 
                type="text" 
                placeholder="Search"
                className="w-full pl-8 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs outline-none focus:border-green-400"
              />
            </div>

            {/* Schedule Tabs */}
            <div className="flex items-center justify-around mb-4 border-b border-gray-200">
              {['Meetings', 'Events', 'Holiday'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveScheduleTab(tab)}
                  className={`py-2 text-xs font-bold border-b-2 transition-all ${
                    activeScheduleTab === tab ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Schedule Content */}
            <div className="space-y-3">
              {activeScheduleTab === 'Meetings' && meetings.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No meetings scheduled
                </div>
              )}
              
              {activeScheduleTab === 'Meetings' && meetings.map((meeting, i) => {
                const participants = meeting.participants ? JSON.parse(meeting.participants) : [];
                const startTime = new Date(meeting.startTime);
                const endTime = new Date(meeting.endTime);
                
                const formatTime = (date) => date.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={meeting.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-gray-800">{meeting.title}</h4>
                      <span className="material-symbols-outlined text-gray-400 text-[14px]">expand_more</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mb-3">
                      {formatTime(startTime)} - {formatTime(endTime)} (UTC)
                    </p>
                    
                    {participants.length > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex -space-x-2">
                          {participants.slice(0, 3).map((_, j) => (
                            <div 
                              key={j}
                              className={`w-6 h-6 rounded-full border-2 border-white bg-gradient-to-br ${
                                j % 3 === 0 ? 'from-[#C8D5BB] to-[#94A293]' : 
                                j % 3 === 1 ? 'from-green-200 to-green-300' : 
                                'from-[#94A293] to-[#536164]'
                              } flex items-center justify-center`}
                            >
                              <span className="text-[10px] font-bold text-gray-600">
                                {String.fromCharCode(65 + j)}
                              </span>
                            </div>
                          ))}
                          {participants.length > 3 && (
                            <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600">
                              +{participants.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      {meeting.location && (
                        <span className="text-[10px] text-gray-500">
                          {meeting.location.startsWith('http') ? 'On Video Call' : meeting.location}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {activeScheduleTab === 'Events' && events.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No upcoming events
                </div>
              )}

              {activeScheduleTab === 'Events' && events.map((event, i) => {
                const eventDate = new Date(event.date);
                return (
                  <div key={event.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-gray-800">{event.title}</h4>
                      <span className="material-symbols-outlined text-gray-400 text-[14px]">expand_more</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mb-3">
                      {eventDate.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                      {!event.isAllDay && ` at ${eventDate.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}`}
                    </p>
                    {event.location && (
                      <span className="text-[10px] text-gray-500">{event.location}</span>
                    )}
                  </div>
                );
              })}

              {activeScheduleTab === 'Holiday' && (
                <>
                  {announcements.filter(a => a.type === 'holiday').length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-xs">
                      No upcoming holidays
                    </div>
                  )}
                  {announcements.filter(a => a.type === 'holiday').map((holiday) => {
                    const holDate = holiday.scheduledFor ? new Date(holiday.scheduledFor) : new Date(holiday.createdAt);
                    return (
                      <div key={holiday.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-gray-800">{holiday.title}</h4>
                        </div>
                        <p className="text-[10px] text-gray-500 mb-3">{holiday.content}</p>
                        <span className="text-[10px] text-gray-400">
                          {holDate.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

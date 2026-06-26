import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

export default function AdminDashboardView({ 
  stats, 
  employees = [], 
  announcements = [], 
  departmentCounts = [], 
  fetchStats,
  user,
  attendanceLogs = [],
  tasks = [],
  meetings = [],
  events = [],
  fetchMeetings
}) {
  const [activeTab, setActiveTab] = useState('Last Year');
  const [activeScheduleTab, setActiveScheduleTab] = useState('Meetings');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [openTimeDropdown, setOpenTimeDropdown] = useState(false);
  const [openChartDropdown, setOpenChartDropdown] = useState(false);
  const timeDropdownRef = useRef(null);
  const chartDropdownRef = useRef(null);

  // Add Meeting Modal state
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    startTime: '',
    endTime: '',
    location: ''
  });
  const [meetingSubmitting, setMeetingSubmitting] = useState(false);
  const [meetingError, setMeetingError] = useState('');

  useEffect(() => {
    // GSAP-like animation effect with CSS classes
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target)) {
        setOpenTimeDropdown(false);
      }
      if (chartDropdownRef.current && !chartDropdownRef.current.contains(event.target)) {
        setOpenChartDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    // If new month, update currentMonth
    if (newDate.getMonth() !== selectedDay.getMonth()) {
      setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    }
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDay);
    newDate.setDate(selectedDay.getDate() + 1);
    setSelectedDay(newDate);
    // If new month, update currentMonth
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
    <>
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/60 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-600">insights</span>
            <h3 className="text-sm font-bold text-gray-800">Total Overview</h3>
          </div>
          <div className="relative" ref={timeDropdownRef}>
            <button 
              onClick={() => setOpenTimeDropdown(!openTimeDropdown)}
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
            {openTimeDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#C8D5BB] rounded-xl shadow-lg overflow-hidden z-10">
                {['Last Year', 'This Year', 'Last 6 Months'].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setActiveTab(option);
                      setOpenTimeDropdown(false);
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
          {/* Today's Attendance */}
          <div style={{ borderRightColor: '#C8D5BB' }} className="flex items-center gap-3 p-4 rounded-2xl border-r md:border-r-2xl">
            <div style={{ backgroundColor: '#C8D5BB' }} className="w-11 h-11 rounded-full flex items-center justify-center">
              <span style={{ color: '#536164' }} className="material-symbols-outlined text-[24px]">check_circle</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Today Attendance</p>
              <p className="text-xl font-bold text-gray-800">{stats.todayAttendance || 0}</p>
            </div>
          </div>

          {/* Employees on Leave */}
          <div style={{ borderRightColor: '#C8D5BB' }} className="flex items-center gap-3 p-4 rounded-2xl border-r md:border-r-2xl">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-600 text-[24px]">event_busy</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">On Leave Today</p>
              <p className="text-xl font-bold text-gray-800">{stats.employeesOnLeave || 0}</p>
            </div>
          </div>

          {/* Total Employees */}
          <div style={{ borderRightColor: '#C8D5BB' }} className="flex items-center gap-3 p-4 rounded-2xl border-r md:border-r-2xl">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#C8D5BB]/30 to-[#94A293]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#536164] text-[24px]">group</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Employees</p>
              <p className="text-xl font-bold text-gray-800">{stats.totalEmployees || 0}</p>
            </div>
          </div>

          {/* Pending Leaves */}
          <div className="flex items-center gap-3 p-4 rounded-2xl">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600 text-[24px]">pending_actions</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Leaves</p>
              <p className="text-xl font-bold text-gray-800">{stats.pendingLeaves || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-4">
          {/* Invoice Chart */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/60 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-600">analytics</span>
                <h3 className="text-sm font-bold text-gray-800">Invoice Chart</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                  <span className="text-[10px] font-semibold text-gray-600">Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
                  <span className="text-[10px] font-semibold text-gray-600">Expenses</span>
                </div>
                <div className="relative" ref={chartDropdownRef}>
                  <button 
                    onClick={() => setOpenChartDropdown(!openChartDropdown)}
                    style={{ 
                      backgroundColor: 'white', 
                      borderColor: '#C8D5BB',
                      borderRadius: '12px'
                    }}
                    className="flex items-center gap-1 border px-3 py-1.5 text-xs font-semibold text-[#3a4446] hover:border-[#94A293] focus:outline-none transition-colors"
                  >
                    Last Year
                    <span className="material-symbols-outlined text-[16px] text-[#3a4446]">expand_more</span>
                  </button>
                  {openChartDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-[120px] bg-white border border-[#C8D5BB] rounded-xl shadow-lg overflow-hidden z-10">
                      {['Last Year', 'This Year', 'Last 6 Months'].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setOpenChartDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[#C8D5BB]/30 text-[#3a4446]`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between gap-2 h-56 px-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={`${day}-${i}`} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end h-full gap-1">
                    <div 
                      className="w-full bg-gradient-to-t from-gray-300 to-gray-100 rounded-t-xl"
                      style={{ height: `${40 + Math.random() * 40}%` }}
                    ></div>
                    {i === 3 && (
                      <div className="absolute mb-20 bg-gradient-to-r from-gray-700 to-gray-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-lg">
                        $109,822.10
                        <div className="w-2 h-2 bg-gradient-to-r from-gray-700 to-gray-600 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                      </div>
                    )}
                    <div 
                      className="w-3/5 bg-gradient-to-t from-green-400 to-green-200 rounded-t-xl"
                      style={{ height: `${30 + Math.random() * 30}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Row - Two Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weekly Schedule */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/60 p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-bold text-gray-400">Your meetings</p>
                  <h3 className="text-lg font-bold text-gray-800">Weekly schedule</h3>
                </div>
                <button
                  onClick={() => { setShowMeetingModal(true); setMeetingError(''); }}
                  className="p-2 hover:bg-[#C8D5BB]/30 rounded-full transition-colors"
                  title="Add Meeting"
                >
                  <span className="material-symbols-outlined text-gray-600 text-[20px]">more_vert</span>
                </button>
              </div>

              <div className="space-y-3">
                {meetings.length === 0 ? (
                  <div className="p-6 text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[28px] text-gray-400">event_busy</span>
                    </div>
                    <h5 className="text-sm font-bold text-gray-800 mb-1">No meetings</h5>
                    <p className="text-xs text-gray-500">No meetings scheduled this week.</p>
                  </div>
                ) : (
                  meetings.slice(0, 4).map((meeting, i) => {
                    const start = new Date(meeting.startTime);
                    const end = new Date(meeting.endTime);
                    const fmt = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={meeting.id ?? i} className="flex gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex flex-col items-center justify-center w-14 h-14 bg-white rounded-2xl border border-gray-200 shadow-sm">
                          <span className="text-[10px] font-bold text-gray-400">
                            {start.toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span className="text-xl font-bold text-gray-800">{start.getDate()}</span>
                        </div>
                        <div className="flex-1 flex flex-col justify-center gap-1">
                          <p className="text-sm font-bold text-gray-800">{meeting.title}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">{fmt(start)} - {fmt(end)}</p>
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C8D5BB]/20 to-[#94A293]/20 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[#536164] text-[18px]">videocam</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* My Tasks */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/60 p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-600">description</span>
                  <h3 className="text-sm font-bold text-gray-800">Today Tasks</h3>
                </div>
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-800">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add Task
                </button>
              </div>

              <div className="space-y-2">
                {/* Check if task is due today */}
                {(() => {
                  const isToday = (dateStr) => {
                    const taskDate = new Date(dateStr);
                    const today = new Date();
                    return taskDate.toDateString() === today.toDateString();
                  };
                  
                  const todayTasks = tasks.filter(t => isToday(t.dueDate));
                  
                  if (todayTasks.length === 0) {
                    return (
                      <div className="p-6 text-center flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                          <span className="material-symbols-outlined text-[28px] text-gray-400">done_all</span>
                        </div>
                        <h5 className="text-sm font-bold text-gray-800 mb-1">All Caught Up!</h5>
                        <p className="text-xs text-gray-500">No tasks due today.</p>
                      </div>
                    );
                  }
                  
                  return todayTasks.slice(0, 3).map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                        {task.status === 'completed' && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{task.title}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{task.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            task.priority === 'critical' ? 'bg-red-100 text-red-700' : 
                            task.priority === 'high' ? 'bg-orange-100 text-orange-700' : 
                            'bg-[#C8D5BB]/20 text-[#536164]'
                          }`}>{task.priority}</span>
                          <div className="flex items-center gap-1 ml-auto">
                            <span className="material-symbols-outlined text-gray-400 text-[12px]">event</span>
                            <span className="text-[9px] text-gray-400">{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Schedule */}
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
                <div key={meeting.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-gray-800">{meeting.title}</h4>
                    <span className="material-symbols-outlined text-gray-400 text-[16px]">expand_more</span>
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
                <div key={event.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-gray-800">{event.title}</h4>
                    <span className="material-symbols-outlined text-gray-400 text-[16px]">expand_more</span>
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
                    <div key={holiday.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
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

      {/* Add Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C8D5BB, #94A293)' }}>
                  <span className="material-symbols-outlined text-white text-[18px]">calendar_add_on</span>
                </div>
                <h3 className="text-base font-bold text-gray-800">Schedule Meeting</h3>
              </div>
              <button onClick={() => setShowMeetingModal(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <span className="material-symbols-outlined text-gray-500 text-[20px]">close</span>
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!meetingForm.title || !meetingForm.startTime || !meetingForm.endTime) {
                  setMeetingError('Title, Start Time and End Time are required.');
                  return;
                }
                if (new Date(meetingForm.endTime) <= new Date(meetingForm.startTime)) {
                  setMeetingError('End time must be after start time.');
                  return;
                }
                setMeetingSubmitting(true);
                setMeetingError('');
                try {
                  await api.post('/meetings', {
                    title: meetingForm.title,
                    startTime: new Date(meetingForm.startTime).toISOString(),
                    endTime: new Date(meetingForm.endTime).toISOString(),
                    location: meetingForm.location || null
                  });
                  setShowMeetingModal(false);
                  setMeetingForm({ title: '', startTime: '', endTime: '', location: '' });
                  if (fetchMeetings) fetchMeetings();
                } catch (err) {
                  setMeetingError(err.response?.data?.error || 'Failed to schedule meeting.');
                } finally {
                  setMeetingSubmitting(false);
                }
              }}
              className="p-6 space-y-4"
            >
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Meeting Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sprint Review"
                  value={meetingForm.title}
                  onChange={e => setMeetingForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-[#94A293] focus:bg-white transition-all"
                />
              </div>

              {/* Start & End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Start Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={meetingForm.startTime}
                    onChange={e => setMeetingForm(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-[#94A293] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">End Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={meetingForm.endTime}
                    onChange={e => setMeetingForm(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-[#94A293] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Location / Link</label>
                <input
                  type="text"
                  placeholder="e.g. Conference Room A or https://meet.google.com/..."
                  value={meetingForm.location}
                  onChange={e => setMeetingForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-[#94A293] focus:bg-white transition-all"
                />
              </div>

              {/* Error */}
              {meetingError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {meetingError}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMeetingModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={meetingSubmitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #536164, #94A293)' }}
                >
                  {meetingSubmitting ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">check</span>
                      Schedule
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

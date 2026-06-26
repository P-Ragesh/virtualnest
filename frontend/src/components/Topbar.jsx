import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [clockRunning, setClockRunning] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);
  const { user } = useAuth();
  
  const isDashboard = location.pathname === '/';

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    let timer;
    if (clockRunning) {
      timer = setInterval(() => setTime(new Date()), 1000);
    }
    return () => clearInterval(timer);
  }, [clockRunning]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark notification as read and navigate
  const handleNotificationClick = async (notification) => {
    try {
      await api.patch(`/notifications/${notification.id}/read`);
      fetchNotifications(); // Refresh list
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
    if (notification.link) {
      navigate(notification.link);
      setShowNotifications(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIconForType = (type) => {
    switch (type) {
      case 'leave_approved': return 'check_circle';
      case 'leave_rejected': return 'cancel';
      case 'task_assigned': return 'assignment';
      case 'announcement': return 'campaign';
      case 'payroll_processed': return 'payments';
      default: return 'notifications';
    }
  };

  const getIconColorForType = (type) => {
    switch (type) {
      case 'leave_approved': return 'text-green-600 bg-green-50';
      case 'leave_rejected': return 'text-red-600 bg-red-50';
      case 'task_assigned': return 'text-[#536164] bg-[#C8D5BB]/20';
      case 'announcement': return 'text-orange-600 bg-orange-50';
      case 'payroll_processed': return 'text-[#3a4446] bg-[#94A293]/20';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <header className="h-auto border-0 bg-transparent z-40 flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))} 
          className="lg:hidden p-2 -ml-2 text-gray-700 hover:bg-white/50 rounded-xl transition-colors flex items-center justify-center"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        {/* 3D Real Digital Clock - Only on Dashboard */}
        {isDashboard && (
          <div className="hidden lg:flex flex-col text-left">
            {/* Clock Body */}
            <div className="relative bg-gradient-to-b from-[#536164] to-[#3a4446] rounded-[40px] px-6 py-4 border border-[#C8D5BB]/30 shadow-[0_10px_30px_rgba(83,97,100,0.5),inset_0_1px_0_rgba(255,255,255,0.1)">
              {/* Top Strip with Button */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-4 bg-gradient-to-b from-[#C8D5BB] to-[#94A293] rounded-[10px] -mt-1 flex items-center justify-center">
                <button 
                  onClick={() => setClockRunning(!clockRunning)} 
                  className="absolute top-1/2 -translate-y-1/2 w-32 h-5 bg-gradient-to-b from-[#536164] to-[#3a4446] rounded-[8px] shadow-lg hover:scale-105 transition-transform cursor-pointer flex items-center justify-center gap-1"
                >
                  {clockRunning ? (
                    <span className="material-symbols-outlined text-[#C8D5BB] text-sm">pause</span>
                  ) : (
                    <span className="material-symbols-outlined text-[#C8D5BB] text-sm">play_arrow</span>
                  )}
                </button>
              </div>
              {/* Display Area */}
              <div className="flex items-center gap-3 bg-[#1e2425]/90 rounded-[25px] px-4 py-3 border border-[#C8D5BB]/30 shadow-inner">
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-end justify-center gap-2">
                    {/* AM/PM Indicator */}
                    <div className="text-[#C8D5BB] font-mono text-xs font-bold opacity-80 self-end mb-1">
                      {time.toLocaleTimeString('en-US', { hour12: true }).slice(-2)}
                    </div>
                    {/* Time (Hours & Minutes) */}
                    <div className="font-mono text-4xl text-[#C8D5BB] font-bold tracking-[0.2em] drop-shadow-[0_0_10px_rgba(148,162,147,0.8)]">
                      {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).slice(0,5)}
                    </div>
                  </div>
                  {/* Date inside clock */}
                  <div className="text-xs text-[#C8D5BB]/70 font-medium text-center">
                    {time.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                {/* Seconds Circle */}
                <div className="w-14 h-14 rounded-full bg-[#1e2425]/90 border border-[#C8D5BB]/30 flex items-center justify-center shadow-inner">
                  <div className="font-mono text-xl text-[#C8D5BB] font-bold drop-shadow-[0_0_6px_rgba(148,162,147,0.7)]">
                    {time.toLocaleTimeString('en-US', { second: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden sm:flex items-center bg-white/80 backdrop-blur-lg px-4 py-2.5 rounded-2xl border border-white/60">
          <span className="material-symbols-outlined text-gray-500 mr-2 text-[20px]">search</span>
        </div>

        {/* Notifications */}
        <div className="bg-white/80 backdrop-blur-lg p-2.5 rounded-2xl border border-white/60">
          <div ref={notificationRef} className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              className="hover:bg-gray-100 rounded-xl p-1.5 text-gray-600 transition-colors relative"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                  <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
                  <button 
                    onClick={fetchNotifications} 
                    className="text-xs font-medium text-green-600 hover:text-green-700"
                  >
                    Refresh
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">notifications_off</span>
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0 ${!notif.read ? 'bg-green-50' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconColorForType(notif.type)}`}>
                            <span className="material-symbols-outlined text-[20px]">{getIconForType(notif.type)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-800">{notif.title}</h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                            <p className="text-[11px] text-gray-400 mt-2">
                              {new Date(notif.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>


      </div>
    </header>
  );
}

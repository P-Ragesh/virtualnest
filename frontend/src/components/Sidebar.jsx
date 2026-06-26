import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    const handleClose = () => setIsOpen(false);
    window.addEventListener('toggle-sidebar', handleToggle);
    window.addEventListener('close-sidebar', handleClose);
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggle);
      window.removeEventListener('close-sidebar', handleClose);
    };
  }, []);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const menuGroups = [
    {
      title: 'MAIN',
      links: [
        { to: '/', label: 'Dashboard', icon: 'dashboard' },
        { to: '/employees', label: 'Employees', icon: 'group', roles: ['admin', 'hr'] },
        { 
          to: (user?.role === 'admin' || user?.role === 'hr') ? '/tasks/manage' : '/my-tasks', 
          label: 'Tasks', 
          icon: 'task_alt' 
        },
        { to: '/leave', label: 'Leave', icon: 'inventory' },
        { to: '/attendance', label: 'Attendance', icon: 'calendar_month' },
        { to: '/payroll', label: 'Finance', icon: 'account_balance' },
      ]
    },
    {
      title: 'OTHERS',
      links: [
        { to: '/my-profile', label: 'Profile', icon: 'person', roles: ['employee'] },
        { to: '/reports', label: 'Reports', icon: 'assessment', roles: ['admin', 'hr'] }
      ]
    }
  ];

  const filteredGroups = menuGroups
    .filter(group => {
      if (!group.roles) return true;
      return group.roles.includes(user?.role || 'employee');
    })
    .map(group => ({
      ...group,
      links: group.links.filter(link => {
        if (!link.roles) return true;
        return link.roles.includes(user?.role || 'employee');
      })
    }));

  return (
    <>
      <aside className={`fixed left-0 top-0 h-full w-[280px] bg-white/90 border-r border-white/50 flex flex-col p-6 gap-6 z-50 transition-transform duration-300 backdrop-blur-lg translate-x-0`}>
        {/* Close Button for Mobile */}
        <button 
          onClick={() => setIsOpen(false)} 
          className="lg:hidden p-2 text-zinc-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors absolute top-4 right-4"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-4 px-1 mb-2">
          <div style={{ 
                  background: 'linear-gradient(to top, #536164, #94A293, #C8D5BB)' 
                }} className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <span className="material-symbols-outlined text-[28px]">eco</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight leading-tight">VirtualNest</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mt-0.5">HR Management</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-gray-200 text-sm rounded-xl outline-none focus:border-green-400 placeholder:text-gray-400 transition-colors"
          />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-6 overflow-y-auto no-scrollbar pr-1">
          {filteredGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <span className="block px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{group.title}</span>
              {group.links.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  onClick={link.to !== '#' ? handleLinkClick : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 active:scale-[0.98] select-none ${
                      isActive && link.to !== '#'
                        ? 'text-white shadow-md font-semibold'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 font-medium'
                    }`
                  }
                  style={({ isActive }) => isActive && link.to !== '#' ? { 
                    background: 'linear-gradient(to top, #536164, #94A293, #C8D5BB)' 
                  } : {}}
                >
                  {({ isActive }) => (
                    <>
                      <span className={`material-symbols-outlined text-[22px] ${isActive && link.to !== '#' ? 'text-white' : 'text-gray-500'}`} data-icon={link.icon}>{link.icon}</span>
                      <span>{link.label}</span>
                      {isActive && link.to !== '#' && <span className="ml-auto material-symbols-outlined text-[16px]">chevron_right</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer Area */}
        <div className="mt-auto pt-4 border-t border-gray-200 flex flex-col gap-2">
          <NavLink
            to="/my-profile"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-2 mb-2 rounded-xl p-2 transition-colors cursor-pointer active:scale-[0.98] select-none hover:bg-gray-100"
          >
            <div style={{ 
              background: 'linear-gradient(to top, #536164, #94A293, #C8D5BB)' 
            }} className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white uppercase shrink-0 shadow-sm text-sm">
              {user?.username?.substring(0, 2) || 'AD'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate tracking-tight">{user?.username || 'Admin'}</p>
              <p className="text-[11px] text-gray-500 truncate capitalize">{user?.role || 'administrator'}</p>
            </div>
            <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
          </NavLink>
          {/* Logout Button */}
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[22px]">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

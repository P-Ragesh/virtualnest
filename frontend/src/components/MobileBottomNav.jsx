import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const currentPath = location.pathname;

  const tabs = user?.role === 'employee'
    ? [
        { path: '/',           label: 'Home',       icon: 'home'          },
        { path: '/my-tasks',   label: 'Tasks',      icon: 'task_alt'      },
        { path: '/attendance', label: 'Attendance', icon: 'fingerprint'   },
        { path: '/leave',      label: 'Leave',      icon: 'event_busy'    },
        { path: '/my-profile', label: 'Profile',    icon: 'person'        },
      ]
    : [
        { path: '/',           label: 'Home',        icon: 'home'          },
        { path: '/tasks/manage', label: 'Tasks',     icon: 'task_alt'      },
        { path: '/employees',  label: 'Employees',   icon: 'group'         },
        { path: '/leave',      label: 'Leave',       icon: 'event_busy'    },
      ];

  const isActive = (path) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center z-50 shadow-[0_-8px_24px_rgba(0,0,0,0.03)] lg:hidden">
      <div className="w-full max-w-md mx-auto flex justify-between items-center">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return active ? (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex items-center gap-2 px-5 py-3 bg-black text-white rounded-full transition-all duration-300 transform scale-105 shadow-md"
            >
              <span className="material-symbols-outlined text-[20px] font-light">{tab.icon}</span>
              <span className="text-xs font-bold tracking-tight">{tab.label}</span>
            </button>
          ) : (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 text-slate-400 hover:text-slate-600 transition-all duration-200 hover:bg-slate-200/80 active:scale-95"
            >
              <span className="material-symbols-outlined text-[22px] font-light">{tab.icon}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

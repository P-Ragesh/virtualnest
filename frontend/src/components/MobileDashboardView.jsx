import React from 'react';
import { useNavigate } from 'react-router-dom';

const PRIORITY_COLORS = {
  high:   { bg: 'bg-red-50',    text: 'text-red-600',    bar: 'bg-red-500'    },
  medium: { bg: 'bg-amber-50',  text: 'text-amber-600',  bar: 'bg-amber-400'  },
  low:    { bg: 'bg-green-50',  text: 'text-green-600',  bar: 'bg-green-500'  },
};

const STATUS_COLORS = {
  pending:     { bg: 'bg-slate-100', text: 'text-slate-500' },
  'in-progress': { bg: 'bg-[#C8D5BB]/20', text: 'text-primary' },
  completed:   { bg: 'bg-green-50', text: 'text-green-600' },
};

function formatTime(timeStr) {
  if (!timeStr) return '--:-- --';
  try {
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:-- --';
  }
}

function formatCurrency(amount) {
  if (!amount && amount !== 0) return '₹0';
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

function getInitials(str) {
  if (!str) return '??';
  const parts = str.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : str.substring(0, 2).toUpperCase();
}

export default function MobileDashboardView({
  user,
  stats,
  checkedInToday,
  checkedOutToday,
  checking,
  lastCheckInTime,
  lastCheckOutTime,
  handleSelfCheckIn,
  handleSelfCheckOut,
  message,
  tasks = [],
  announcements = [],
  employees = [],
  personalBalances,
}) {
  const navigate = useNavigate();

  // ── Stats values ────────────────────────────────────────────────
  const totalEmployees   = stats?.totalEmployees   ?? 0;
  const todayAttendance  = stats?.todayAttendance  ?? 0;
  const employeesOnLeave = stats?.employeesOnLeave ?? 0;
  const pendingTasks     = stats?.pendingTasks     ?? 0;
  const totalPaidPayroll = stats?.totalPaidPayroll ?? 0;
  const absentToday      = stats?.absentToday      ?? 0;

  // ── Leave balances ───────────────────────────────────────────────
  const sickRem   = personalBalances?.sick?.remaining   ?? '–';
  const casualRem = personalBalances?.casual?.remaining ?? '–';

  // ── Today's tasks (first 3) ──────────────────────────────────────
  const todayTasks = tasks.slice(0, 3);

  // ── Announcements (first 2) ──────────────────────────────────────
  const recentAnnouncements = announcements.slice(0, 2);

  // ── Attendance status label ──────────────────────────────────────
  const checkInStatus = checkedInToday
    ? (lastCheckInTime
        ? (new Date(lastCheckInTime).getHours() >= 10 ? 'Late' : 'On Time')
        : 'On Time')
    : 'Not Checked In';

  const checkInStatusStyle = checkInStatus === 'On Time'
    ? 'text-green-700 bg-green-50'
    : checkInStatus === 'Late'
    ? 'text-amber-700 bg-amber-50'
    : 'text-slate-500 bg-slate-100';

  return (
    <div className="bg-white min-h-screen px-5 pt-6 pb-28 font-sans">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-800 text-lg uppercase shadow-sm">
            {user?.photo
              ? <img src={user.photo} alt={user.username} className="w-full h-full object-cover" />
              : getInitials(user?.username || 'EM')
            }
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight">Welcome back !</p>
            <h2 className="text-base font-bold text-slate-900 leading-tight">{user?.username || 'Employee'}</h2>
          </div>
        </div>
        <button
          onClick={() => navigate('/announcements')}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors shadow-sm relative"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-[20px] font-light">notifications</span>
          {recentAnnouncements.length > 0 && (
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </div>

      {/* ── Flash Message ───────────────────────────────────────── */}
      {message && (
        <div className="mb-4 p-3 bg-[#C8D5BB]/20 border border-[#94A293] rounded-xl text-[#536164] text-xs font-semibold text-center">
          {message}
        </div>
      )}

      {/* ── KPI Cards 2×2 ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-6">

        {/* Card 1 – Leave & Attendance */}
        <div className="bg-surface-container p-4 rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.01)] border border-outline-variant flex flex-col justify-between h-[125px]">
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-semibold text-on-surface leading-tight">Leave<br />&amp; Attendance</span>
            <div className="w-8 h-8 rounded-full bg-[#C8D5BB]/30 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">event_available</span>
            </div>
          </div>
          <div className="flex justify-between items-end mt-2">
            <span className="text-[20px] font-extrabold text-on-surface leading-none">{todayAttendance}</span>
            <span className="flex items-center gap-0.5 text-[9px] font-bold text-primary bg-[#C8D5BB]/20 px-1.5 py-0.5 rounded-md">
              Present today
            </span>
          </div>
        </div>

        {/* Card 2 – Employee Report */}
        <div className="bg-[#536164] p-4 rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col justify-between h-[125px] text-white">
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-semibold leading-tight">Employee<br />Report</span>
            <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
          </div>
          <div className="flex justify-between items-end mt-2">
            <span className="text-[20px] font-extrabold leading-none">{totalEmployees}</span>
            <span className="flex items-center gap-0.5 text-[9px] font-bold text-[#C8D5BB] bg-white/10 px-1.5 py-0.5 rounded-md">
              Total staff
            </span>
          </div>
        </div>

        {/* Card 3 – Salary Management */}
        <div className="bg-gradient-to-r from-[#94A293] to-[#C8D5BB] p-4 rounded-[20px] shadow-[0_8px_16px_rgba(148,162,147,0.12)] flex flex-col justify-between h-[125px] text-white">
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-semibold leading-tight">Salary<br />Management</span>
            <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div className="flex justify-between items-end mt-2">
            <span className="text-[18px] font-extrabold leading-none">{formatCurrency(totalPaidPayroll)}</span>
            <span className="flex items-center gap-0.5 text-[9px] font-bold text-[#C8D5BB] bg-white/20 px-1.5 py-0.5 rounded-md">
              Paid out
            </span>
          </div>
        </div>

        {/* Card 4 – On Leave / Tasks */}
        <div className="bg-[#C8D5BB]/10 p-4 rounded-[20px] shadow-[0_4px_12px_rgba(200,213,187,0.02)] border border-[#94A293]/30 flex flex-col justify-between h-[125px]">
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-semibold text-[#536164] leading-tight">On Leave<br />&amp; Tasks</span>
            <div className="w-8 h-8 rounded-full bg-[#C8D5BB]/30 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">beach_access</span>
            </div>
          </div>
          <div className="flex justify-between items-end mt-2">
            <div>
              <span className="text-[20px] font-extrabold text-[#536164] leading-none">{employeesOnLeave}</span>
              <span className="block text-[9px] text-primary font-semibold mt-0.5">on leave</span>
            </div>
            <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md">
              {pendingTasks} tasks pending
            </span>
          </div>
        </div>
      </div>

      {/* ── Today's Tasks ───────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">Today's Tasks</h3>
          <button
            onClick={() => navigate('/my-tasks')}
            className="text-[11px] font-bold text-[#536164] hover:underline"
          >
            View all
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="bg-slate-50 rounded-[20px] p-6 border border-slate-100 text-center">
            <span className="material-symbols-outlined text-slate-300 text-[32px]">task_alt</span>
            <p className="text-xs text-slate-400 mt-2 font-medium">No tasks assigned for today</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayTasks.map((task, idx) => {
              const priority = (task.priority || 'low').toLowerCase();
              const status   = (task.status   || 'pending').toLowerCase();
              const pc       = PRIORITY_COLORS[priority] || PRIORITY_COLORS.low;
              const sc       = STATUS_COLORS[status]     || STATUS_COLORS.pending;
              const progress = status === 'completed' ? 100 : status === 'in-progress' ? 55 : 0;
              return (
                <div
                  key={task.id || idx}
                  className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center overflow-hidden h-[54px]"
                >
                  <div className={`w-1.5 h-full ${pc.bar}`} />
                  <div className="px-3 py-2 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-bold text-slate-800 truncate flex-1">{task.title}</p>
                      <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${pc.bg} ${pc.text}`}>
                        {priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pc.bar}`} style={{ width: `${progress}%` }} />
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                        {status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── My Attendance (Today) ───────────────────────────────── */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-800 mb-3 tracking-tight">My Attendance (Today)</h3>
        <div className="space-y-3">

          {/* Check In Row */}
          <div className="bg-surface-container border border-outline-variant/60 rounded-[20px] p-3 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-on-surface-variant font-semibold tracking-tight uppercase">Check In</p>
              <h4 className="text-[16px] font-extrabold text-primary mt-0.5">
                {checkedInToday ? formatTime(lastCheckInTime) : '--:-- --'}
              </h4>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${checkInStatusStyle}`}>
                {checkInStatus}
              </span>
              <button
                disabled={checkedInToday || checking}
                onClick={handleSelfCheckIn}
                className={`text-[11px] font-bold px-4 py-2.5 rounded-xl transition-all ${
                  checkedInToday
                    ? 'bg-primary text-white cursor-default opacity-90'
                    : checking
                    ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'
                    : 'bg-[#C8D5BB]/30 text-primary hover:bg-[#C8D5BB]/50 active:scale-95'
                }`}
              >
                {checking && !checkedInToday ? '…' : checkedInToday ? 'Checked In' : 'Check In'}
              </button>
            </div>
          </div>

          {/* Check Out Row */}
          <div className="bg-slate-50 border border-slate-100/60 rounded-[20px] p-3 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-tight uppercase">Check Out</p>
              <h4 className="text-[16px] font-extrabold text-slate-800 mt-0.5">
                {checkedOutToday ? formatTime(lastCheckOutTime) : '--:-- --'}
              </h4>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                checkedOutToday ? 'text-green-700 bg-green-50' : 'text-slate-500 bg-slate-200/50'
              }`}>
                {checkedOutToday ? 'Checked Out' : 'Not Checked Out'}
              </span>
              <button
                disabled={!checkedInToday || checkedOutToday || checking}
                onClick={handleSelfCheckOut}
                className={`text-[11px] font-bold px-4 py-2.5 rounded-xl transition-all ${
                  checkedOutToday
                    ? 'bg-black text-white cursor-default opacity-90'
                    : checkedInToday
                    ? 'bg-black text-white hover:bg-neutral-800 active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {checking && !checkedOutToday && checkedInToday ? '…' : checkedOutToday ? 'Checked Out' : 'Check Out'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Attendance Summary Strip ────────────────────────────── */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-800 mb-3 tracking-tight">Quick Summary</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#C8D5BB]/20 border border-[#94A293] rounded-[16px] p-3 text-center">
            <p className="text-[9px] font-bold text-primary uppercase tracking-wider mb-1">Present</p>
            <p className="text-lg font-black text-[#536164] leading-none">{todayAttendance}</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-[16px] p-3 text-center">
            <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mb-1">On Leave</p>
            <p className="text-lg font-black text-amber-700 leading-none">{employeesOnLeave}</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-[16px] p-3 text-center">
            <p className="text-[9px] font-bold text-red-500 uppercase tracking-wider mb-1">Absent</p>
            <p className="text-lg font-black text-red-600 leading-none">{absentToday}</p>
          </div>
        </div>
      </div>

      {/* ── Leave Balances ──────────────────────────────────────── */}
      {personalBalances && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">My Leave Balance</h3>
            {user?.role === 'employee' && (
              <button onClick={() => navigate('/leave')} className="text-[11px] font-bold text-primary hover:underline">
                Apply Leave
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Sick Leave',   remaining: personalBalances.sick?.remaining,   limit: personalBalances.sick?.limit,   icon: 'medical_services', color: 'text-red-500 bg-red-50 border-red-100' },
              { label: 'Casual Leave', remaining: personalBalances.casual?.remaining, limit: personalBalances.casual?.limit, icon: 'weekend',           color: 'text-primary bg-[#C8D5BB]/20 border-[#94A293]' },
              { label: 'Earned Leave', remaining: personalBalances.earned?.remaining, limit: personalBalances.earned?.limit, icon: 'star',              color: 'text-amber-500 bg-amber-50 border-amber-100' },
            ].map(({ label, remaining, limit, icon, color }) => (
              <div key={label} className={`border rounded-[16px] p-3 flex items-center gap-3 ${color.split(' ').slice(1).join(' ')}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${color.split(' ')[1]} ${color.split(' ')[2]}`}>
                  <span className={`material-symbols-outlined text-[16px] ${color.split(' ')[0]}`}>{icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">{label}</p>
                  <p className="text-sm font-black text-slate-800 leading-tight">
                    {remaining ?? '–'}<span className="text-[10px] font-semibold text-slate-400"> / {limit ?? '–'}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Announcements ───────────────────────────────────────── */}
      {recentAnnouncements.length > 0 && (
        <div className="mb-2">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-on-surface tracking-tight">Announcements</h3>
            <button onClick={() => navigate('/announcements')} className="text-[11px] font-bold text-primary hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-2.5">
            {recentAnnouncements.map((ann, idx) => (
              <div key={idx} className="bg-[#C8D5BB]/10 border border-[#94A293] rounded-[16px] p-3 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#C8D5BB]/30 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[14px]">
                    {ann.type === 'holiday' ? 'festival' : 'campaign'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-on-surface leading-tight truncate">{ann.title}</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5 line-clamp-2">{ann.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

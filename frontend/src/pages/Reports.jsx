import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import { gsap } from 'gsap';
import MobileBottomNav from '../components/MobileBottomNav';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

export default function Reports() {
  const [deptStats, setDeptStats] = useState([]);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [leaveStats, setLeaveStats] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const { data: dept } = await api.get('/reports/departments');
      setDeptStats(dept);

      const { data: pay } = await api.get('/reports/payroll-history');
      setPayrollHistory(pay);

      const { data: leaves } = await api.get('/reports/leaves');
      setLeaveStats(leaves);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  useEffect(() => {
    if (!loading && (deptStats.length > 0 || payrollHistory.length > 0 || leaveStats.length > 0)) {
      gsap.fromTo('.report-card', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, [loading, deptStats, payrollHistory, leaveStats]);

  const getMonthName = (m) => {
    const dates = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return dates[m - 1] || 'Month';
  };

  const exportDepartment = () => {
    const data = deptStats.map(d => ({
      Department: d.department,
      Headcount: d._count.id
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Headcount");
    XLSX.writeFile(workbook, "headcount_by_department.xlsx");
  };

  const exportPayrollHistory = () => {
    const data = payrollHistory.map(p => ({
      Period: `${getMonthName(p.month)} ${p.year}`,
      "Total Paid (INR)": p._sum.netSalary,
      "Total Payslips Generated": p._count.id
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");
    XLSX.writeFile(workbook, "payroll_history_report.xlsx");
  };

  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [reportTab, setReportTab] = useState('Today');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderMobileReports = () => {
    const mockEmployees = [
      { name: 'Bessie Cooper', time: '09:00 AM - 06:00 PM', status: 'On Time', badgeColor: 'bg-green-50 text-green-700 border border-green-100' },
      { name: 'Annette Black', time: '09:15 AM - 06:15 PM', status: 'Late', badgeColor: 'bg-[#C8D5BB]/20 text-[#536164] border border-[#94A293]/30' },
      { name: 'Darrell Steward', time: '09:00 AM - 02:00 PM', status: 'Half Day', badgeColor: 'bg-slate-200/50 text-slate-500' }
    ];

    const filteredEmployees = mockEmployees.filter(emp => 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="bg-white min-h-screen px-5 pt-6 pb-28 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100/60 flex items-center justify-center text-slate-705 hover:bg-slate-100 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px] font-light">arrow_back</span>
          </button>
          <h2 className="text-sm font-extrabold text-slate-800">Employee Report</h2>
          <div className="w-10"></div>
        </div>

        {/* Period tabs */}
        <div className="bg-slate-100/60 p-1 rounded-full flex justify-between items-center mb-6">
          {['Today', 'This week', 'This Month'].map(tab => (
            <button
              key={tab}
              onClick={() => setReportTab(tab)}
              className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all ${
                reportTab === tab 
                  ? 'bg-black text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-650'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stacked Bar Chart */}
        <div className="bg-[#F8FAFC] border border-slate-100/60 rounded-[24px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.01)] mb-6">
          {/* Chart columns */}
          <div className="flex justify-between items-end h-40 px-2 mb-4">
            {[
              { label: 'M', absent: 15, ontime: 60, late: 25 },
              { label: 'T', absent: 8, ontime: 80, late: 12 },
              { label: 'W', absent: 35, ontime: 45, late: 20 },
              { label: 'T', absent: 12, ontime: 68, late: 20 },
              { label: 'F', absent: 20, ontime: 55, late: 25 },
              { label: 'S', absent: 10, ontime: 75, late: 15 },
              { label: 'S', absent: 25, ontime: 50, late: 25 }
            ].map((day, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div className="w-2.5 h-32 bg-slate-200/50 rounded-full flex flex-col justify-end overflow-hidden">
                  <div className="bg-[#C8D5BB] w-full" style={{ height: `${day.late}%` }}></div>
                  <div className="bg-[#536164] w-full" style={{ height: `${day.ontime}%` }}></div>
                  <div className="bg-black w-full" style={{ height: `${day.absent}%` }}></div>
                </div>
                <span className="text-[10px] font-bold text-slate-450 mt-2">{day.label}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-4 border-t border-slate-200/40 pt-4 text-[9px] font-bold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              Absent (7)
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-[#536164]"></span>
              Ontime (80)
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8D5BB]"></span>
              Late (10)
            </span>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-850 mb-3 tracking-tight">Attendance Summary</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col">
              <span className="text-slate-400 text-[9px] font-bold tracking-tight uppercase">Absent</span>
              <span className="text-slate-850 text-[18px] font-black mt-2">07</span>
            </div>

            <div className="bg-[#f0f7ed] border border-[#C8D5BB]/30 rounded-2xl p-3 flex flex-col">
              <span className="text-[#536164] text-[9px] font-bold tracking-tight uppercase">On Time</span>
              <span className="text-[#3a4446] text-[18px] font-black mt-2">80</span>
            </div>

            <div className="bg-[#f0f7ed] border border-[#C8D5BB]/30 rounded-2xl p-3 flex flex-col">
              <span className="text-[#94A293] text-[9px] font-bold tracking-tight uppercase">Late</span>
              <span className="text-[#536164] text-[18px] font-black mt-2">10</span>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Employee List</h3>
          
          {/* Search bar */}
          <div className="relative mb-4 flex gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100/60 focus:border-[#2563EB] text-xs font-semibold text-slate-800 placeholder-slate-400 rounded-xl outline-none transition-colors"
              />
            </div>
            <button className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100/60 flex items-center justify-center text-slate-650">
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>

          {/* List items */}
          <div className="space-y-3">
            {filteredEmployees.map((emp, index) => (
              <div key={index} className="bg-slate-50 border border-slate-100/60 rounded-[20px] p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-700 text-sm uppercase border border-slate-100 shadow-sm">
                    {emp.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{emp.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{emp.time}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full ${emp.badgeColor}`}>
                  {emp.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-white">
        {renderMobileReports()}
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-sans">
      <Sidebar />
      <main className="lg:ml-[280px] ml-0 min-h-screen relative">
        <Topbar />
        
        <div className="p-container-margin-mobile lg:p-container-margin-desktop max-w-[1600px] mx-auto pb-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-headline-lg font-headline-lg text-primary tracking-tight">Analytics & Reports</h2>
              <p className="text-body-md text-on-surface-variant">Audit department headcount ratios, monthly salary histories, and leave indexes.</p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-on-surface-variant flex flex-col items-center">
               <span className="material-symbols-outlined animate-spin text-[32px] text-secondary mb-4">refresh</span>
               <p>Aggregating visual summaries...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Department Headcount Bar Progress Chart */}
              <div className="report-card bg-white border border-outline-variant rounded-xl card-shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">groups</span>
                    <span>Headcount by Department</span>
                  </h4>
                  <button
                      onClick={exportDepartment}
                      className="flex items-center gap-1.5 text-label-sm font-bold text-on-surface-variant hover:text-primary bg-surface border border-outline-variant px-3 py-2 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">table_chart</span>
                      <span>Export Excel</span>
                    </button>
                </div>

                {deptStats.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant text-body-md">No active department datasets found.</div>
                ) : (
                  <div className="space-y-6">
                    {deptStats.map(d => {
                      const totalHead = deptStats.reduce((acc, curr) => acc + curr._count.id, 0);
                      const pct = ((d._count.id / totalHead) * 100).toFixed(0);
                      return (
                        <div key={d.department} className="space-y-2 group">
                          <div className="flex justify-between text-body-md font-bold text-on-surface-variant group-hover:text-primary transition-colors">
                            <span>{d.department}</span>
                            <span>{d._count.id} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden">
                            <div 
                              className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" 
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Monthly payroll reports chart lists */}
              <div className="report-card bg-white border border-outline-variant rounded-xl card-shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">trending_up</span>
                    <span>Monthly Payroll History</span>
                  </h4>
                  <button
                      onClick={exportPayrollHistory}
                      className="flex items-center gap-1.5 text-label-sm font-bold text-on-surface-variant hover:text-primary bg-surface border border-outline-variant px-3 py-2 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">table_chart</span>
                      <span>Export Excel</span>
                    </button>
                </div>

                {payrollHistory.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant text-body-md">No disbursement history recorded.</div>
                ) : (
                  <div className="space-y-4">
                    {payrollHistory.map(p => (
                      <div key={`${p.year}-${p.month}`} className="flex items-center justify-between p-4 bg-surface border border-outline-variant rounded-xl hover:border-primary transition-colors cursor-default">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-surface-container rounded-lg">
                            <span className="material-symbols-outlined text-primary">calendar_month</span>
                          </div>
                          <div>
                            <span className="block font-bold text-body-lg text-on-surface">{getMonthName(p.month)} {p.year}</span>
                            <span className="text-body-sm text-on-surface-variant">{p._count.id} Payslips processed</span>
                          </div>
                        </div>
                        <span className="font-headline-sm font-extrabold text-primary">₹{p._sum.netSalary.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Leave Type Indexes */}
              <div className="report-card bg-white border border-outline-variant rounded-xl card-shadow p-6 lg:col-span-2">
                <h4 className="text-headline-sm font-bold text-on-surface flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-secondary">pie_chart</span>
                  <span>Leave Utilization Ledger Counts</span>
                </h4>

                {leaveStats.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant text-body-md">No leave records parsed.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {leaveStats.map((l, idx) => (
                      <div key={idx} className="bg-surface border border-outline-variant p-6 rounded-xl hover:shadow-md transition-shadow">
                        <span className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider block capitalize">{l.leaveType} — {l.status}</span>
                        <h5 className="text-display-sm font-extrabold text-primary mt-3">{l._count.id} <span className="text-headline-sm font-bold text-on-surface-variant">Logs</span></h5>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

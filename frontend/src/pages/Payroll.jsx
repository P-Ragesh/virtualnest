import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import CustomSelect from '../components/CustomSelect';
import api from '../utils/api';
import { jsPDF } from 'jspdf';
import { gsap } from 'gsap';
import { useAuth } from '../hooks/useAuth';

export default function Payroll() {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errMessage, setErrMessage] = useState('');
  const [employeeId, setEmployeeId] = useState(null);

  // Fetch current employee's ID from /employees
  useEffect(() => {
    const fetchEmployeeId = async () => {
      try {
        const { data } = await api.get('/employees');
        const currentEmployee = data.find(emp => emp.email === user?.email);
        if (currentEmployee) {
          setEmployeeId(currentEmployee.id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.email) {
      fetchEmployeeId();
    }
  }, [user]);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const params = { month, year };
      if (user?.role === 'employee' && employeeId) {
        params.employeeId = employeeId;
      }
      const { data } = await api.get('/payroll', { params });
      setPayrolls(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'employee' || (user?.role === 'employee' && employeeId)) {
      fetchPayrolls();
    }
  }, [month, year, employeeId, user?.role]);

  useEffect(() => {
    if (!loading && payrolls.length > 0) {
      gsap.fromTo('.payroll-row', 
        { y: 10, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.03, ease: 'power2.out' }
      );
    }
  }, [loading, payrolls]);

  const handleGeneratePayroll = async () => {
    setLoading(true);
    setMessage('');
    setErrMessage('');
    try {
      const { data } = await api.post('/payroll/generate', { month, year });
      setMessage(data.message);
      fetchPayrolls();
    } catch (err) {
      setErrMessage(err.response?.data?.error || 'Failed to generate payroll');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/payroll/${id}`, { status });
      fetchPayrolls();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update payroll status');
    }
  };

  const handleDeletePayroll = async (id) => {
    if (window.confirm('Delete this payslip permanently?')) {
      try {
        await api.delete(`/payroll/${id}`);
        fetchPayrolls();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete payroll');
      }
    }
  };

  const getMonthName = (m) => {
    const dates = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return dates[m - 1] || 'Month';
  };

  const exportPayslipPDF = (p) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const primaryColor = [2, 102, 255]; // New MD3 primary color
    const secondaryColor = [25, 28, 30]; // New MD3 on-surface color

    // Header company letterhead
    doc.setFillColor(...secondaryColor);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('HRMS ENTERPRISE', 15, 20);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text('Modern Business System Hub • Windows Client v2.0', 15, 27);
    doc.text('Local Host Server Endpoint • 127.0.0.1:3001', 15, 33);

    // Document Title Box
    doc.setFillColor(248, 249, 251);
    doc.rect(15, 55, 180, 15, 'F');
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text(`SALARY PAYSLIP — ${getMonthName(p.month).toUpperCase()} ${p.year}`, 20, 64);

    // Employee details panel
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(10);
    doc.text('Employee Information', 15, 85);
    doc.line(15, 87, 195, 87);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Employee Name: ${p.employee.firstName} ${p.employee.lastName}`, 15, 95);
    doc.text(`Employee ID: ${p.employee.empId}`, 15, 102);
    doc.text(`Department: ${p.employee.department}`, 15, 109);
    doc.text(`Designation: ${p.employee.designation}`, 15, 116);
    doc.text(`Email Address: ${p.employee.email}`, 110, 95);
    doc.text(`Shift Status: Active Staff`, 110, 102);
    doc.text(`Payment Status: ${p.status.toUpperCase()}`, 110, 109);
    if (p.paidAt) {
      doc.text(`Paid Date: ${new Date(p.paidAt).toLocaleDateString()}`, 110, 116);
    }

    // Salary breakdown
    doc.setFont('Helvetica', 'bold');
    doc.text('Earnings & Allowance breakdown', 15, 135);
    doc.line(15, 137, 100, 137);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Basic Salary:`, 15, 145);
    doc.text(`₹${p.basicSalary.toLocaleString('en-IN')}`, 75, 145, { align: 'right' });
    doc.text(`HRA Allowance:`, 15, 152);
    doc.text(`₹${p.hra.toLocaleString('en-IN')}`, 75, 152, { align: 'right' });
    doc.text(`Other Allowances:`, 15, 159);
    doc.text(`₹${p.allowances.toLocaleString('en-IN')}`, 75, 159, { align: 'right' });

    // Deductions panel
    doc.setFont('Helvetica', 'bold');
    doc.text('Deductions', 110, 135);
    doc.line(110, 137, 195, 137);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Leave/Unpaid Deductions:`, 110, 145);
    doc.text(`₹${p.deductions.toLocaleString('en-IN')}`, 190, 145, { align: 'right' });

    // Grand totals box
    doc.setFillColor(248, 249, 251);
    doc.rect(15, 175, 180, 20, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('NET TAKE-HOME SALARY:', 20, 187);
    doc.setTextColor(...primaryColor);
    doc.text(`INR ₹${p.netSalary.toLocaleString('en-IN')}`, 190, 187, { align: 'right' });

    // Signature/Footers
    doc.setTextColor(118, 119, 123);
    doc.setFontSize(8);
    doc.setFont('Helvetica', 'italic');
    doc.text('This is a computer-generated payslip created by HRMS Enterprise.', 15, 260);
    doc.text('No signature required.', 15, 264);

    doc.save(`Payslip_${p.employee.empId}_${getMonthName(p.month)}_${p.year}.pdf`);
  };

  return (
    <div className="min-h-screen bg-surface font-sans">
      <Sidebar />
      <main className="lg:ml-[280px] ml-0 min-h-screen relative">
        <Topbar />
        
        <div className="p-container-margin-mobile lg:p-container-margin-desktop max-w-[1600px] mx-auto pb-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-headline-lg font-headline-lg text-primary tracking-tight">{user?.role === 'employee' ? 'My Salary' : 'Payroll Management'}</h2>
              <p className="text-body-md text-on-surface-variant">{user?.role === 'employee' ? 'View your monthly payslips and salary details.' : 'Generate monthly payslips and dispatch staff salary approvals.'}</p>
            </div>

          </div>

          {/* Month/Year selector & Action panel */}
          <div className="bg-white rounded-xl card-shadow border border-outline-variant p-6 mb-stack-lg relative">

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
                <div>
                   <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Payroll Month</label>
                  <CustomSelect
                    value={month}
                    onChange={(val) => setMonth(parseInt(val))}
                    options={[1,2,3,4,5,6,7,8,9,10,11,12].map(m => ({ value: m, label: getMonthName(m) }))}
                    className="w-48"
                  />
                </div>

                <div>
                  <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Payroll Year</label>
                  <CustomSelect
                    value={year}
                    onChange={(val) => setYear(parseInt(val))}
                    options={[2024, 2025, 2026, 2027, 2028].map(y => ({ value: y, label: String(y) }))}
                    className="w-32"
                  />
                </div>
              </div>


              {user?.role !== 'employee' && (
                <div className="w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
                  <button
                    disabled={loading}
                    onClick={handleGeneratePayroll}
                    className="w-full flex items-center justify-center space-x-2 bg-secondary hover:bg-opacity-90 text-on-secondary font-bold px-6 py-3 rounded-lg transition-all shadow-md"
                  >
                    <span className="material-symbols-outlined text-[20px]" data-icon="calculate">calculate</span>
                    <span>Generate Monthly Payslips</span>
                  </button>
                </div>
              )}
            </div>


            {/* Notification triggers */}
            {message && (
              <div className="relative z-10 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-body-md flex items-center space-x-3">
                <span className="material-symbols-outlined">check_circle</span>
                <span>{message}</span>
              </div>
            )}
            {errMessage && (
              <div className="relative z-10 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-body-md flex items-center space-x-3">
                <span className="material-symbols-outlined">error</span>
                <span>{errMessage}</span>
              </div>
            )}
          </div>

          {/* Payslip list table */}
          <div className="bg-white rounded-xl card-shadow border border-outline-variant overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h4 className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">request_quote</span>
                <span>{user?.role === 'employee' ? 'My Payslips' : `Payslips for ${getMonthName(month)} ${year}`}</span>
              </h4>
              <span className="text-label-md text-on-surface-variant font-bold bg-surface-container-highest px-3 py-1 rounded-full">{payrolls.length} Records</span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-on-surface-variant flex flex-col items-center">
                 <span className="material-symbols-outlined animate-spin text-[32px] text-secondary mb-4">refresh</span>
                 <p>Processing payroll data...</p>
              </div>
            ) : payrolls.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant">
                 <span className="material-symbols-outlined text-[48px] text-outline mb-4">account_balance_wallet</span>
                 <p>No salaries generated for this month. Run "Generate Monthly Payslips" above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface">
                    <tr>
                      <th className="px-6 py-4 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-4 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Basic/HRA</th>
                      <th className="px-6 py-4 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Allowances/Deductions</th>
                      <th className="px-6 py-4 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Net Salary</th>
                      <th className="px-6 py-4 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {payrolls.map(p => (
                      <tr key={p.id} className="payroll-row hover:bg-surface-container transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold">
                              {p.employee.firstName[0]}
                            </div>
                            <div>
                              <p className="font-bold text-body-md text-on-surface">{p.employee.firstName} {p.employee.lastName}</p>
                              <p className="text-label-sm text-on-surface-variant">ID: {p.employee.empId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="block text-body-md font-bold text-on-surface">Basic: ₹{p.basicSalary.toLocaleString('en-IN')}</span>
                          <span className="text-label-sm text-on-surface-variant">HRA: ₹{p.hra.toLocaleString('en-IN')}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="block text-body-md font-bold text-on-surface">Allow: ₹{p.allowances.toLocaleString('en-IN')}</span>
                          <span className="text-label-sm text-error">Deduct: ₹{p.deductions.toLocaleString('en-IN')}</span>
                        </td>
                        <td className="px-6 py-4 font-headline-sm font-bold text-primary">
                          ₹{p.netSalary.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : p.status === 'approved'
                              ? 'bg-[#C8D5BB]/30 text-[#536164]'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => exportPayslipPDF(p)}
                            className="p-2 bg-surface hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface rounded-lg transition-colors border border-outline-variant inline-flex items-center"
                            title="Export PDF"
                          >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                          </button>
                          
                          {user?.role !== 'employee' && (
                            <>
                              {p.status === 'pending' && (
                                <button
                                  onClick={() => handleStatusChange(p.id, 'approved')}
                                  className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all text-label-md font-bold"
                                >
                                  Approve
                                </button>
                              )}

                              {p.status === 'approved' && (
                                <button
                                  onClick={() => handleStatusChange(p.id, 'paid')}
                                  className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-all text-label-md font-bold inline-flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[16px]">credit_card</span>
                                  <span>Disburse</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleDeletePayroll(p.id)}
                                className="p-2 hover:bg-error/10 text-on-surface-variant hover:text-error rounded-lg transition-colors inline-flex items-center"
                                title="Delete"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

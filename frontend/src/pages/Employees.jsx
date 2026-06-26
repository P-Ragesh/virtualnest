import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import MobileBottomNav from '../components/MobileBottomNav';
import * as XLSX from 'xlsx';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [openDepartmentDropdown, setOpenDepartmentDropdown] = useState(false);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);
  const departmentDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add | edit | view
  const [selectedEmp, setSelectedEmp] = useState(null);
  
  const [formData, setFormData] = useState({
    empId: '',
    firstName: '',
    lastName: '',
    email: '',
    temporaryPassword: '',
    phone: '',
    department: '',
    designation: '',
    joinDate: '',
    salary: '',
    status: 'active',
    photo: '',
    reportingManager: '',
    address: '',
    emergencyContact: '',
    bankDetails: ''
  });

  const [formError, setFormError] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/employees', {
        params: { search, department, status }
      });
      setEmployees(data);

      // Extract unique departments for filters
      const uniqueDeps = [...new Set(data.map(e => e.department))].filter(Boolean);
      setDepartments(uniqueDeps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, department, status]);

  useEffect(() => {
    if (!loading && employees.length > 0) {
      gsap.fromTo('.employee-row', 
        { y: 10, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.03, ease: 'power2.out' }
      );
    }
  }, [loading, employees]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target)) {
        setOpenDepartmentDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setOpenStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOpenModal = (mode, employee = null) => {
    setModalMode(mode);
    setFormError('');
    if (employee) {
      setSelectedEmp(employee);
      setFormData({
        empId: employee.empId || '',
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        temporaryPassword: '',
        phone: employee.phone || '',
        department: employee.department || '',
        designation: employee.designation || '',
        joinDate: employee.joinDate ? new Date(employee.joinDate).toISOString().substring(0, 10) : '',
        salary: employee.salary || '',
        status: employee.status || 'active',
        photo: employee.photo || '',
        reportingManager: employee.reportingManager || '',
        address: employee.address || '',
        emergencyContact: employee.emergencyContact || '',
        bankDetails: employee.bankDetails || ''
      });
    } else {
      setSelectedEmp(null);
      setFormData({
        empId: '',
        firstName: '',
        lastName: '',
        email: '',
        temporaryPassword: Math.random().toString(36).slice(-8), // auto-generate temp password
        phone: '',
        department: '',
        designation: '',
        joinDate: new Date().toISOString().substring(0, 10),
        salary: '',
        status: 'active',
        photo: '',
        reportingManager: '',
        address: '',
        emergencyContact: '',
        bankDetails: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmp(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (modalMode === 'add') {
        await api.post('/employees', formData);
      } else if (modalMode === 'edit') {
        await api.put(`/employees/${selectedEmp.id}`, formData);
      }
      fetchEmployees();
      handleCloseModal();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to submit employee form');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee? This will also remove related leaves, payroll, and attendance logs.')) {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete employee');
      }
    }
  };

  const exportEmployees = () => {
    const data = employees.map(e => ({
      "Employee ID": e.empId,
      "First Name": e.firstName,
      "Last Name": e.lastName,
      "Email": e.email,
      "Phone": e.phone || '',
      "Department": e.department,
      "Designation": e.designation,
      "Join Date": e.joinDate ? new Date(e.joinDate).toLocaleDateString() : '',
      "Salary": e.salary,
      "Status": e.status,
      "Reporting Manager": e.reportingManager || '',
      "Address": e.address || '',
      "Emergency Contact": e.emergencyContact || '',
      "Bank Details": e.bankDetails || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "employees_list.xlsx");
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [selectedEmpForMobile, setSelectedEmpForMobile] = useState(null);
  const [selectedEmpFull, setSelectedEmpFull] = useState(null);

  const handleSelectEmpForMobile = (emp) => {
    navigate(`/employees/${emp.id}`);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderMobileEmployeeList = () => {
    return (
      <div className="bg-white min-h-screen px-5 pt-6 pb-28 font-sans">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Employees</h2>
          <div className="flex gap-2">
            <button 
              onClick={exportEmployees}
              className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all shadow-sm"
              title="Export Excel"
            >
              <span className="material-symbols-outlined text-[20px]">table_chart</span>
            </button>
            <button 
              onClick={() => handleOpenModal('add')}
              className="w-10 h-10 rounded-full bg-[#C8D5BB]/20 text-[#536164] flex items-center justify-center hover:bg-[#C8D5BB]/30 transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="relative mb-5 flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100/60 focus:border-[#2563EB] text-xs font-semibold text-slate-800 placeholder-slate-400 rounded-xl outline-none transition-colors"
            />
          </div>
          <button className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100/60 flex items-center justify-center text-slate-650">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
          </button>
        </div>

        {/* List of employees */}
        <div className="space-y-3">
          {employees.map(emp => (
            <div 
              key={emp.id} 
              onClick={() => handleSelectEmpForMobile(emp)}
              className="bg-slate-50 border border-slate-100/60 rounded-[20px] p-4 flex justify-between items-center hover:bg-slate-105 transition-all cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-700 text-sm uppercase border border-slate-100 shadow-sm">
                  {emp.photo ? (
                    <img src={emp.photo} alt={emp.firstName} className="w-full h-full object-cover" />
                  ) : (
                    emp.firstName[0]
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{emp.firstName} {emp.lastName}</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{emp.designation} • {emp.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full capitalize ${
                  emp.status === 'active' 
                    ? 'bg-green-50 text-green-700 border border-green-100' 
                    : 'bg-slate-200/50 text-slate-500'
                }`}>
                  {emp.status}
                </span>
                <span className="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };  const renderMobileEmployeeDetails = (emp) => {
    const todayStr = new Date().toDateString();
    const todayLog = selectedEmpFull?.attendances?.find(l => new Date(l.date).toDateString() === todayStr);

    const checkInTime = todayLog?.checkIn ? new Date(todayLog.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const checkOutTime = todayLog?.checkOut ? new Date(todayLog.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    
    let durationStr = '0h 00m';
    if (todayLog?.checkIn && todayLog?.checkOut) {
      const diffMs = new Date(todayLog.checkOut) - new Date(todayLog.checkIn);
      const diffHrs = Math.floor(diffMs / 3600000);
      const diffMins = Math.floor((diffMs % 3600000) / 60000);
      durationStr = `${diffHrs}h ${diffMins}m`;
    }

    return (
      <div className="bg-white min-h-screen px-5 pt-6 pb-28 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setSelectedEmpForMobile(null)}
            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100/60 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px] font-light">arrow_back</span>
          </button>
          <h2 className="text-sm font-extrabold text-slate-800">Employee Details</h2>
          <div className="w-10"></div>
        </div>

        {/* Info Card */}
        <div className="bg-[#F8FAFC] border border-slate-100 p-5 rounded-[24px] shadow-[0_4px_16px_rgba(0,0,0,0.01)] mb-6">
          <div className="flex flex-col items-center mb-5">
            <div className="w-20 h-20 rounded-full border border-slate-200/60 bg-white overflow-hidden flex items-center justify-center font-bold text-slate-850 text-2xl uppercase shadow-sm mb-3">
              {emp.photo ? (
                <img src={emp.photo} alt={emp.firstName} className="w-full h-full object-cover" />
              ) : (
                emp.firstName[0]
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900">{emp.firstName} {emp.lastName}</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{emp.designation}</p>
            <span className={`mt-2 text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
              emp.status === 'active' ? 'text-green-700 bg-green-50 border-green-100/60' : 'text-slate-550 bg-slate-100 border-slate-200'
            }`}>
              {emp.status}
            </span>
          </div>

          {/* Grid rows */}
          <div className="space-y-3.5 border-t border-slate-100 pt-4">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-450 font-semibold">Employee ID</span>
              <span className="text-slate-800 font-bold">{emp.empId}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-450 font-semibold">Email</span>
              <span className="text-slate-855 font-bold truncate max-w-[180px]">{emp.email}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-450 font-semibold">Phone</span>
              <span className="text-slate-800 font-bold">{emp.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-450 font-semibold">Department</span>
              <span className="text-slate-800 font-bold">{emp.department}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-450 font-semibold">Reporting To</span>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-extrabold uppercase text-slate-700">
                  {emp.reportingManager ? emp.reportingManager[0] : 'N'}
                </div>
                <span className="text-slate-800 font-bold">{emp.reportingManager || 'N/A'}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-450 font-semibold">Date of Joining</span>
              <span className="text-slate-800 font-bold">{new Date(emp.joinDate).toLocaleDateString([], {day:'2-digit', month:'short', year:'numeric'})}</span>
            </div>
          </div>
        </div>

        {/* Attendance Today */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-850 mb-3 tracking-tight">Attendance Today</h3>
          <div className="space-y-3">
            <div className="bg-[#f0f7ed] border border-[#C8D5BB]/30 rounded-[20px] p-3 flex justify-between items-center">
              <div>
                <p className="text-[9px] text-[#536164] font-bold tracking-tight uppercase">Check In</p>
                <h4 className="text-sm font-extrabold text-[#3a4446] mt-0.5">{checkInTime}</h4>
              </div>
              <div className="flex items-center gap-2">
                {todayLog ? (
                  <>
                    <span className="text-[9px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100/60 uppercase">{todayLog.status}</span>
                    <span className="text-[10px] font-bold text-white bg-gradient-to-r from-[#536164] to-[#C8D5BB] px-3.5 py-1.5 rounded-xl">Checked In</span>
                  </>
                ) : (
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase">Absent</span>
                )}
              </div>
            </div>

            {todayLog?.checkOut && (
              <div className="bg-slate-50 border border-slate-100/60 rounded-[20px] p-3 flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-slate-400 font-bold tracking-tight uppercase">Check Out</p>
                  <h4 className="text-sm font-extrabold text-slate-850 mt-0.5">{checkOutTime}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-200/50 px-2.5 py-1 rounded-full">Checked Out</span>
                  <span className="text-[10px] font-bold text-white bg-black px-3.5 py-1.5 rounded-xl">Checked Out</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Today's Summary */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-850 mb-3 tracking-tight">Today's Summary</h3>
          <div className="bg-slate-50 border border-slate-100/60 rounded-[20px] p-4 space-y-3">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-450 font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-400 font-light">schedule</span>
                Work Duration
              </span>
              <span className="text-slate-800 font-bold">{durationStr}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-450 font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-400 font-light">verified</span>
                Status
              </span>
              <span className="text-slate-800 font-bold">{todayLog ? todayLog.status : 'Absent'}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-450 font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-400 font-light">location_on</span>
                Location
              </span>
              <span className="text-slate-800 font-bold">Office</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-white">
        {selectedEmpForMobile 
          ? renderMobileEmployeeDetails(selectedEmpForMobile) 
          : renderMobileEmployeeList()}
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <Sidebar />
      <main className="lg:ml-[280px] ml-0 min-h-screen p-4">
        <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 p-4">
          <Topbar />
          
          <div className="p-container-margin-mobile lg:p-container-margin-desktop max-w-[1600px] mx-auto pb-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-headline-lg font-headline-lg tracking-tight" style={{ color: '#3a4446' }}>Staff Registry</h2>
              <p className="text-body-md text-on-surface-variant">Manage and track company personnel credentials.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={exportEmployees}
                className="flex items-center justify-center space-x-2 bg-white border border-outline-variant hover:bg-surface-container-low text-on-surface text-label-md font-bold px-4 py-2 rounded-lg transition-all card-shadow shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">table_chart</span>
                <span>Export Excel</span>
              </button>
              <button
                onClick={() => handleOpenModal('add')}
                style={{ 
                  background: 'linear-gradient(to top, #536164, #94A293, #C8D5BB)', 
                  boxShadow: '0px 4px 16px rgba(0,0,0,0.08), 0px 2px 4px rgba(0,0,0,0.04)'
                }}
                className="flex items-center justify-center space-x-2 text-white text-label-md font-bold px-6 py-3 rounded-lg transition-all shrink-0 hover:opacity-90"
              >
                <span className="material-symbols-outlined text-[20px]" data-icon="person_add">person_add</span>
                <span>Add Employee</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div style={{ borderColor: '#C8D5BB' }} className="bg-white rounded-xl card-shadow border p-5 mb-8 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#3a4446] text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search by ID, name, email or designation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ 
                  backgroundColor: 'white', 
                  borderColor: '#C8D5BB',
                  borderRadius: '12px'
                }}
                className="w-full pl-11 pr-4 py-3 border text-body-md text-[#3a4446] placeholder-[#94A293] rounded-lg outline-none transition-all hover:border-[#94A293] focus:border-[#536164]"
              />
            </div>
            
            <div className="flex items-center w-full md:w-auto gap-4">
              {/* Custom Department Dropdown */}
              <div className="relative w-full md:w-56" ref={departmentDropdownRef}>
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#3a4446] text-[18px]">business_center</span>
                <button
                  onClick={() => {
                    setOpenDepartmentDropdown(!openDepartmentDropdown);
                    setOpenStatusDropdown(false);
                  }}
                  style={{ 
                    backgroundColor: 'white', 
                    borderColor: '#C8D5BB',
                    borderRadius: '12px'
                  }}
                  className="w-full pl-9 pr-10 py-3 border text-left text-body-md text-[#3a4446] rounded-lg outline-none transition-all hover:border-[#94A293] focus:border-[#536164]"
                >
                  {department || 'All Departments'}
                </button>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#3a4446] pointer-events-none">expand_more</span>

                {openDepartmentDropdown && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-[#C8D5BB] rounded-xl shadow-lg overflow-hidden">
                    <button
                      onClick={() => {
                        setDepartment('');
                        setOpenDepartmentDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-body-md transition-colors ${
                        !department ? 'bg-[#C8D5BB]' : 'hover:bg-[#C8D5BB]/30'
                      } text-[#3a4446]`}
                    >
                      All Departments
                    </button>
                    {departments.map(d => (
                      <button
                        key={d}
                        onClick={() => {
                          setDepartment(d);
                          setOpenDepartmentDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-body-md transition-colors ${
                          department === d ? 'bg-[#C8D5BB]' : 'hover:bg-[#C8D5BB]/30'
                        } text-[#3a4446]`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Status Dropdown */}
              <div className="relative w-full md:w-48" ref={statusDropdownRef}>
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#3a4446] text-[18px]">filter_list</span>
                <button
                  onClick={() => {
                    setOpenStatusDropdown(!openStatusDropdown);
                    setOpenDepartmentDropdown(false);
                  }}
                  style={{ 
                    backgroundColor: 'white', 
                    borderColor: '#C8D5BB',
                    borderRadius: '12px'
                  }}
                  className="w-full pl-9 pr-10 py-3 border text-left text-body-md text-[#3a4446] rounded-lg outline-none transition-all hover:border-[#94A293] focus:border-[#536164]"
                >
                  {status || 'All Statuses'}
                </button>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#3a4446] pointer-events-none">expand_more</span>

                {openStatusDropdown && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-[#C8D5BB] rounded-xl shadow-lg overflow-hidden">
                    <button
                      onClick={() => {
                        setStatus('');
                        setOpenStatusDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-body-md transition-colors ${
                        !status ? 'bg-[#C8D5BB]' : 'hover:bg-[#C8D5BB]/30'
                      } text-[#3a4446]`}
                    >
                      All Statuses
                    </button>
                    <button
                      onClick={() => {
                        setStatus('active');
                        setOpenStatusDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-body-md transition-colors ${
                        status === 'active' ? 'bg-[#C8D5BB]' : 'hover:bg-[#C8D5BB]/30'
                      } text-[#3a4446]`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => {
                        setStatus('inactive');
                        setOpenStatusDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-body-md transition-colors ${
                        status === 'inactive' ? 'bg-[#C8D5BB]' : 'hover:bg-[#C8D5BB]/30'
                      } text-[#3a4446]`}
                    >
                      Inactive
                    </button>
                    <button
                      onClick={() => {
                        setStatus('terminated');
                        setOpenStatusDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-body-md transition-colors ${
                        status === 'terminated' ? 'bg-[#C8D5BB]' : 'hover:bg-[#C8D5BB]/30'
                      } text-[#3a4446]`}
                    >
                      Terminated
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table list */}
          <div style={{ borderColor: '#C8D5BB' }} className="bg-white rounded-xl card-shadow border overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-on-surface-variant flex flex-col items-center">
                 <span className="material-symbols-outlined animate-spin text-[32px] text-secondary mb-4">refresh</span>
                 <p>Loading personnel details...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant flex flex-col items-center">
                 <span className="material-symbols-outlined text-[48px] text-outline mb-4">search_off</span>
                 <p>No employee files match standard search parameters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead style={{ backgroundColor: 'rgba(200, 213, 187, 0.5)' }}>
                    <tr>
                      <th className="px-6 py-4 text-label-sm text-[#3a4446] font-bold uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-4 text-label-sm text-[#3a4446] font-bold uppercase tracking-wider">EMP ID</th>
                      <th className="px-6 py-4 text-label-sm text-[#3a4446] font-bold uppercase tracking-wider">Role/Dept</th>
                      <th className="px-6 py-4 text-label-sm text-[#3a4446] font-bold uppercase tracking-wider">Join Date</th>
                      <th className="px-6 py-4 text-label-sm text-[#3a4446] font-bold uppercase tracking-wider">Salary</th>
                      <th className="px-6 py-4 text-label-sm text-[#3a4446] font-bold uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-label-sm text-[#3a4446] font-bold uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderColor: '#C8D5BB' }} className="divide-y">
                    {employees.map(emp => (
                      <tr key={emp.id} className="employee-row transition-colors group">
                        <td className="px-6 py-4 flex items-center gap-4">
                          {emp.photo ? (
                            <img src={emp.photo} alt={emp.firstName} className="w-10 h-10 rounded-full object-cover border border-outline-variant" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-on-surface-variant uppercase text-body-md">
                              {emp.firstName[0]}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-body-md text-on-surface block">{emp.firstName} {emp.lastName}</span>
                            <span className="text-body-sm text-on-surface-variant select-all">{emp.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-headline-sm font-bold text-primary">{emp.empId}</td>
                        <td className="px-6 py-4">
                          <span className="block font-bold text-on-surface text-body-md">{emp.designation}</span>
                          <span className="text-body-sm text-on-surface-variant">{emp.department}</span>
                        </td>
                        <td className="px-6 py-4 text-body-md text-on-surface">{new Date(emp.joinDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-bold text-on-surface text-body-md">₹{emp.salary.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            emp.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : emp.status === 'inactive' 
                              ? 'bg-surface-container-high text-on-surface-variant'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            <span className="material-symbols-outlined text-[12px]">
                              {emp.status === 'active' ? 'check_circle' : emp.status === 'inactive' ? 'pause_circle' : 'cancel'}
                            </span>
                            {emp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-1 opacity-100">
                            <button
                              onClick={() => navigate(`/employees/${emp.id}`)}
                              className="p-2 hover:bg-surface-container-highest rounded-lg text-on-surface-variant transition-colors"
                              title="View"
                            >
                              <span className="material-symbols-outlined text-[20px]">visibility</span>
                            </button>
                            <button
                              onClick={() => handleOpenModal('edit', emp)}
                              className="p-2 hover:bg-surface-container-highest rounded-lg text-primary transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(emp.id)}
                              className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Form and View modal */}
          {showModal && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto card-shadow border border-outline-variant">
                
                {/* Modal Header */}
                <div className="sticky top-0 z-10 flex justify-between items-center px-6 py-5 border-b border-outline-variant bg-surface-container-low backdrop-blur-md">
                  <h4 className="font-headline-sm font-bold text-on-surface tracking-tight">
                    {modalMode === 'add' ? 'Register New Staff' : modalMode === 'edit' ? 'Edit Staff Credentials' : 'Staff Profile Folder'}
                  </h4>
                  <button onClick={handleCloseModal} className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Form Content */}
                {modalMode === 'view' ? (
                  <div className="p-8 space-y-8">
                    {/* View Profile Detail Layout */}
                    <div className="flex items-center space-x-6 pb-8 border-b border-outline-variant">
                      {selectedEmp?.photo ? (
                        <img src={selectedEmp.photo} alt={selectedEmp.firstName} className="w-24 h-24 rounded-2xl object-cover border border-outline-variant card-shadow" />
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-surface-container-highest flex items-center justify-center font-bold text-on-surface-variant uppercase text-headline-lg card-shadow">
                          {selectedEmp?.firstName[0]}{(selectedEmp?.lastName || '')[0] || ''}
                        </div>
                      )}
                      <div>
                        <h3 className="text-headline-md font-bold text-on-surface">{selectedEmp?.firstName} {selectedEmp?.lastName}</h3>
                        <p className="text-body-lg text-on-surface-variant mt-1">{selectedEmp?.designation} • {selectedEmp?.department}</p>
                        <span className={`inline-flex items-center mt-3 text-label-sm font-bold uppercase tracking-wider px-3 py-1.5 border rounded-lg ${
                          selectedEmp?.status === 'active' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-zinc-50 text-zinc-400 border-zinc-200'
                        }`}>
                          Status: {selectedEmp?.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-surface border border-outline-variant">
                        <div className="p-2 bg-surface-container rounded-lg shrink-0">
                          <span className="material-symbols-outlined text-primary">badge</span>
                        </div>
                        <div>
                          <span className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Employee ID</span>
                          <span className="text-body-lg font-bold text-primary">{selectedEmp?.empId}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-xl bg-surface border border-outline-variant">
                        <div className="p-2 bg-surface-container rounded-lg shrink-0">
                          <span className="material-symbols-outlined text-primary">mail</span>
                        </div>
                        <div className="min-w-0">
                          <span className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Email Address</span>
                          <span className="text-body-lg font-medium text-on-surface break-all select-all">{selectedEmp?.email}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-xl bg-surface border border-outline-variant">
                        <div className="p-2 bg-surface-container rounded-lg shrink-0">
                          <span className="material-symbols-outlined text-primary">phone</span>
                        </div>
                        <div>
                          <span className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Phone Number</span>
                          <span className="text-body-lg font-medium text-on-surface">{selectedEmp?.phone || 'Not Provided'}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-xl bg-surface border border-outline-variant">
                        <div className="p-2 bg-surface-container rounded-lg shrink-0">
                          <span className="material-symbols-outlined text-primary">business_center</span>
                        </div>
                        <div>
                          <span className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Department</span>
                          <span className="text-body-lg font-medium text-on-surface">{selectedEmp?.department}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-xl bg-surface border border-outline-variant">
                        <div className="p-2 bg-surface-container rounded-lg shrink-0">
                          <span className="material-symbols-outlined text-primary">supervisor_account</span>
                        </div>
                        <div>
                          <span className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Reporting Manager</span>
                          <span className="text-body-lg font-medium text-on-surface">{selectedEmp?.reportingManager || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-xl bg-surface border border-outline-variant">
                        <div className="p-2 bg-surface-container rounded-lg shrink-0">
                          <span className="material-symbols-outlined text-primary">calendar_today</span>
                        </div>
                        <div>
                          <span className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Date of Joining</span>
                          <span className="text-body-lg font-medium text-on-surface">
                            {selectedEmp?.joinDate ? new Date(selectedEmp.joinDate).toLocaleDateString([], {day:'2-digit', month:'short', year:'numeric'}) : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-xl bg-surface border border-outline-variant">
                        <div className="p-2 bg-surface-container rounded-lg shrink-0">
                          <span className="material-symbols-outlined text-primary">payments</span>
                        </div>
                        <div>
                          <span className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Monthly Gross Salary</span>
                          <span className="text-headline-sm font-extrabold text-on-surface">₹{selectedEmp?.salary ? selectedEmp.salary.toLocaleString('en-IN') : '0'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="p-8 space-y-8">
                    {formError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-body-md flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-600">error</span>
                        {formError}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-surface border border-outline-variant rounded-xl border-dashed text-center sm:text-left">
                      <div className="shrink-0 relative">
                        {formData.photo ? (
                          <img src={formData.photo} alt="Preview" className="w-20 h-20 rounded-2xl object-cover border border-outline-variant card-shadow" />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-surface-container border border-outline-variant flex flex-col items-center justify-center text-on-surface-variant cursor-pointer hover:bg-surface-container-high transition-colors">
                            <span className="material-symbols-outlined text-[24px] mb-1">add_photo_alternate</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <div>
                        <h5 className="text-body-lg font-bold text-on-surface">Upload Avatar Photo</h5>
                        <p className="text-body-sm text-on-surface-variant mt-1">Recommended size 256x256px. Click the placeholder to select a file.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">First Name</label>
                        <input type="text" required value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors" />
                      </div>

                      <div>
                        <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Last Name</label>
                        <input type="text" required value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Company Email</label>
                        <div className="flex gap-2">
                          <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="Will auto-generate if empty" className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors" />
                          <button type="button" onClick={() => setFormData(p => ({...p, email: `${p.firstName.toLowerCase()}.${p.lastName.toLowerCase()}@company.com`}))} className="px-4 bg-surface-container-low border border-outline-variant rounded-lg text-label-md font-bold hover:bg-surface-container transition-colors whitespace-nowrap">
                            Generate
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                          {modalMode === 'add' ? 'Temporary Password' : 'Set Login Password (Optional)'}
                        </label>
                        <div className="flex gap-2">
                          <input type="text" value={formData.temporaryPassword} onChange={e => setFormData(p => ({ ...p, temporaryPassword: e.target.value }))} placeholder="Set password to enable login" className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors" />
                          <button type="button" onClick={() => setFormData(p => ({...p, temporaryPassword: Math.random().toString(36).slice(-8)}))} className="px-4 bg-surface-container-low border border-outline-variant rounded-lg text-label-md font-bold hover:bg-surface-container transition-colors whitespace-nowrap">
                            Generate
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Phone Number</label>
                        <input type="text" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors" />
                      </div>

                      <div>
                        <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Reporting Manager</label>
                        <input type="text" placeholder="e.g. John Doe" value={formData.reportingManager} onChange={e => setFormData(p => ({ ...p, reportingManager: e.target.value }))} className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors" />
                      </div>

                      <div>
                        <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Department</label>
                        <input type="text" required placeholder="e.g. Engineering, Sales" value={formData.department} onChange={e => setFormData(p => ({ ...p, department: e.target.value }))} className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors" />
                      </div>

                      <div>
                        <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Designation</label>
                        <input type="text" required placeholder="e.g. Lead Developer" value={formData.designation} onChange={e => setFormData(p => ({ ...p, designation: e.target.value }))} className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors" />
                      </div>

                      <div>
                        <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Join Date</label>
                        <input type="date" required value={formData.joinDate} onChange={e => setFormData(p => ({ ...p, joinDate: e.target.value }))} className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors" />
                      </div>

                      <div>
                        <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Monthly Gross Salary (INR)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                          <input type="number" required value={formData.salary} onChange={e => setFormData(p => ({ ...p, salary: e.target.value }))} className="w-full pl-8 pr-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors" />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Residential Address</label>
                        <textarea value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} rows={2} className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors"></textarea>
                      </div>

                      <div>
                        <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Emergency Contact</label>
                        <input type="text" placeholder="Name - Phone" value={formData.emergencyContact} onChange={e => setFormData(p => ({ ...p, emergencyContact: e.target.value }))} className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors" />
                      </div>

                      <div>
                        <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Bank Details</label>
                        <input type="text" placeholder="Acc No / IFSC" value={formData.bankDetails} onChange={e => setFormData(p => ({ ...p, bankDetails: e.target.value }))} className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors" />
                      </div>

                      {modalMode === 'edit' && (
                        <div className="md:col-span-2">
                          <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Status</label>
                          <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))} className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="terminated">Terminated</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-4 pt-8 border-t border-outline-variant">
                      <button type="button" onClick={handleCloseModal} className="px-6 py-3 bg-surface hover:bg-surface-container text-on-surface text-label-md font-bold rounded-lg border border-outline-variant transition-colors">
                        Cancel
                      </button>
                      <button type="submit" className="px-8 py-3 bg-primary hover:bg-opacity-90 text-on-primary text-label-md font-bold rounded-lg transition-all card-shadow inline-flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">{modalMode === 'add' ? 'save' : 'update'}</span>
                        <span>{modalMode === 'add' ? 'Save Employee' : 'Update Record'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      </main>
    </div>
  );
}

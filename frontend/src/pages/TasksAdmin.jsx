import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import { gsap } from 'gsap';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../hooks/useAuth';

export default function TasksAdmin() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'medium', status: 'pending', dueDate: '', assignedTo: ''
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const [taskRes, empRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/employees')
      ]);
      setTasks(taskRes.data);
      setEmployees(empRes.data.filter(e => e.status === 'active'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (!loading && tasks.length > 0) {
      gsap.fromTo('.task-card', 
        { scale: 0.95, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'back.out(1.2)' }
      );
    }
  }, [loading, tasks]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        assignedTo: parseInt(formData.assignedTo),
        dueDate: new Date(formData.dueDate).toISOString(),
        assignedBy: user.id // using auth user id as assignedBy
      };
      await api.post('/tasks', payload);
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create task');
    }
  };

  const columns = [
    { id: 'pending', label: 'Pending', icon: 'pending_actions', color: 'text-primary' },
    { id: 'in_progress', label: 'In Progress', icon: 'timelapse', color: 'text-secondary' },
    { id: 'review', label: 'In Review', icon: 'rate_review', color: 'text-orange-500' },
    { id: 'completed', label: 'Completed', icon: 'task_alt', color: 'text-green-600' }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-[#C8D5BB]/30 text-[#536164] border-[#C8D5BB]';
    }
  };

  return (
    <div className="min-h-screen bg-surface font-sans">
      <Sidebar />
      <main className="lg:ml-[280px] ml-0 min-h-screen flex flex-col">
        <Topbar />
        
        <div className="p-container-margin-mobile lg:p-container-margin-desktop flex-1 flex flex-col max-w-[1600px] mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-headline-lg font-headline-lg text-primary tracking-tight">Task Management</h2>
              <p className="text-body-md text-on-surface-variant">Assign and monitor operational goals.</p>
            </div>
            
            <button
              onClick={() => {
                setFormData({ title: '', description: '', priority: 'medium', status: 'pending', dueDate: '', assignedTo: '' });
                setShowModal(true);
              }}
              className="flex items-center justify-center space-x-2 bg-primary hover:bg-opacity-90 text-on-primary text-label-md font-bold px-6 py-3 rounded-lg transition-all card-shadow shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">add_task</span>
              <span>Create Task</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1">
              {[1,2,3,4].map(i => <SkeletonLoader key={i} className="h-full rounded-2xl min-h-[500px]" />)}
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-outline-variant card-shadow">
              <EmptyState icon="assignment" title="No tasks found" description="Create a task to get your team moving." />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 items-start">
              {columns.map(col => {
                const colTasks = tasks.filter(t => t.status === col.id);
                return (
                  <div key={col.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 flex flex-col min-h-[60vh]">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-outline-variant">
                      <h3 className={`text-title-md font-bold flex items-center gap-2 ${col.color}`}>
                        <span className="material-symbols-outlined">{col.icon}</span>
                        {col.label}
                      </h3>
                      <span className="bg-surface-container px-2 py-1 rounded text-label-sm font-bold text-on-surface-variant">{colTasks.length}</span>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pb-4">
                      {colTasks.map(task => (
                        <div key={task.id} className="task-card bg-white p-4 rounded-xl border border-outline-variant card-shadow cursor-pointer hover:border-primary transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className="text-label-sm text-on-surface-variant">{new Date(task.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                          </div>
                          <h4 className="text-label-lg font-bold text-on-surface mb-1">{task.title}</h4>
                          <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-4">{task.description}</p>
                          
                          <div className="flex items-center gap-2 pt-3 border-t border-outline-variant">
                            {task.employee?.photo ? (
                              <img src={task.employee.photo} alt="Assignee" className="w-6 h-6 rounded-full object-cover border border-outline-variant" title={task.employee.firstName} />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-[10px]" title={task.employee?.firstName}>
                                {task.employee?.firstName?.[0]}
                              </div>
                            )}
                            <span className="text-label-sm text-on-surface-variant font-medium">{task.employee?.firstName} {task.employee?.lastName}</span>
                          </div>
                        </div>
                      ))}
                      {colTasks.length === 0 && (
                        <div className="text-center p-4 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant text-body-sm font-medium">
                          No {col.label.toLowerCase()} tasks
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add Task Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto card-shadow border border-outline-variant">
                <div className="sticky top-0 z-10 flex justify-between items-center px-6 py-5 border-b border-outline-variant bg-surface-container-low backdrop-blur-md">
                  <h4 className="font-headline-sm font-bold text-on-surface tracking-tight">Create New Task</h4>
                  <button onClick={() => setShowModal(false)} className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div>
                    <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Task Title</label>
                    <input type="text" required value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors" />
                  </div>

                  <div>
                    <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Description</label>
                    <textarea rows={3} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors"></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Assign To</label>
                      <select required value={formData.assignedTo} onChange={e => setFormData(p => ({ ...p, assignedTo: e.target.value }))} className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors">
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.designation})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Due Date</label>
                      <input type="date" required value={formData.dueDate} onChange={e => setFormData(p => ({ ...p, dueDate: e.target.value }))} className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors" />
                    </div>

                    <div>
                      <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Priority</label>
                      <select required value={formData.priority} onChange={e => setFormData(p => ({ ...p, priority: e.target.value }))} className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Initial Status</label>
                      <select required value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))} className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors">
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-outline-variant">
                    <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-surface hover:bg-surface-container text-on-surface text-label-md font-bold rounded-lg border border-outline-variant transition-colors">
                      Cancel
                    </button>
                    <button type="submit" className="px-8 py-3 bg-primary hover:bg-opacity-90 text-on-primary text-label-md font-bold rounded-lg transition-all card-shadow">
                      Assign Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { gsap } from 'gsap';
import MobileBottomNav from '../components/MobileBottomNav';
import { useNavigate } from 'react-router-dom';

export default function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data: emps } = await api.get('/employees');
      const matched = emps.find(e => e.email === user.email);
      if (matched) {
        const { data: tsks } = await api.get(`/tasks/my?employeeId=${matched.id}`);
        setTasks(tsks);
      }
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
      gsap.fromTo('.my-task-card', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [loading, tasks]);

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-[#C8D5BB]/30 text-[#536164] border-[#C8D5BB]';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-surface-container text-on-surface-variant';
      case 'in_progress': return 'bg-secondary text-on-secondary';
      case 'review': return 'bg-orange-500 text-white';
      case 'completed': return 'bg-green-600 text-white';
      default: return 'bg-surface text-on-surface';
    }
  };

  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderMobileTasks = () => {
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
          <h2 className="text-sm font-extrabold text-slate-800">My Tasks</h2>
          <div className="w-10"></div>
        </div>

        {/* Task lists */}
        <div className="space-y-6">
          {/* Active Tasks */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500 text-[18px]">pending_actions</span>
              Active Tasks ({pendingTasks.length})
            </h3>
            {pendingTasks.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic p-4 bg-slate-50 rounded-2xl border border-slate-100/40">No active tasks.</p>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map(task => (
                  <div key={task.id} className="bg-surface-container-lowest border border-outline-variant rounded-[20px] p-4 relative overflow-hidden flex flex-col">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${task.priority === 'critical' ? 'bg-red-500' : task.priority === 'high' ? 'bg-orange-500' : 'bg-[#94A293]'}`}></div>
                    
                    <div className="flex justify-between items-start mb-2 pl-2">
                      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full capitalize ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-[10px] text-slate-450 font-semibold flex items-center gap-1">
                        Due {new Date(task.dueDate).toLocaleDateString([], {day:'2-digit', month:'short'})}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 mb-1 pl-2">{task.title}</h4>
                    <p className="text-[10px] text-slate-450 font-medium pl-2 mb-4 line-clamp-2">{task.description}</p>

                    <div className="pl-2 pt-3 border-t border-slate-200/50 flex items-center justify-between">
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        task.status === 'in_progress' ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      
                      <select 
                        value={task.status} 
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className="text-[10px] font-bold bg-white border border-slate-100 text-slate-800 rounded-xl px-2 py-1 outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Tasks */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600 text-[18px]">task_alt</span>
              Completed Tasks ({completedTasks.length})
            </h3>
            {completedTasks.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic p-4 bg-slate-50 rounded-2xl border border-slate-100/40">No completed tasks yet.</p>
            ) : (
              <div className="space-y-3">
                {completedTasks.map(task => (
                  <div key={task.id} className="bg-slate-50/50 border border-slate-100/40 rounded-[20px] p-4 flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200/50 text-slate-500">
                        {task.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 line-through">
                        Due {new Date(task.dueDate).toLocaleDateString([], {day:'2-digit', month:'short'})}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-400 line-through mb-1">{task.title}</h4>
                    
                    <div className="pt-3 border-t border-slate-200/30 flex justify-between items-center">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-green-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-green-650">done_all</span>
                          Completed
                        </span>
                        {task.completedAt && (
                          <span className="text-[9px] text-green-600/80">
                            Finished {new Date(task.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      <select 
                        value={task.status} 
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className="text-[10px] font-bold bg-white border border-slate-100 text-slate-450 rounded-xl px-2 py-1 outline-none"
                      >
                        <option value="completed">Completed</option>
                        <option value="in_progress">Reopen</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show all tasks
  const pendingTasks = tasks.filter(t => ['pending', 'in_progress', 'review'].includes(t.status));
  const completedTasks = tasks.filter(t => t.status === 'completed');

  if (isMobile) {
    return (
      <div className="min-h-screen bg-white">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-sans flex flex-col items-center justify-center min-h-screen">
            <span className="material-symbols-outlined animate-spin text-[32px] text-primary mb-4">refresh</span>
            <p className="text-xs font-bold">Loading tasks...</p>
          </div>
        ) : (
          renderMobileTasks()
        )}
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-sans">
      <Sidebar />
      <main className="lg:ml-[280px] ml-0 min-h-screen flex flex-col">
        <Topbar />
        
        <div className="p-container-margin-mobile lg:p-container-margin-desktop max-w-[1200px] mx-auto w-full pb-12">
          <div className="mb-8">
            <h2 className="text-headline-lg font-headline-lg text-primary tracking-tight">My Tasks</h2>
            <p className="text-body-md text-on-surface-variant">Manage your operational duties and update their progress.</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <SkeletonLoader key={i} height="120px" className="rounded-xl" />)}
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-outline-variant card-shadow p-8">
              <EmptyState icon="done_all" title="No Assigned Tasks" description="You currently have no tasks. Enjoy your day!" />
            </div>
          ) : (
            <div className="space-y-12">
              {/* Pending / Active Tasks */}
              <div>
                <h3 className="text-title-lg font-bold text-on-surface mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500">pending_actions</span>
                  Active Tasks ({pendingTasks.length})
                </h3>
                
                {pendingTasks.length === 0 ? (
                  <p className="text-body-md text-on-surface-variant italic p-4 bg-surface-container-lowest rounded-xl border border-outline-variant">No active tasks.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pendingTasks.map(task => (
                      <div key={task.id} className="my-task-card bg-white p-6 rounded-2xl border border-outline-variant card-shadow flex flex-col relative overflow-hidden group">
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${task.priority === 'critical' ? 'bg-red-500' : task.priority === 'high' ? 'bg-orange-500' : 'bg-[#94A293]'}`}></div>
                        
                        <div className="flex justify-between items-start mb-4 pl-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="text-label-sm font-bold text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">event</span>
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="text-title-md font-bold text-on-surface mb-2 pl-3">{task.title}</h4>
                        <p className="text-body-md text-on-surface-variant mb-6 pl-3 flex-1">{task.description}</p>

                        <div className="pl-3 pt-4 border-t border-outline-variant flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-label-sm font-bold uppercase tracking-wider ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          
                          <select 
                            value={task.status} 
                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                            className="px-3 py-1.5 bg-surface-container-lowest border border-outline-variant text-on-surface text-label-sm font-bold rounded-lg outline-none focus:border-primary transition-colors cursor-pointer"
                          >
                            <option value="pending">Mark Pending</option>
                            <option value="in_progress">Mark In Progress</option>
                            <option value="review">Submit for Review</option>
                            <option value="completed">Mark Completed</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Completed Tasks */}
              <div>
                <h3 className="text-title-lg font-bold text-on-surface mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600">task_alt</span>
                  Completed Tasks ({completedTasks.length})
                </h3>
                
                {completedTasks.length === 0 ? (
                  <p className="text-body-md text-on-surface-variant italic p-4 bg-surface-container-lowest rounded-xl border border-outline-variant">No completed tasks yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {completedTasks.map(task => (
                      <div key={task.id} className="my-task-card bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant flex flex-col opacity-75 hover:opacity-100 transition-opacity">
                        <div className="flex justify-between items-start mb-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface-container text-on-surface-variant border border-outline-variant">
                            {task.priority}
                          </span>
                          <span className="text-label-sm text-on-surface-variant line-through flex items-center gap-1">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="text-title-md font-bold text-on-surface-variant mb-2 line-through">{task.title}</h4>
                        <p className="text-body-md text-on-surface-variant mb-6 flex-1 line-clamp-2">{task.description}</p>

                        <div className="pt-4 border-t border-outline-variant flex justify-between items-center">
                          <div className="flex flex-col gap-1">
                            <span className="text-label-sm font-bold text-green-600 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">done_all</span> Completed
                            </span>
                            {task.completedAt && (
                              <span className="text-[11px] text-green-600/80">
                                Finished {new Date(task.completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          
                          <select 
                            value={task.status} 
                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                            className="px-3 py-1.5 bg-surface border border-outline-variant text-on-surface-variant text-label-sm font-bold rounded-lg outline-none focus:border-primary transition-colors cursor-pointer"
                          >
                            <option value="completed">Completed</option>
                            <option value="in_progress">Reopen (In Progress)</option>
                          </select>
                        </div>
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

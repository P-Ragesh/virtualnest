import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { gsap } from 'gsap';

export default function AnnouncementsEmployee() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/announcements');
      // Sort by newest first
      const active = data.filter(a => a.status === 'published' || a.status === 'active');
      setAnnouncements(active.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (!loading && announcements.length > 0) {
      gsap.fromTo('.announcement-card', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [loading, announcements]);

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-[#C8D5BB]/20 text-[#536164] border-[#94A293]/30';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return 'campaign';
      case 'medium': return 'notifications_active';
      default: return 'info';
    }
  };

  return (
    <div className="min-h-screen bg-surface font-sans">
      <Sidebar />
      <main className="lg:ml-[280px] ml-0 min-h-screen flex flex-col">
        <Topbar />
        
        <div className="p-container-margin-mobile lg:p-container-margin-desktop max-w-[1000px] mx-auto w-full pb-12">
          <div className="mb-8">
            <h2 className="text-headline-lg font-headline-lg text-primary tracking-tight">Company Announcements</h2>
            <p className="text-body-md text-on-surface-variant">Stay updated with the latest news and policies.</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <SkeletonLoader key={i} height="120px" className="rounded-2xl" />)}
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-white rounded-2xl border border-outline-variant card-shadow p-8">
               <EmptyState icon="notifications_off" title="No Announcements" description="You are all caught up. There are no new announcements right now." />
            </div>
          ) : (
            <div className="space-y-6">
              {announcements.map(item => (
                <div key={item.id} className="announcement-card bg-white p-6 md:p-8 rounded-2xl border border-outline-variant card-shadow relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${item.priority === 'high' ? 'bg-red-500' : item.priority === 'medium' ? 'bg-orange-500' : 'bg-[#536164]'}`}></div>
                  
                  <div className="flex justify-between items-start mb-4 pl-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityStyles(item.priority)}`}>
                      <span className="material-symbols-outlined text-[14px]">{getPriorityIcon(item.priority)}</span>
                      {item.priority} Priority
                    </span>
                    <span className="text-label-sm text-on-surface-variant font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {new Date(item.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-title-lg font-bold text-on-surface mb-3 pl-3">{item.title}</h3>
                  <div className="pl-3 text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                    {item.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

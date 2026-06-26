import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import { gsap } from 'gsap';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../hooks/useAuth';

export default function AnnouncementsAdmin() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', content: '', type: 'news', isPinned: false
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/announcements');
      setAnnouncements(data);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', { ...formData, createdBy: user.id });
      setShowModal(false);
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post announcement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this announcement?')) {
      try {
        await api.delete(`/announcements/${id}`);
        fetchAnnouncements();
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'holiday': return { icon: 'festival', color: 'text-orange-500 bg-orange-50' };
      case 'notice': return { icon: 'warning', color: 'text-red-500 bg-red-50' };
      default: return { icon: 'campaign', color: 'text-primary bg-surface-container-low' };
    }
  };

  return (
    <div className="min-h-screen bg-surface font-sans">
      <Sidebar />
      <main className="lg:ml-[280px] ml-0 min-h-screen flex flex-col">
        <Topbar />
        
        <div className="p-container-margin-mobile lg:p-container-margin-desktop max-w-[1200px] mx-auto w-full pb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-headline-lg font-headline-lg text-primary tracking-tight">Company Announcements</h2>
              <p className="text-body-md text-on-surface-variant">Broadcast news, holidays, and important notices to the entire workforce.</p>
            </div>
            
            <button
              onClick={() => {
                setFormData({ title: '', content: '', type: 'news', isPinned: false });
                setShowModal(true);
              }}
              className="flex items-center justify-center space-x-2 bg-primary hover:bg-opacity-90 text-on-primary text-label-md font-bold px-6 py-3 rounded-lg transition-all card-shadow shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">add_alert</span>
              <span>Post Announcement</span>
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              [1,2,3].map(i => <SkeletonLoader key={i} height="120px" className="rounded-xl" />)
            ) : announcements.length === 0 ? (
              <div className="bg-white rounded-2xl border border-outline-variant card-shadow p-8">
                <EmptyState icon="campaign" title="No Announcements" description="No active broadcasts. Create one to notify the team." />
              </div>
            ) : (
              announcements.map(ann => {
                const { icon, color } = getIconForType(ann.type);
                return (
                  <div key={ann.id} className="announcement-card bg-white p-6 rounded-xl border border-outline-variant card-shadow flex gap-6 items-start relative overflow-hidden group">
                    {ann.isPinned && (
                      <div className="absolute top-0 right-0 bg-secondary text-on-secondary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                        Pinned
                      </div>
                    )}
                    
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
                      <span className="material-symbols-outlined text-[28px]">{icon}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-title-lg font-bold text-on-surface">{ann.title}</h3>
                        <span className="text-label-sm text-on-surface-variant bg-surface-container px-2 py-1 rounded">
                          {new Date(ann.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-body-md text-on-surface whitespace-pre-wrap">{ann.content}</p>
                    </div>

                    <button 
                      onClick={() => handleDelete(ann.id)}
                      className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity p-2 text-error hover:bg-red-50 rounded-lg absolute bottom-4 right-4"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Add Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto card-shadow border border-outline-variant">
                <div className="sticky top-0 z-10 flex justify-between items-center px-6 py-5 border-b border-outline-variant bg-surface-container-low backdrop-blur-md">
                  <h4 className="font-headline-sm font-bold text-on-surface tracking-tight">Post New Announcement</h4>
                  <button onClick={() => setShowModal(false)} className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div>
                    <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Title</label>
                    <input type="text" required value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors" />
                  </div>

                  <div>
                    <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Content / Message</label>
                    <textarea required rows={6} value={formData.content} onChange={e => setFormData(p => ({ ...p, content: e.target.value }))} className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors"></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Type</label>
                      <select required value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))} className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors">
                        <option value="news">General News</option>
                        <option value="holiday">Holiday</option>
                        <option value="notice">Important Notice</option>
                      </select>
                    </div>

                    <div className="flex items-center mt-8">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={formData.isPinned} onChange={e => setFormData(p => ({ ...p, isPinned: e.target.checked }))} className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" />
                        <span className="text-label-md font-bold text-on-surface">Pin to top of feed</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-outline-variant">
                    <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-surface hover:bg-surface-container text-on-surface text-label-md font-bold rounded-lg border border-outline-variant transition-colors">
                      Cancel
                    </button>
                    <button type="submit" className="px-8 py-3 bg-primary hover:bg-opacity-90 text-on-primary text-label-md font-bold rounded-lg transition-all card-shadow flex items-center gap-2">
                      <span className="material-symbols-outlined">send</span> Post Now
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

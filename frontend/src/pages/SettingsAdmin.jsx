import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import SkeletonLoader from '../components/SkeletonLoader';

export default function SettingsAdmin() {
  const [settings, setSettings] = useState({
    COMPANY_NAME: '',
    TIMEZONE: 'Asia/Kolkata',
    WORK_HOURS_START: '09:00',
    WORK_HOURS_END: '18:00',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data && data.length > 0) {
          const s = {};
          data.forEach(item => { s[item.key] = item.value });
          setSettings(prev => ({ ...prev, ...s }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(p => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // API expects an array of {key, value} objects
      const payload = Object.keys(settings).map(k => ({ key: k, value: settings[k] }));
      await api.post('/settings', { settings: payload });
      alert('Settings saved successfully');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface font-sans">
      <Sidebar />
      <main className="lg:ml-[280px] ml-0 min-h-screen flex flex-col">
        <Topbar />
        
        <div className="p-container-margin-mobile lg:p-container-margin-desktop max-w-[800px] mx-auto w-full pb-12">
          <div className="mb-8">
            <h2 className="text-headline-lg font-headline-lg text-primary tracking-tight">System Settings</h2>
            <p className="text-body-md text-on-surface-variant">Configure company details and platform defaults.</p>
          </div>

          {loading ? (
            <SkeletonLoader className="h-[400px] rounded-2xl" />
          ) : (
            <div className="bg-white rounded-2xl border border-outline-variant card-shadow overflow-hidden">
              <div className="p-8 space-y-8">
                
                {/* General Settings */}
                <div>
                  <h3 className="text-title-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">domain</span>
                    Company Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Company Name</label>
                      <input 
                        type="text" 
                        name="COMPANY_NAME"
                        value={settings.COMPANY_NAME} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors" 
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-outline-variant" />

                {/* Regional Settings */}
                <div>
                  <h3 className="text-title-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">schedule</span>
                    Time & Attendance Defaults
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Timezone</label>
                      <select 
                        name="TIMEZONE"
                        value={settings.TIMEZONE}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors"
                      >
                        <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                        <option value="America/New_York">EST (America/New_York)</option>
                        <option value="Europe/London">GMT (Europe/London)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Work Start</label>
                        <input 
                          type="time" 
                          name="WORK_HOURS_START"
                          value={settings.WORK_HOURS_START} 
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors" 
                        />
                      </div>
                      <div>
                        <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Work End</label>
                        <input 
                          type="time" 
                          name="WORK_HOURS_END"
                          value={settings.WORK_HOURS_END} 
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg outline-none focus:border-primary transition-colors" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="px-8 py-5 bg-surface-container-low border-t border-outline-variant flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-3 bg-primary hover:bg-opacity-90 text-on-primary text-label-md font-bold rounded-lg transition-all card-shadow flex items-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">save</span>
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

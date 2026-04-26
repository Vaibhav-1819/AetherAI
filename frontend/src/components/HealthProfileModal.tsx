import { useState } from 'react';
import { User, Shield, Heart, Activity, AlertCircle, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const HealthProfileModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('aetherai_profile');
    return saved ? JSON.parse(saved) : { conditions: [], age: 'adult', outdoor_job: false };
  });

  const conditions = [
    { id: 'asthma', label: 'Asthma', icon: <Activity size={14} /> },
    { id: 'copd', label: 'COPD', icon: <Activity size={14} /> },
    { id: 'heart', label: 'Heart Condition', icon: <Heart size={14} /> },
    { id: 'allergy', label: 'Seasonal Allergies', icon: <AlertCircle size={14} /> },
  ];

  const handleToggleCondition = (id: string) => {
    setProfile((prev: any) => ({
      ...prev,
      conditions: prev.conditions.includes(id) 
        ? prev.conditions.filter((c: string) => c !== id)
        : [...prev.conditions, id]
    }));
  };

  const handleSave = () => {
    localStorage.setItem('aetherai_profile', JSON.stringify(profile));
    window.dispatchEvent(new Event('storage')); // Trigger update across components
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden transition-colors duration-300"
          >
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 text-red-500 rounded-xl">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Personal Health Profile</h2>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Customize AI Advice</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Respiratory Conditions */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Respiratory & Health Conditions</label>
                <div className="grid grid-cols-2 gap-2">
                  {conditions.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleToggleCondition(c.id)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                        profile.conditions.includes(c.id) 
                        ? 'bg-red-500/10 border-red-500/50 text-red-500' 
                        : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
                      }`}
                    >
                      {c.icon}
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Group */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Age Group</label>
                <div className="flex gap-2">
                  {['child', 'adult', 'senior'].map(age => (
                    <button
                      key={age}
                      onClick={() => setProfile({ ...profile, age })}
                      className={`flex-1 p-2.5 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                        profile.age === age
                        ? 'bg-primary/10 border-primary/50 text-primary' 
                        : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lifestyle */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Lifestyle</label>
                <button
                  onClick={() => setProfile({ ...profile, outdoor_job: !profile.outdoor_job })}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    profile.outdoor_job 
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-500' 
                    : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield size={18} />
                    <span className="text-sm font-medium">Work outdoors frequently</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${profile.outdoor_job ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${profile.outdoor_job ? 'left-6' : 'left-1'}`} />
                  </div>
                </button>
              </div>
            </div>

            <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold rounded-2xl hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <Save size={18} /> Save Profile
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

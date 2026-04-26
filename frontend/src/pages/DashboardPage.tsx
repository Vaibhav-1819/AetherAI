import { useState, useEffect } from 'react';
import gsap from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AnimatedNumber } from '../components/ui/animated-number';
import { EmptyState } from '../components/EmptyState';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Activity, AlertTriangle, Info, Cloud, Droplets, Wind, Thermometer, Download, Pin, WifiOff, Loader2, Heart, Shield, Cpu, Users, ShieldCheck, FileText, X } from 'lucide-react';
import { HealthProfileModal } from '../components/HealthProfileModal';

import { CitySearch } from '../components/CitySearch';
import { API_BASE_URL } from '../lib/utils';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('aetherai_profile');
    return saved ? JSON.parse(saved) : { conditions: [], age: 'adult', outdoor_job: false };
  });

  // Listener for profile updates
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('aetherai_profile');
      if (saved) setProfile(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('aetherai_location');
    return saved ? JSON.parse(saved) : { name: 'New Delhi', lat: 28.61, lon: 77.20 };
  });

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isLocating, setIsLocating] = useState(false);
  const [stakeholder, setStakeholder] = useState<'citizen' | 'planner'>('citizen');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMode, setReportMode] = useState<'executive' | 'detailed'>('detailed');

  // Auto-detect location on launch
  useEffect(() => {
    const detectLocation = () => {
      if (navigator.geolocation) {
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude: lat, longitude: lon } = position.coords;
            // Fetch city name from coordinates
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
              const data = await res.json();
              const cityName = data.address.city || data.address.town || data.address.village || 'Current Location';
              const newLoc = { name: cityName, lat, lon };
              setLocation(newLoc);
              localStorage.setItem('aetherai_location', JSON.stringify(newLoc));
            } catch {
              setLocation({ name: 'Current Location', lat, lon });
            } finally {
              setIsLocating(false);
            }
          },
          (error) => {
            console.warn("Geolocation denied or failed:", error);
            setIsLocating(false);
          },
          { timeout: 10000 }
        );
      }
    };

    const saved = localStorage.getItem('aetherai_location');
    // If no location saved, or if it's the default New Delhi, try to auto-locate
    if (!saved || JSON.parse(saved).name === 'New Delhi') {
      detectLocation();
    }
  }, []);

  useEffect(() => {
    const handleStatusChange = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const handleSelectCity = (newLocation: { name: string; lat: number; lon: number }) => {
    setLocation(newLocation);
    localStorage.setItem('aetherai_location', JSON.stringify(newLocation));
  };

  const pinCity = () => {
    const saved = localStorage.getItem('aetherai_pinned_cities');
    const pinned = saved ? JSON.parse(saved) : [];
    if (pinned.length >= 3) {
      alert("Maximum 3 cities can be pinned for comparison.");
      return;
    }
    if (!pinned.find((c: any) => c.name === location.name)) {
      const updated = [...pinned, location];
      localStorage.setItem('aetherai_pinned_cities', JSON.stringify(updated));
      alert(`${location.name} pinned for comparison!`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resData, resPred] = await Promise.all([
          fetch(`${API_BASE_URL}/api/data?lat=${location.lat}&lon=${location.lon}`).then(r => r.json()),
          fetch(`${API_BASE_URL}/api/predict?lat=${location.lat}&lon=${location.lon}`).then(r => r.json())
        ]);
        setData(resData.data);
        setPrediction(resPred.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location]);


  // Browser Alerts Logic
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (data && Notification.permission === "granted" && data.current_aqi > 150) {
      new Notification("AetherAI Alert", {
        body: `Critical Air Quality in ${location.name}: AQI has reached ${data.current_aqi}. Please take precautions.`,
        icon: "/favicon.ico"
      });
    }
  }, [data]);

  useEffect(() => {
    if (!loading && data) {
      gsap.fromTo('.container > *',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', clearProps: 'all' }
      );
    }
  }, [loading, data]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-2xl"></div>)}
        </div>
        <div className="h-96 bg-muted rounded-2xl"></div>
      </div>
    );
  }

  if (!data || !prediction) {
    return <EmptyState title="Dashboard Offline" message="AetherAI hasn't received any pollution metrics yet. Please ensure the data pipeline is active." />;
  }

  const isSensitive = profile.conditions.length > 0 || profile.age === 'child' || profile.age === 'senior';
  const isPoor = data.current_aqi > (isSensitive ? 80 : 150);

  return (
    <div className="container mx-auto px-4 py-12 space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-md border border-primary/20">
               Environmental Command
             </div>
             {isOffline && (
               <div className="px-2 py-1 bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase tracking-widest rounded-md border border-orange-500/20 flex items-center gap-1">
                 <WifiOff size={10} /> Offline
               </div>
             )}
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">{location.name}</h1>
            {isLocating && <Loader2 className="animate-spin text-primary" size={24} />}
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Real-time metrics and 72-hour air quality forecast</p>
        </div>
        
        <div className="w-full md:w-auto flex flex-wrap gap-3">
          <button
            onClick={pinCity}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
          >
            <Pin size={16} /> Pin
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-sm active:scale-95"
          >
            <Download size={16} /> Download Report
          </button>
          <div className="w-full md:w-72">
            <CitySearch onSelectCity={handleSelectCity} currentCity={location.name} />
          </div>
        </div>
      </div>

      {/* Stakeholder Persona Toggle */}
      <div className="flex justify-center md:justify-start">
        <div className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl flex gap-1 border border-zinc-200 dark:border-zinc-800">
           <button 
             onClick={() => setStakeholder('citizen')}
             className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
               stakeholder === 'citizen' ? 'bg-white dark:bg-zinc-800 shadow-sm text-primary' : 'text-zinc-500'
             }`}
           >
             <Heart size={14} /> Citizen View
           </button>
           <button 
             onClick={() => setStakeholder('planner')}
             className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
               stakeholder === 'planner' ? 'bg-white dark:bg-zinc-800 shadow-sm text-primary' : 'text-zinc-500'
             }`}
           >
             <Users size={14} /> Urban Planner
           </button>
        </div>
      </div>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* AQI Master Card */}
        <Card className="col-span-1 md:col-span-1 relative overflow-hidden bg-zinc-50 dark:bg-zinc-900/50 border-none shadow-none">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Live Sensor
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Current AQI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-6xl font-black tracking-tighter ${isPoor ? 'text-red-500' : 'text-teal-500'}`}><AnimatedNumber value={data.current_aqi} /></div>
            <p className={`text-xs font-bold mt-4 px-2 py-1 rounded-md w-fit uppercase tracking-wider ${isPoor ? 'bg-red-500/10 text-red-500' : 'bg-teal-500/10 text-teal-500'}`}>
              {isPoor ? 'Unhealthy Conditions' : 'Moderate Baseline'}
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Info size={14} /> Pollutant Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{data.breakdown.pm25}</div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">PM2.5 (µg/m³)</div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 mt-3 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full transition-all duration-1000" style={{width: `${Math.min(100, data.breakdown.pm25)}%`}}></div>
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{data.breakdown.pm10}</div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">PM10 (µg/m³)</div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 mt-3 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full transition-all duration-1000" style={{width: `${Math.min(100, data.breakdown.pm10 / 2)}%`}}></div>
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{data.breakdown.no2}</div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">NO2 (ppb)</div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 mt-3 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full transition-all duration-1000" style={{width: `${Math.min(100, data.breakdown.no2 * 2)}%`}}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
               <Cloud size={14} /> Live Weather
            </CardTitle>
          </CardHeader>
          <CardContent>
             {prediction?.weather_current ? (
               <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-2">
                 <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-500">
                     <Thermometer size={14} />
                   </div>
                   <span className="font-black text-zinc-900 dark:text-zinc-50 text-sm">{prediction.weather_current.temperature}&deg;C</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
                     <Droplets size={14} />
                   </div>
                   <span className="font-black text-zinc-900 dark:text-zinc-50 text-sm">{prediction.weather_current.humidity}%</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-teal-500/10 rounded-lg text-teal-500">
                     <Wind size={14} />
                   </div>
                   <span className="font-black text-zinc-900 dark:text-zinc-50 text-sm">{prediction.weather_current.wind_speed} <span className="text-[10px]">km/h</span></span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-zinc-500/10 rounded-lg text-zinc-500">
                     <Cloud size={14} />
                   </div>
                   <span className="font-black text-zinc-900 dark:text-zinc-50 text-sm">{prediction.weather_current.precipitation} <span className="text-[10px]">mm</span></span>
                 </div>
               </div>
             ) : (
                <div className="text-xs text-zinc-400 py-4 text-center font-bold bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">API UNREACHABLE</div>
             )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Stakeholder Context & Intelligence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Dynamic Stakeholder Card */}
        {stakeholder === 'citizen' ? (
          <Card className="col-span-1 md:col-span-1 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
               <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Shield size={14} /> Health Risk Predictor
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-500">Asthma Risk</span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded ${data.health_impact?.asthma_risk === 'High' ? 'bg-red-500 text-white' : 'bg-teal-500 text-white'}`}>
                    {data.health_impact?.asthma_risk}
                  </span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-500">Outdoor Safety</span>
                  <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase">{data.health_impact?.outdoor_safe}</span>
               </div>
               <p className="text-[10px] text-zinc-400 font-medium leading-relaxed italic">
                 *Calculated based on real-time PM2.5 and atmospheric stagnation.
               </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="col-span-1 md:col-span-1 border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-2">
               <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Cpu size={14} /> IoT Sensor Network
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                     <span className="text-[10px] font-bold text-zinc-500">ZONE_ALPHA_01</span>
                  </div>
                  <span className="text-[10px] font-black text-zinc-300">ACTIVE</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                     <span className="text-[10px] font-bold text-zinc-500">ZONE_BETA_02</span>
                  </div>
                  <span className="text-[10px] font-black text-zinc-300">ACTIVE</span>
               </div>
               <div className="flex items-center justify-between opacity-50">
                  <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                     <span className="text-[10px] font-bold text-zinc-500">ZONE_GAMMA_03</span>
                  </div>
                  <span className="text-[10px] font-black text-zinc-500">MAINTENANCE</span>
               </div>
            </CardContent>
          </Card>
        )}

        <Card className="col-span-1 md:col-span-2 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white transition-colors duration-300">
           <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Strategic Outlook</CardTitle>
           </CardHeader>
           <CardContent>
              <div className="flex items-center gap-6">
                 <div className="p-4 bg-primary/10 rounded-2xl">
                    <Activity className="text-primary" size={32} />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Neural Forecast Confidence: 94.2%</p>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Current dispersion models suggest that targeted traffic restrictions between 18:00 - 20:00 will provide maximum ROI for AQI reduction.</p>
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>

      {/* Report Options Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                 <h2 className="text-xl font-black tracking-tight">Report Configuration</h2>
                 <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <X size={20} />
                 </button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Select Mode</label>
                    <div className="grid grid-cols-2 gap-4">
                       <button 
                         onClick={() => setReportMode('executive')}
                         className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                           reportMode === 'executive' ? 'border-primary bg-primary/5' : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200'
                         }`}
                       >
                         <FileText className={reportMode === 'executive' ? 'text-primary' : 'text-zinc-400'} size={24} />
                         <span className="text-xs font-bold uppercase">Executive</span>
                       </button>
                       <button 
                         onClick={() => setReportMode('detailed')}
                         className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                           reportMode === 'detailed' ? 'border-primary bg-primary/5' : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200'
                         }`}
                       >
                         <ShieldCheck className={reportMode === 'detailed' ? 'text-primary' : 'text-zinc-400'} size={24} />
                         <span className="text-xs font-bold uppercase">Detailed</span>
                       </button>
                    </div>
                 </div>
                 
                 <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase leading-relaxed">
                       {reportMode === 'executive' 
                         ? "Summarized insights focusing on high-level trends and immediate risks." 
                         : "Full scientific dossier including pollutant ratios and temporal roadmaps."}
                    </p>
                 </div>

                 <button 
                   onClick={() => {
                     window.open(`${API_BASE_URL}/api/report?lat=${location.lat}&lon=${location.lon}&city=${location.name}&mode=${reportMode}`);
                     setShowReportModal(false);
                   }}
                   className="w-full py-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-2xl text-sm font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
                 >
                   Generate Intelligence Report
                 </button>
              </div>
           </div>
        </div>
      )}
      {prediction?.action_timeline && (
        <Card className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white overflow-hidden transition-colors duration-300">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                  <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                     <Activity size={14} className="text-primary" /> Forecasted Actions
                  </CardTitle>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">24-Hour AI Scheduled Interventions</p>
               </div>
               <div className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/30">
                 Live Monitoring Active
               </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex overflow-x-auto pb-4 gap-6 scrollbar-hide no-scrollbar">
              {prediction.action_timeline.map((item: any, i: number) => (
                <div key={i} className="min-w-[240px] flex-shrink-0 relative group">
                  {i < prediction.action_timeline.length - 1 && (
                    <div className="absolute top-[26px] right-[-12px] w-[24px] h-px bg-zinc-800 hidden md:block" />
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-[10px] font-black text-primary">
                      {item.time}
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      item.impact === 'High' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {item.impact}
                    </div>
                  </div>
                  <div className="p-4 bg-zinc-100/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800 transition-colors">
                    <h5 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">{item.action}</h5>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{item.sector} Strategy</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">AQI History (Last 24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full mt-4">
              <ResponsiveContainer width="100%" height={320} minWidth={0}>
                <AreaChart data={data.history}>
                  <defs>
                    <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-zinc-800" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: '700' }}
                  />
                  <Area type="monotone" dataKey="aqi" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAqi)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-zinc-50 dark:bg-zinc-900/50 border-none">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">72h Forecast</CardTitle>
              <div className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-[8px] px-2 py-1 rounded-full font-black tracking-widest uppercase">
                CONFIDENCE: {prediction.confidence_score}%
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2">AQI Summary</span>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-relaxed">{prediction.trend_insight}</p>
              </div>

              {prediction.activity_recommendation && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <Wind size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Activity Advice</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{prediction.activity_recommendation}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {prediction.forecast.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 hover:bg-white dark:hover:bg-zinc-900 rounded-xl transition-colors border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 group">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{item.time}</span>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.expected_aqi > 150 ? 'bg-red-500' : item.expected_aqi > 100 ? 'bg-orange-500' : 'bg-teal-500'}`} />
                      <span className={`text-sm font-black tabular-nums ${item.expected_aqi > 150 ? 'text-red-500' : item.expected_aqi > 100 ? 'text-orange-500' : 'text-teal-500'}`}>
                        {item.expected_aqi} AQI
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isPoor && (
        <div className="bg-red-500 text-white rounded-signature p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl shadow-red-500/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex gap-6 items-start">
            <div className="p-3 bg-white/20 rounded-2xl">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h4 className="text-xl font-black uppercase tracking-tight">{profile.conditions.length > 0 ? 'Health Guardian Alert' : 'Critical Atmosphere Detected'}</h4>
              <p className="text-sm font-medium mt-1 opacity-90 max-w-xl">
                {profile.conditions.includes('asthma') || profile.conditions.includes('copd') 
                   ? 'Critical Risk: Your respiratory profile indicates severe vulnerability at current levels. Emergency indoor protocols advised.' 
                   : `Recommended Action: ${data.current_aqi > 200 ? 'Cease all outdoor activities immediately. Activate high-efficiency air filtration.' : 'Industrial throttle initiated. Public transport encouraged.'}`}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="w-full md:w-auto text-xs font-black uppercase tracking-widest bg-white dark:bg-zinc-900 text-red-500 px-8 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
          >
            Update Profile
          </button>
        </div>
      )}
      <HealthProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};

export default DashboardPage;

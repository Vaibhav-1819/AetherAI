import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AnimatedNumber } from '../components/ui/animated-number';
import { EmptyState } from '../components/EmptyState';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { AlertTriangle, Info, Cloud, Droplets, Wind, Thermometer, User, Download, Pin, WifiOff } from 'lucide-react';
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

  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

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
    setLastUpdated(new Date().toLocaleTimeString());
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
        setLastUpdated(new Date().toLocaleTimeString());
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
    <div className="container mx-auto px-4 py-8">
      {/* Status Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        <div className="flex items-center gap-2">
          {isOffline ? (
            <div className="flex items-center gap-2 text-orange-500">
              <WifiOff size={12} /> Offline Mode - Viewing Cached Data
            </div>
          ) : (
            <div className="flex items-center gap-2 text-teal-500">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" /> Live System Connected
            </div>
          )}
        </div>
        <div>Last Updated: {lastUpdated}</div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{location.name} Air Quality</h1>
          <p className="text-muted-foreground mt-1">Real-time metrics and 72-hour AI forecast</p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <button
            onClick={pinCity}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors"
          >
            <Pin size={16} /> Pin
          </button>
          <button
            onClick={() => window.open(`${API_BASE_URL}/api/report?lat=${location.lat}&lon=${location.lon}&city=${location.name}`)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors"
          >
            <Download size={16} /> Report
          </button>
          <CitySearch onSelectCity={handleSelectCity} currentCity={location.name} />
        </div>
      </div>

      {isPoor && (
        <div className="bg-amber-500/15 border border-amber-500/50 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-amber-900 dark:text-amber-200">
          <div className="flex gap-4 items-start">
            <AlertTriangle className="mt-0.5 shrink-0" size={20} />
            <div>
              <h4 className="font-semibold">{profile.conditions.length > 0 ? 'Personal Health Risk Detected' : 'Poor AQI Detected'}</h4>
              <p className="text-sm mt-1">
                {profile.conditions.includes('asthma') || profile.conditions.includes('copd') 
                  ? 'As a respiratory patient, even moderate AQI is high risk. Remain indoors and use air purification.' 
                  : `Recommended Action: ${data.current_aqi > 200 ? 'Avoid all outdoor activities.' : 'Reduce traffic by 30% and monitor industrial emissions.'}`}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="text-xs font-bold uppercase tracking-widest bg-amber-500/20 px-4 py-2 rounded-xl border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
          >
            Adjust Profile
          </button>
        </div>
      )}

      <HealthProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="col-span-1 md:col-span-1 relative overflow-hidden">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Live Sensor
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground w-max">Current AQI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-5xl font-bold ${isPoor ? 'text-red-500' : 'text-amber-500'}`}><AnimatedNumber value={data.current_aqi} /></div>
            <p className={`text-sm font-medium mt-2 ${isPoor ? 'text-red-700' : 'text-amber-700'}`}>
              {isPoor ? 'Unhealthy' : 'Moderate / Sensitive'}
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Info size={16} /> Pollutant Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold">{data.breakdown.pm25}</div>
              <div className="text-sm text-muted-foreground">PM2.5 (µg/m³)</div>
              <div className="w-full bg-secondary h-2 mt-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full" style={{width: `${Math.min(100, data.breakdown.pm25)}%`}}></div>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">{data.breakdown.pm10}</div>
              <div className="text-sm text-muted-foreground">PM10 (µg/m³)</div>
              <div className="w-full bg-secondary h-2 mt-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full" style={{width: `${Math.min(100, data.breakdown.pm10 / 2)}%`}}></div>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">{data.breakdown.no2}</div>
              <div className="text-sm text-muted-foreground">NO2 (ppb)</div>
              <div className="w-full bg-secondary h-2 mt-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full" style={{width: `${Math.min(100, data.breakdown.no2 * 2)}%`}}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
               <Cloud size={16} /> Live Weather
            </CardTitle>
          </CardHeader>
          <CardContent>
             {prediction?.weather_current ? (
               <div className="grid grid-cols-2 gap-4 mt-2">
                 <div className="flex items-center gap-2 text-muted-foreground">
                   <Thermometer size={20} className="text-orange-500" />
                   <span className="font-bold text-foreground text-[15px]">{prediction.weather_current.temperature}&deg;</span>
                 </div>
                 <div className="flex items-center gap-2 text-muted-foreground">
                   <Droplets size={18} className="text-blue-500" />
                   <span className="font-bold text-foreground text-[15px]">{prediction.weather_current.humidity}%</span>
                 </div>
                 <div className="flex items-center gap-2 text-muted-foreground">
                   <Wind size={18} className="text-teal-500" />
                   <span className="font-bold text-foreground text-[15px]">{prediction.weather_current.wind_speed} <span className="text-[10px]">km/h</span></span>
                 </div>
                 <div className="flex items-center gap-2 text-muted-foreground">
                   <Cloud size={18} className="text-gray-400" />
                   <span className="font-bold text-foreground text-[15px]">{prediction.weather_current.precipitation} <span className="text-[10px]">mm</span></span>
                 </div>
               </div>
             ) : (
                <div className="text-sm text-muted-foreground py-4 text-center font-medium bg-muted/30 rounded-lg">API Unreachable</div>
             )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>AQI History (Last 24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.history}>
                  <defs>
                    <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Area type="monotone" dataKey="aqi" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorAqi)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>72h Forecast</CardTitle>
              <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium dark:bg-green-900/30 dark:text-green-400 tracking-wide">
                Prediction Confidence: {prediction.confidence_score}%
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="border-l-2 border-primary pl-4 text-sm font-medium text-muted-foreground">
                <span className="text-primary font-bold">Decision Intel:</span> {prediction.trend_insight}
              </div>

              {prediction.activity_recommendation && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
                  <div className="bg-primary rounded-lg p-2 text-primary-foreground">
                    <Wind size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-primary/70">AI Recommendation</p>
                    <p className="text-sm font-bold">{prediction.activity_recommendation}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {prediction.forecast.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center bg-muted/50 p-3 rounded-xl border border-border">
                    <span className="font-medium text-muted-foreground">{item.time}</span>
                    <span className={`font-bold ${item.expected_aqi > 150 ? 'text-red-500' : item.expected_aqi > 100 ? 'text-amber-500' : 'text-green-500'}`}>
                      {item.expected_aqi} AQI
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default DashboardPage;

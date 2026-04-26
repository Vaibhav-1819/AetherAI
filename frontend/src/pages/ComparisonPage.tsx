import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { MapPin, Trash2, ArrowUpRight, ArrowDownRight, Layers, Construction, Car, Factory } from 'lucide-react';
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { API_BASE_URL } from '../lib/utils';
import { Heart, Globe } from 'lucide-react';

interface PinnedCity {
  name: string;
  lat: number;
  lon: number;
}

const ComparisonPage = () => {
  const [pinnedCities, setPinnedCities] = useState<PinnedCity[]>([]);
  const [cityData, setCityData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('aetherai_pinned_cities');
    if (saved) {
      const cities = JSON.parse(saved);
      setPinnedCities(cities);
      fetchAllCityData(cities);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAllCityData = async (cities: PinnedCity[]) => {
    setLoading(true);
    const dataMap: Record<string, any> = {};
    
    await Promise.all(cities.map(async (city) => {
      try {
        const [data, predict] = await Promise.all([
          fetch(`${API_BASE_URL}/api/data?lat=${city.lat}&lon=${city.lon}`).then(r => r.json()),
          fetch(`${API_BASE_URL}/api/predict?lat=${city.lat}&lon=${city.lon}`).then(r => r.json())
        ]);
        dataMap[city.name] = { ...data.data, ...predict.data };
      } catch (err) {
        console.error(`Failed to fetch for ${city.name}`, err);
      }
    }));

    setCityData(dataMap);
    setLoading(false);
  };

  const removeCity = (name: string) => {
    const updated = pinnedCities.filter(c => c.name !== name);
    setPinnedCities(updated);
    localStorage.setItem('aetherai_pinned_cities', JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto" />
          <div className="h-4 w-64 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">City Comparison</h1>
          <p className="text-muted-foreground mt-2">Side-by-side environmental analysis of your pinned locations.</p>
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800">
          {pinnedCities.length} / 3 Cities Pinned
        </div>
      </div>

      {pinnedCities.length > 0 && (
        <Card className="mb-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 overflow-hidden transition-colors duration-300">
           <div className="grid grid-cols-1 lg:grid-cols-4">
              <div className="p-8 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50">
                 <div className="flex items-center gap-2 mb-4">
                    <Globe className="text-primary" size={20} />
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Global Context</h3>
                 </div>
                 <div className="space-y-6">
                    <div>
                       <p className="text-xs text-zinc-500 font-bold uppercase mb-1">Avg. Pinned AQI</p>
                       <p className="text-4xl font-black text-zinc-900 dark:text-white">
                          {Math.round(Object.values(cityData).reduce((acc, curr) => acc + curr.current_aqi, 0) / (Object.values(cityData).length || 1))}
                       </p>
                    </div>
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Intelligence Insight</p>
                       <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {pinnedCities.length > 1 ? `Comparison reveals a ${Math.max(...Object.values(cityData).map(d => d.current_aqi)) - Math.min(...Object.values(cityData).map(d => d.current_aqi))} point variance across your monitored zones.` : 'Add more cities to unlock cross-regional variance analysis.'}
                       </p>
                    </div>
                 </div>
              </div>
              <div className="lg:col-span-3 p-8">
                 <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">Relative Air Quality Index</h3>
                 <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                       <BarChart data={pinnedCities.map(c => ({ name: c.name, aqi: cityData[c.name]?.current_aqi || 0 }))}>
                          <XAxis dataKey="name" stroke="#52525b" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)' }}
                            cursor={{ fill: 'var(--muted)' }}
                          />
                          <Bar dataKey="aqi" radius={[8, 8, 0, 0]} barSize={40}>
                             {pinnedCities.map((_, index) => (
                               <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : index === 1 ? '#f97316' : '#f59e0b'} />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
        </Card>
      )}

      {pinnedCities.length === 0 ? (
        <Card className="border-dashed py-20 text-center bg-zinc-100/50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800">
          <CardContent>
            <Layers size={48} className="mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-500">No cities pinned for comparison.</p>
            <p className="text-xs text-zinc-600 mt-1">Add cities from the Dashboard to see them here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {pinnedCities.map((city) => {
            const data = cityData[city.name];
            if (!data) return null;

            return (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                layout
              >
                <Card className="h-full bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 relative group overflow-hidden transition-colors duration-300">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => removeCity(city.name)}
                      className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={14} className="text-primary" />
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Regional Context</span>
                    </div>
                    <CardTitle className="text-2xl font-bold">{city.name}</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* AQI Score */}
                    <div className="flex items-end gap-3">
                      <div className="text-6xl font-bold tracking-tighter text-zinc-900 dark:text-white">
                        {data.current_aqi}
                      </div>
                      <div className="mb-2">
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          data.current_aqi > 100 ? 'bg-red-500 text-white' : 'bg-teal-500 text-white'
                        }`}>
                          {data.current_aqi > 100 ? 'Hazardous' : 'Stable'}
                        </div>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-zinc-100 dark:bg-zinc-800/50 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700/50">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">PM2.5</div>
                        <div className="text-sm font-bold">{data.breakdown.pm25}</div>
                      </div>
                      <div className="bg-zinc-100 dark:bg-zinc-800/50 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700/50">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">NO2</div>
                        <div className="text-sm font-bold">{data.breakdown.no2}</div>
                      </div>
                      <div className="bg-zinc-100 dark:bg-zinc-800/50 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700/50 flex flex-col items-center justify-center">
                        <Heart size={14} className={data.current_aqi > 150 ? 'text-red-500' : 'text-teal-500'} />
                        <div className="text-[10px] font-black uppercase mt-1">
                          {data.current_aqi > 150 ? 'Risk' : 'Safe'}
                        </div>
                      </div>
                    </div>

                    {/* Dominant Signature */}
                    <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                       <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Dominant Signature</h4>
                       <div className="flex gap-2">
                          <div className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-2 ${
                            data.signature_trend?.[0]?.traffic > 40 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-zinc-100 dark:bg-zinc-800/20 border-zinc-200 dark:border-zinc-800'
                          }`}>
                            <Car size={18} className={data.signature_trend?.[0]?.traffic > 40 ? 'text-blue-400' : 'text-zinc-600'} />
                            <span className="text-[10px] font-bold text-zinc-500">Traffic</span>
                          </div>
                          <div className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-2 ${
                            data.signature_trend?.[0]?.industrial > 40 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-zinc-100 dark:bg-zinc-800/20 border-zinc-200 dark:border-zinc-800'
                          }`}>
                            <Factory size={18} className={data.signature_trend?.[0]?.industrial > 40 ? 'text-orange-400' : 'text-zinc-600'} />
                            <span className="text-[10px] font-bold text-zinc-500">Industry</span>
                          </div>
                          <div className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-2 ${
                            data.signature_trend?.[0]?.construction > 40 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-zinc-100 dark:bg-zinc-800/20 border-zinc-200 dark:border-zinc-800'
                          }`}>
                            <Construction size={18} className={data.signature_trend?.[0]?.construction > 40 ? 'text-amber-400' : 'text-zinc-600'} />
                            <span className="text-[10px] font-bold text-zinc-500">Urban</span>
                          </div>
                       </div>
                    </div>

                    {/* Mini Forecast Chart */}
                    <div className="h-24 w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <AreaChart data={data.signature_trend}>
                          <Area type="monotone" dataKey="traffic" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                          <Area type="monotone" dataKey="industrial" stroke="#f97316" fill="#f97316" fillOpacity={0.2} strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                      <span>72h Forecast Trend</span>
                      <div className="flex items-center gap-1">
                        {data.current_aqi > 100 ? <ArrowUpRight size={12} className="text-red-500" /> : <ArrowDownRight size={12} className="text-teal-500" />}
                        {data.trend_insight?.includes('falling') ? 'Improving' : 'Degrading'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ComparisonPage;

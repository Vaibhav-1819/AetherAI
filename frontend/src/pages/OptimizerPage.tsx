import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ShieldAlert, ArrowRight, ShieldCheck, Settings, CheckCircle, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { EmptyState } from '../components/EmptyState';
import { HealthProfileModal } from '../components/HealthProfileModal';
import { API_BASE_URL } from '../lib/utils';

const OptimizerPage = () => {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [featureImportance, setFeatureImportance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [precautions, setPrecautions] = useState<string[]>([]);
  const [weatherInsight, setWeatherInsight] = useState<string>("");
  const [primarySource, setPrimarySource] = useState<string>("");
  const [signature, setSignature] = useState<any>(null);
  const [signatureTrend, setSignatureTrend] = useState<any[]>([]);
  const [actionTimeline, setActionTimeline] = useState<any[]>([]);
  const [location] = useState(() => {
    const saved = localStorage.getItem('aetherai_location');
    return saved ? JSON.parse(saved) : { name: 'New Delhi', lat: 28.61, lon: 77.20 };
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/api/optimize?lat=${location.lat}&lon=${location.lon}`, { method: 'POST' }).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/predict?lat=${location.lat}&lon=${location.lon}`).then(r => r.json())
    ]).then(([optData, predData]) => {
      setStrategies(optData.data.strategies);
      setWeatherInsight(optData.data.weather_insight);
      setPrimarySource(optData.data.primary_source);
      setSignature(optData.data.chemical_signature);
      if (predData.data.signature_trend) {
        setSignatureTrend(predData.data.signature_trend);
      }
      if (predData.data.action_timeline) {
        setActionTimeline(predData.data.action_timeline);
      }
      if (predData.data.feature_importance) {
        setFeatureImportance(predData.data.feature_importance);
      }
      if (predData.data.precautions) {
        setPrecautions(predData.data.precautions);
      }
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, [location]);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo('.container > *',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', clearProps: 'all' }
      );
    }
  }, [loading]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 animate-pulse text-xl text-center">Crunching impact models...</div>;
  }

  if (strategies.length === 0) {
    return <EmptyState title="No Strategies Generated" message="The AI optimizer could not analyze the current data. Please ensure the backend is serving the optimizer route." />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AetherAI Optimizer: {location.name}</h1>
        <p className="text-muted-foreground mt-1">AI-driven strategy recommendations based on predicted AQI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="md:col-span-2 space-y-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Settings className="text-primary" /> Generated Optimal Strategy
          </h3>

          {strategies.slice(0, 1).map((strategy, i) => (
            <Card key={i} className="border-2 border-primary/40 bg-primary/5 hover:border-primary/80 transition-colors group">
              <CardContent className="p-6">
                <div className="flex flex-col xl:flex-row justify-between xl:items-start gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-1 rounded-full">
                        {strategy.type}
                      </span>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${strategy.effectiveness === 'HIGH' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                        }`}>
                        Effectiveness: {strategy.effectiveness}
                      </span>
                    </div>
                    <h4 className="text-3xl font-bold text-foreground mb-4">{strategy.name}</h4>
                    
                    <div className="bg-card border rounded-xl p-4 mb-6 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l"></div>
                       <h5 className="font-bold text-sm uppercase tracking-wider mb-2 text-muted-foreground flex items-center gap-2"><ArrowRight size={14} className="text-primary"/> Recommended Actions</h5>
                       <ul className="space-y-2">
                         {strategy.recommended_actions?.map((action: string, j: number) => (
                           <li key={j} className="flex items-start gap-2 text-sm font-medium">
                             <CheckCircle size={16} className="text-primary mt-0.5 shrink-0" />
                             {action}
                           </li>
                         ))}
                       </ul>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                       <div className="bg-muted p-3 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Traffic</p>
                          <p className="text-xl font-black text-blue-500">-{strategy.sliders?.traffic}%</p>
                       </div>
                       <div className="bg-muted p-3 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Industry</p>
                          <p className="text-xl font-black text-orange-500">-{strategy.sliders?.industry}%</p>
                       </div>
                       <div className="bg-muted p-3 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Build</p>
                          <p className="text-xl font-black text-amber-500">-{strategy.sliders?.construction}%</p>
                       </div>
                    </div>

                  </div>

                  <div className="text-center shrink-0 bg-background p-6 rounded-2xl border-2 shadow-sm min-w-[220px]">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Estimated Drop</p>
                    <div className="text-6xl font-black text-green-500 tracking-tighter">-{strategy.expectedDrop}</div>
                    <p className="text-xs text-muted-foreground font-medium mt-1 mb-6">AQI Index Points</p>
                    <a href="/simulator" className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95">
                      Open in Simulator <ArrowRight size={16} />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {signatureTrend.length > 0 && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity size={20} className="text-teal-400" /> Sector Dominance Forecast
                </CardTitle>
                <p className="text-xs text-zinc-500 font-medium">Predicting the shifting dominance of pollution sources over the next 72 hours.</p>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] min-h-[280px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={signatureTrend} stackOffset="expand">
                      <XAxis dataKey="time" fontSize={10} axisLine={false} tickLine={false} interval={2} stroke="#52525b" />
                      <YAxis hide />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                      />
                      <Area type="monotone" dataKey="traffic" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Vehicular" />
                      <Area type="monotone" dataKey="industrial" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.6} name="Industrial" />
                      <Area type="monotone" dataKey="construction" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Particulate" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-between gap-2 px-2">
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-[10px] text-zinc-400 font-bold uppercase">Traffic</span></div>
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div><span className="text-[10px] text-zinc-400 font-bold uppercase">Industry</span></div>
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-[10px] text-zinc-400 font-bold uppercase">Urban</span></div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3">
               <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-blue-500/20">
                 <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Intelligence Active
               </div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <ShieldAlert size={20} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-bold">Aether Intelligence</h3>
              </div>
              <div className="space-y-4">
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Our neural optimization engine has analyzed <span className="text-white font-medium">{location.name}'s</span> current atmospheric context.
                </p>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-sm italic text-zinc-300">
                  "{weatherInsight || "Atmospheric conditions are stable, focusing on chemical pollutant signatures."}"
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Strategy priority is currently driven by <span className="text-white font-medium">{featureImportance[0]?.name || "particulate matter"}</span> concentrations, which accounts for <span className="text-white font-medium">{featureImportance[0]?.value || "45"}%</span> of the predicted AQI spike.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="text-red-500" /> Public Precautions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {precautions.length > 0 ? (
                <ul className="space-y-2">
                  {precautions.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground font-medium">
                       <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></span> {p}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground">No active health warnings.</div>
              )}
            </CardContent>
          </Card>

          {signature && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                   <Activity className="text-teal-400" size={18} /> Real-Time Signature
                </CardTitle>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Chemical Breakdown</p>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                       <span className="text-zinc-400">Industrial</span>
                       <span className="text-zinc-100">{signature.industrial}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, signature.industrial * 20)}%` }}
                          className="h-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                       />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                       <span className="text-zinc-400">Vehicular</span>
                       <span className="text-zinc-100">{signature.traffic}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, signature.traffic * 20)}%` }}
                          className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                       />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                       <span className="text-zinc-400">Particulate</span>
                       <span className="text-zinc-100">{signature.construction}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, signature.construction * 20)}%` }}
                          className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                       />
                    </div>
                 </div>
                 <p className="text-[10px] text-zinc-500 mt-4 leading-tight italic">
                    *Source identification powered by synergistic chemical ratio analysis.
                 </p>
              </CardContent>
            </Card>
          )}

          {featureImportance.length > 0 && (
            <Card className="bg-zinc-900 border-zinc-800 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <ShieldCheck size={80} />
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 italic">
                  <ShieldCheck className="text-primary" size={18} /> Neural Decision Weights
                </CardTitle>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Relative Feature Impact</p>
              </CardHeader>
              <CardContent className="space-y-5">
                 {featureImportance.map((f, i) => (
                   <div key={i} className="space-y-1.5">
                      <div className="flex justify-between items-end">
                         <span className="text-xs font-bold text-zinc-300">{f.name}</span>
                         <span className="text-[10px] font-bold text-primary tabular-nums">{f.value}%</span>
                      </div>
                      <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden border border-white/5">
                         <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${f.value}%` }}
                            transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                            className="h-full bg-gradient-to-r from-primary/30 to-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]"
                         />
                      </div>
                   </div>
                 ))}
                 <div className="pt-4 mt-2 border-t border-zinc-800/50">
                    <p className="text-[10px] text-zinc-500 leading-tight italic">
                       *Neural weights are calculated by correlating pollutant-to-threshold ratios with meteorological dispersion models.
                    </p>
                 </div>
              </CardContent>
            </Card>
          )}
          {actionTimeline.length > 0 && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                   <Activity size={18} className="text-primary" /> Temporal Action Roadmap
                </CardTitle>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">24-Hour AI Scheduled Interventions</p>
              </CardHeader>
              <CardContent>
                 <div className="relative border-l border-zinc-800 ml-2 space-y-6 pb-2">
                    {actionTimeline.map((item, i) => (
                       <div key={i} className="relative pl-6">
                          <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                          <div className="flex justify-between items-start">
                             <div>
                                <span className="text-[10px] font-bold text-zinc-500 tabular-nums">{item.time}</span>
                                <h5 className="text-xs font-bold text-zinc-200 mt-0.5">{item.action}</h5>
                                <p className="text-[10px] text-zinc-500 mt-1">{item.sector} Strategy</p>
                             </div>
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                               item.impact === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                             }`}>
                                {item.impact} Impact
                             </span>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
};

export default OptimizerPage;

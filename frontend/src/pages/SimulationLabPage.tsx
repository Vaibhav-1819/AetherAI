import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Slider } from '../components/ui/slider';
import { AnimatedNumber } from '../components/ui/animated-number';
import { EmptyState } from '../components/EmptyState';
import { Activity, Car, Factory, HardHat, RefreshCw, RotateCcw, Leaf, Zap, Cloud } from 'lucide-react';
import { API_BASE_URL } from '../lib/utils';

const SimulationLabPage = () => {
  const [traffic, setTraffic] = useState([0]);
  const [industry, setIndustry] = useState([0]);
  const [construction, setConstruction] = useState([0]);
  const [greenery, setGreenery] = useState([0]);
  const [energy, setEnergy] = useState([0]);
  
  const [baseAqi, setBaseAqi] = useState(0);
  const [newAqi, setNewAqi] = useState(0);
  const [improvement, setImprovement] = useState(0);
  const [isSimulating, setIsSimulating] = useState(true);
  
  const [strategyA, setStrategyA] = useState<any>(null);
  const [strategyB, setStrategyB] = useState<any>(null);
  const [weatherInsight, setWeatherInsight] = useState("");
  const locationState = useLocation().state;
  const [location] = useState(() => {
    const saved = localStorage.getItem('aetherai_location');
    return saved ? JSON.parse(saved) : { name: 'New Delhi', lat: 28.61, lon: 77.20 };
  });

  // Apply state from Optimizer if available
  useEffect(() => {
    if (locationState) {
      if (locationState.traffic !== undefined) setTraffic([locationState.traffic]);
      if (locationState.industry !== undefined) setIndustry([locationState.industry]);
      if (locationState.construction !== undefined) setConstruction([locationState.construction]);
      if (locationState.greenery !== undefined) setGreenery([locationState.greenery]);
      if (locationState.energy !== undefined) setEnergy([locationState.energy]);
    }
  }, [locationState]);

  // Fetch initial base AQI
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/data?lat=${location.lat}&lon=${location.lon}`)
      .then(res => res.json())
      .then(data => {
        setBaseAqi(data.data.current_aqi);
        setNewAqi(data.data.current_aqi);
        setIsSimulating(false);
      })
      .catch(() => setIsSimulating(false));
  }, []);

  useEffect(() => {
    gsap.fromTo('.container > *',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', clearProps: 'all' }
    );
  }, []);

  useEffect(() => {
    if (baseAqi === 0) return;
    
    setIsSimulating(true);
    const timeout = setTimeout(() => {
      fetch(`${API_BASE_URL}/api/simulate?lat=${location.lat}&lon=${location.lon}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traffic: traffic[0],
          industry: industry[0],
          construction: construction[0],
          greenery: greenery[0],
          energy: energy[0]
        })
      })
      .then(res => res.json())
      .then(data => {
        setNewAqi(data.data.recalculated_aqi);
        setImprovement(data.data.improvement);
        if (data.data.weather_insight) setWeatherInsight(data.data.weather_insight);
        setIsSimulating(false);
      });
    }, 400); // debounce API calls
    
    return () => clearTimeout(timeout);
  }, [traffic, industry, construction, greenery, energy, baseAqi]);

  const applyPreset = (t: number, i: number, c: number, g: number = 0, e: number = 0) => {
    setTraffic([t]);
    setIndustry([i]);
    setConstruction([c]);
    setGreenery([g]);
    setEnergy([e]);
  };

  const aqiColor = newAqi > 200 ? 'text-red-500' : newAqi > 100 ? 'text-amber-500' : 'text-green-500';

  if (baseAqi === 0 && !isSimulating) {
    return <EmptyState title="Simulator Offline" message="The simulation engine requires baseline AQI data to function properly." />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight mb-2">AQI Simulator: {location.name}</h1>
      <p className="text-muted-foreground mb-8">Adjust control parameters to see real-time impact on City AQI.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 font-medium">
                    <Car className="text-blue-500" size={20} /> Traffic Reduction
                  </div>
                  <span className="font-bold">{traffic[0]}%</span>
                </div>
                <Slider value={traffic} onValueChange={setTraffic} max={100} step={1} />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 font-medium">
                    <Factory className="text-orange-500" size={20} /> Industrial Control
                  </div>
                  <span className="font-bold">{industry[0]}%</span>
                </div>
                <Slider value={industry} onValueChange={setIndustry} max={100} step={1} />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 font-medium">
                    <HardHat className="text-amber-700" size={20} /> Construction Halt
                  </div>
                  <span className="font-bold">{construction[0]}%</span>
                </div>
                <Slider value={construction} onValueChange={setConstruction} max={100} step={1} />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 font-medium">
                    <Leaf className="text-green-500" size={20} /> Urban Greenery
                  </div>
                  <span className="font-bold">{greenery[0]}%</span>
                </div>
                <Slider value={greenery} onValueChange={setGreenery} max={100} step={1} />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 font-medium">
                    <Zap className="text-yellow-500" size={20} /> Renewable Shift
                  </div>
                  <span className="font-bold">{energy[0]}%</span>
                </div>
                <Slider value={energy} onValueChange={setEnergy} max={100} step={1} />
              </div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Presets</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <button onClick={() => applyPreset(0, 0, 0)} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-1">
                <RotateCcw size={14} /> Reset
              </button>
              <button onClick={() => applyPreset(60, 50, 100)} className="px-4 py-2 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm font-medium hover:bg-red-200 transition-colors">
                Strict Control
              </button>
              <button onClick={() => applyPreset(30, 20, 50)} className="px-4 py-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-sm font-medium hover:bg-amber-200 transition-colors">
                Moderate
              </button>
              <button onClick={() => applyPreset(10, 0, 0)} className="px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium hover:bg-green-200 transition-colors">
                Minimal
              </button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="h-full border-2 overflow-hidden relative">
            {isSimulating && (
               <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                 <RefreshCw className="animate-spin text-primary" size={32} />
               </div>
            )}
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center justify-between">
                Real-Time Outlook
                <Activity className="text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex flex-col items-center justify-center h-[calc(100%-73px)] space-y-8">
              
              <div className="text-center">
                <p className="text-muted-foreground font-medium mb-2">Base predicted AQI</p>
                <div className="text-4xl font-bold text-muted-foreground/60 line-through decoration-red-500/50"><AnimatedNumber value={baseAqi} /></div>
              </div>

              <div className="w-full h-px bg-border my-4 relative">
                <div className="absolute inset-x-0 -top-3 text-center">
                  <span className="bg-card px-4 text-sm font-bold text-muted-foreground border rounded-full">Results In</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-muted-foreground font-medium mb-4 flex flex-col gap-1 items-center">
                  <span>Simulated AQI</span> 
                  {weatherInsight && <span className="text-[10px] text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">(Weather-Adjusted)</span>}
                </p>
                <div className={`text-7xl font-extrabold tracking-tighter transition-colors duration-500 ${aqiColor}`}>
                  <AnimatedNumber value={newAqi} />
                </div>
                
                <div className="mt-4 flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center justify-center gap-2 text-green-500 font-bold bg-green-500/10 px-4 py-2 rounded-full w-fit">
                    Improvement: -<AnimatedNumber value={improvement} /> AQI
                  </div>
                  <div className="text-[11px] font-bold text-muted-foreground bg-secondary px-3 py-1 rounded-full uppercase tracking-wider">
                    Strategy Effectiveness: {improvement > baseAqi * 0.3 ? 'HIGH' : improvement > baseAqi * 0.15 ? 'MEDIUM' : 'LOW'} ({Math.round((improvement / (baseAqi || 1)) * 100)}%)
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={() => setStrategyA({ aqi: newAqi, drop: improvement, t: traffic[0], i: industry[0], c: construction[0] })} className="px-4 py-2 border-2 border-primary/20 text-primary hover:bg-primary/10 rounded-full font-bold text-sm transition-colors">Save as A</button>
                  <button onClick={() => setStrategyB({ aqi: newAqi, drop: improvement, t: traffic[0], i: industry[0], c: construction[0] })} className="px-4 py-2 border-2 border-primary/20 text-primary hover:bg-primary/10 rounded-full font-bold text-sm transition-colors">Save as B</button>
                </div>
              </div>

              { weatherInsight && (
                <div className="w-full mt-6 p-4 border border-amber-500/30 bg-amber-500/10 rounded-xl flex items-start gap-3">
                   <Cloud className="text-amber-500 shrink-0 mt-0.5" size={20} />
                   <p className="text-sm text-amber-800 dark:text-amber-300 font-medium leading-snug">
                     <span className="font-bold uppercase tracking-wider text-xs mr-2">Weather Context:</span><br/>
                     {weatherInsight}
                   </p>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

      </div>

      {(strategyA || strategyB) && (
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-bold tracking-tight">Compare Scenarios</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                 {strategyA ? (
                   <div className="flex justify-between items-center">
                     <div>
                       <h4 className="font-bold text-lg mb-1">Strategy A</h4>
                       <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Car size={14} /> -{strategyA.t}% <Factory size={14} /> -{strategyA.i}% <HardHat size={14} /> -{strategyA.c}%
                       </p>
                     </div>
                     <div className="text-right">
                       <span className="text-3xl font-black text-green-500">-{strategyA.drop}</span>
                       <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">AQI Drop</p>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center text-muted-foreground py-4 font-medium">Save a parameter setup to Slot A</div>
                 )}
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                 {strategyB ? (
                   <div className="flex justify-between items-center">
                     <div>
                       <h4 className="font-bold text-lg mb-1">Strategy B</h4>
                       <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Car size={14} /> -{strategyB.t}% <Factory size={14} /> -{strategyB.i}% <HardHat size={14} /> -{strategyB.c}%
                       </p>
                     </div>
                     <div className="text-right">
                       <span className="text-3xl font-black text-green-500">-{strategyB.drop}</span>
                       <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">AQI Drop</p>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center text-muted-foreground py-4 font-medium">Save a parameter setup to Slot B</div>
                 )}
              </CardContent>
            </Card>
          </div>
          
          {strategyA && strategyB && (
            <div className="mt-4 text-center p-4 bg-primary/10 text-primary border border-primary/20 rounded-xl">
               <span className="font-bold uppercase tracking-wider text-sm">Decision Engine Insight:</span> <br/>
               Strategy <span className="font-black">{strategyA.drop > strategyB.drop ? 'A' : (strategyA.drop < strategyB.drop ? 'B' : 'A and B')}</span> yields a superior return by <span className="font-bold underline">{Math.abs(strategyA.drop - strategyB.drop)}</span> additional AQI points compared to the alternative.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimulationLabPage;

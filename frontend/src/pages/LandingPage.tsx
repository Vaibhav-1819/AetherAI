import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, Leaf, Activity, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Entrance
      gsap.from(titleRef.current, { y: 50, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.2 });
      gsap.from(subtitleRef.current, { y: 30, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.4 });
      gsap.from(ctaRef.current, { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.6 });
      
      // Floating cards
      if (cardsRef.current) {
        gsap.from(cardsRef.current.children, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out',
          delay: 0.8
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4 text-center max-w-4xl pt-20 pb-32">
        <h1 ref={titleRef} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Intelligent Pollution Control <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
            Powered by AI
          </span>
        </h1>
        
        <p ref={subtitleRef} className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Predict AQI spikes before they happen and simulate the impact of traffic and industrial controls in real-time.
        </p>
        
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/simulator" className="px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/25">
            Launch Simulation Lab <ArrowRight size={20} />
          </Link>
          <Link to="/dashboard" className="px-8 py-4 border bg-card text-card-foreground rounded-full text-lg font-semibold hover:bg-accent hover:text-accent-foreground transition-all">
            View Live Dashboard
          </Link>
        </div>

        {/* Feature Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 text-left">
          <div className="p-6 rounded-3xl bg-card border shadow-sm flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Activity size={24} />
            </div>
            <h3 className="text-xl font-semibold">Predictive Engine</h3>
            <p className="text-muted-foreground">XGBoost-powered model forecasting AQI for the next 72 hours with confidence intervals.</p>
          </div>
          <div className="p-6 rounded-3xl bg-card border shadow-sm flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Leaf size={24} />
            </div>
            <h3 className="text-xl font-semibold">Policy Simulation</h3>
            <p className="text-muted-foreground">Test Odd-Even rules and industrial restrictions dynamically with instant feedback.</p>
          </div>
          <div className="p-6 rounded-3xl bg-card border shadow-sm flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-semibold">Actionable Alerts</h3>
            <p className="text-muted-foreground">Receive dynamic strategy recommendations when Severe AQI is detected.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

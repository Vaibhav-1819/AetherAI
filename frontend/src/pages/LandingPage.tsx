import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Leaf, Activity, ShieldCheck, Globe, ChevronRight, Play, Wind, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-content > *', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
      });

      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: '.features-grid',
          start: 'top 85%',
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-x-hidden min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4">
        <div className="container mx-auto max-w-5xl text-center hero-content">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Air Quality Platform v2.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-zinc-900 dark:text-white">
            Better air quality for <br className="hidden md:block" /> 
            <span className="text-blue-500">healthier cities.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Monitor real-time pollution levels, forecast future air quality, and test city-wide control measures with our advanced simulation tools.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
              View Dashboard <ChevronRight size={18} />
            </Link>
            <Link to="/simulator" className="w-full sm:w-auto px-8 py-4 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
              <Play size={16} fill="currentColor" /> Try Simulator
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-zinc-50 dark:bg-zinc-900/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 features-grid">
            <div className="feature-card p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 mb-6">
                <Wind size={24} />
              </div>
              <h4 className="text-xl font-bold mb-3">Live Monitoring</h4>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Access real-time AQI data and detailed pollutant breakdowns for over 10,000 cities worldwide.</p>
            </div>

            <div className="feature-card p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 transition-all">
              <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500 mb-6">
                <BarChart size={24} />
              </div>
              <h4 className="text-xl font-bold mb-3">AQI Forecasts</h4>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">View 72-hour air quality predictions to plan your outdoor activities and public health responses.</p>
            </div>

            <div className="feature-card p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 mb-6">
                <Activity size={24} />
              </div>
              <h4 className="text-xl font-bold mb-3">Strategy Testing</h4>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">Simulate how traffic restrictions and industrial controls impact air quality in your specific location.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-100 dark:border-zinc-900">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-500 text-xs font-bold uppercase tracking-widest">
           <div>AetherAI &copy; 2026. All rights reserved.</div>
           <div className="flex gap-8">
              <a href="#" className="hover:text-blue-500 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Terms</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Documentation</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

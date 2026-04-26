import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import SimulationLabPage from './pages/SimulationLabPage';
import OptimizerPage from './pages/OptimizerPage';
import { ThemeProvider } from './components/ThemeProvider';
import { ModeToggle } from './components/ModeToggle';
import { Footer } from './components/Footer';
import { AskAether } from './components/AskAether';

import { Activity, Settings, Layers } from 'lucide-react';
import ComparisonPage from './pages/ComparisonPage';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="aether-ui-theme">
      <Router>
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
        <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold tracking-tighter">
              Aether<span className="text-primary">AI</span>
            </Link>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:text-primary transition-colors">
                  <Activity size={18} /> Dashboard
                </Link>
                <Link to="/simulator" className="text-sm font-medium hover:text-primary transition-colors">Simulation Lab</Link>
                <Link to="/optimizer" className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:text-primary transition-colors">
                  <Settings size={18} /> Optimizer
                </Link>
                <Link to="/compare" className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:text-primary transition-colors">
                  <Layers size={18} /> Compare
                </Link>
              </div>
              <div className="h-5 w-px bg-border"></div>
              <ModeToggle />
            </div>
          </div>
        </nav>
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/simulator" element={<SimulationLabPage />} />
            <Route path="/optimizer" element={<OptimizerPage />} />
            <Route path="/compare" element={<ComparisonPage />} />
          </Routes>
        </main>
        <Footer />
        <AskAether />
      </div>
    </Router>
    </ThemeProvider>
  );
}

export default App;

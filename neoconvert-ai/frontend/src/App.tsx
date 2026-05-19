import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Globe, Rocket, Map, Bot, Activity, Atom, Shield, Zap, LogOut, User, Plane, Wallet, Receipt, Accessibility, Globe2 } from 'lucide-react';
import MainConverter from './components/MainConverter';
import AIFinancialTwin from './components/AIFinancialTwin';
import UniversalValueIndex from './components/UniversalValueIndex';
import SpaceEconomy from './components/SpaceEconomy';
import RealitySimulation from './components/RealitySimulation';
import AutonomousAgent from './components/AutonomousAgent';
import BioAdaptive from './components/BioAdaptive';
import QuantumPrediction from './components/QuantumPrediction';
import EthicalAnalysis from './components/EthicalAnalysis';
import TravelMode from './components/TravelMode';
import CostOfLiving from './components/CostOfLiving';
import ReceiptSplit from './components/ReceiptSplit';
import AccessibilityMode from './components/AccessibilityMode';
import CurrencyMap from './components/CurrencyMap';
import Hero from './components/Hero';
import Login from './components/Login';
import Register from './components/Register';
import FloatingAssistant from './components/FloatingAssistant';
import axios from 'axios';

export type AppMode = 'converter' | 'twin' | 'universal' | 'space' | 'reality' | 'agent' | 'bio' | 'quantum' | 'ethical' | 'travel' | 'costofliving' | 'receiptsplit' | 'accessibility' | 'currencymap';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('converter');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    // Check if user is authenticated on load
    checkAuth();
    
    // Check for OAuth callback in URL
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const error = urlParams.get('error');
    
    if (authStatus === 'success') {
      window.history.replaceState({}, document.title, window.location.pathname);
      // Wait a moment for session to be saved before checking auth
      setTimeout(() => checkAuth(), 500);
    } else if (error) {
      console.error('OAuth error:', error);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user', { withCredentials: true });
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleRegister = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showRegister ? (
      <Register onRegister={handleRegister} onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  const modes = [
    { id: 'converter' as AppMode, label: 'Convert', icon: Zap, color: 'from-cyber-cyan to-cyber-purple' },
    { id: 'twin' as AppMode, label: 'AI Twin', icon: Brain, color: 'from-purple-500 to-pink-500' },
    { id: 'universal' as AppMode, label: 'Value Index', icon: Globe, color: 'from-green-500 to-cyan-500' },
    { id: 'space' as AppMode, label: 'Space', icon: Rocket, color: 'from-blue-500 to-purple-500' },
    { id: 'reality' as AppMode, label: 'Reality', icon: Map, color: 'from-orange-500 to-red-500' },
    { id: 'agent' as AppMode, label: 'Agent', icon: Bot, color: 'from-cyber-purple to-cyber-pink' },
    { id: 'bio' as AppMode, label: 'Bio', icon: Activity, color: 'from-rose-500 to-pink-500' },
    { id: 'quantum' as AppMode, label: 'Quantum', icon: Atom, color: 'from-violet-500 to-purple-500' },
    { id: 'ethical' as AppMode, label: 'Ethical', icon: Shield, color: 'from-emerald-500 to-teal-500' },
    { id: 'travel' as AppMode, label: 'Travel', icon: Plane, color: 'from-sky-500 to-blue-500' },
    { id: 'costofliving' as AppMode, label: 'Cost Living', icon: Wallet, color: 'from-amber-500 to-orange-500' },
    { id: 'receiptsplit' as AppMode, label: 'Split Bill', icon: Receipt, color: 'from-pink-500 to-rose-500' },
    { id: 'accessibility' as AppMode, label: 'Accessible', icon: Accessibility, color: 'from-indigo-500 to-purple-500' },
    { id: 'currencymap' as AppMode, label: 'Map', icon: Globe2, color: 'from-teal-500 to-cyan-500' },
  ];

  const renderContent = () => {
    switch (mode) {
      case 'converter': return <MainConverter />;
      case 'twin': return <AIFinancialTwin />;
      case 'universal': return <UniversalValueIndex />;
      case 'space': return <SpaceEconomy />;
      case 'reality': return <RealitySimulation />;
      case 'agent': return <AutonomousAgent />;
      case 'bio': return <BioAdaptive />;
      case 'quantum': return <QuantumPrediction />;
      case 'ethical': return <EthicalAnalysis />;
      case 'travel': return <TravelMode />;
      case 'costofliving': return <CostOfLiving />;
      case 'receiptsplit': return <ReceiptSplit />;
      case 'accessibility': return <AccessibilityMode />;
      case 'currencymap': return <CurrencyMap />;
      default: return <MainConverter />;
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark">
      <Hero />
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2 justify-center flex-1">
              {modes.map((m) => {
                const Icon = m.icon;
                return (
                  <motion.button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      mode === m.id 
                        ? `bg-gradient-to-r ${m.color} text-white shadow-lg` 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{m.label}</span>
                  </motion.button>
                );
              })}
            </div>
            
            {/* User Profile */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
              <div className="flex items-center gap-2">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className="hidden sm:inline text-sm text-gray-300">{user.name}</span>
              </div>
              <motion.button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-5 h-5 text-gray-400 hover:text-red-400" />
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p className="font-display text-lg mb-2">NeoConvert AI</p>
          <p className="text-sm">20 Groundbreaking Features for 2035+ Economies</p>
          <p className="text-xs mt-2 opacity-50">Built for Bengaluru Ideathons | Full-Stack Demo</p>
        </div>
      </footer>

      <FloatingAssistant />
    </div>
  );
};

export default App;

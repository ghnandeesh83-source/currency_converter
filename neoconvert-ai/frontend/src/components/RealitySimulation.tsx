import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, Home, Utensils, Bus, Zap } from 'lucide-react';

const countries = [
  { id: 'usa', name: '🇺🇸 USA', rent: 1500, food: 400, transport: 100, utilities: 150, taxRate: 0.24 },
  { id: 'uk', name: '🇬🇧 UK', rent: 1200, food: 350, transport: 90, utilities: 120, taxRate: 0.20 },
  { id: 'germany', name: '🇩🇪 Germany', rent: 900, food: 300, transport: 80, utilities: 100, taxRate: 0.26 },
  { id: 'japan', name: '🇯🇵 Japan', rent: 800, food: 350, transport: 100, utilities: 110, taxRate: 0.23 },
  { id: 'singapore', name: '🇸🇬 Singapore', rent: 1400, food: 320, transport: 70, utilities: 90, taxRate: 0.22 },
  { id: 'india_bengaluru', name: '🇮🇳 Bengaluru', rent: 300, food: 150, transport: 30, utilities: 40, taxRate: 0.30 },
];

const RealitySimulation: React.FC = () => {
  const [amount, setAmount] = useState('50000');
  const [selectedCountry, setSelectedCountry] = useState('usa');

  const country = countries.find(c => c.id === selectedCountry)!;
  const monthlyTotal = country.rent + country.food + country.transport + country.utilities;
  const tax = parseFloat(amount) * country.taxRate;
  const afterTax = parseFloat(amount) - tax;
  const months = Math.floor(afterTax / monthlyTotal);

  return (
    <div className="space-y-6">
      <div className="cyber-card">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Map className="w-6 h-6 text-orange-400" />
          <span className="neon-text">Reality Simulation Mode</span>
        </h2>
        <p className="text-gray-400 mb-6">Experience living in another country. See how your money translates to lifestyle, rent, food, and duration.</p>

        <div className="flex gap-4 mb-6">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Monthly Income (₹)"
            className="flex-1 px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white"
          />
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white"
          >
            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-gradient-to-r from-orange-900/40 to-red-900/40 rounded-xl border border-orange-500/30">
          <div className="text-center mb-6">
            <p className="text-gray-400">After Tax: ₹{afterTax.toFixed(0)}</p>
            <p className="text-4xl font-bold text-orange-400 mt-2">{months} months</p>
            <p className="text-sm text-gray-500">Sustainable lifestyle</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-black/30 rounded-lg text-center">
              <Home className="w-5 h-5 mx-auto mb-1 text-red-400" />
              <p className="text-xs text-gray-400">Rent</p>
              <p className="font-bold">${country.rent}</p>
            </div>
            <div className="p-3 bg-black/30 rounded-lg text-center">
              <Utensils className="w-5 h-5 mx-auto mb-1 text-green-400" />
              <p className="text-xs text-gray-400">Food</p>
              <p className="font-bold">${country.food}</p>
            </div>
            <div className="p-3 bg-black/30 rounded-lg text-center">
              <Bus className="w-5 h-5 mx-auto mb-1 text-blue-400" />
              <p className="text-xs text-gray-400">Transport</p>
              <p className="font-bold">${country.transport}</p>
            </div>
            <div className="p-3 bg-black/30 rounded-lg text-center">
              <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
              <p className="text-xs text-gray-400">Utilities</p>
              <p className="font-bold">${country.utilities}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RealitySimulation;

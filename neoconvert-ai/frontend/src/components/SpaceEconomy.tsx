import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Planet, Orbit, Star } from 'lucide-react';

const locations = [
  { id: 'earth', name: '🌍 Earth', rate: 1, resource: 'USD', color: 'from-blue-500 to-green-500' },
  { id: 'mars', name: '🔴 Mars Colony', rate: 2.5, resource: 'O2 Units', color: 'from-red-500 to-orange-500' },
  { id: 'moon', name: '🌙 Moon Base', rate: 1.8, resource: 'He-3 Credits', color: 'from-gray-400 to-gray-200' },
  { id: 'titan', name: '🪐 Titan Station', rate: 4.0, resource: 'Hydrocarbon', color: 'from-orange-600 to-yellow-600' },
  { id: 'asteroid', name: '☄️ Asteroid Belt', rate: 3.2, resource: 'Platinum', color: 'from-purple-500 to-pink-500' },
];

const SpaceEconomy: React.FC = () => {
  const [amount, setAmount] = useState('1000');
  const [fromLoc, setFromLoc] = useState('earth');
  const [toLoc, setToLoc] = useState('mars');

  const fromRate = locations.find(l => l.id === fromLoc)?.rate || 1;
  const toRate = locations.find(l => l.id === toLoc)?.rate || 1;
  const convertedAmount = (parseFloat(amount || '0') * fromRate) / toRate;
  const toResource = locations.find(l => l.id === toLoc)?.resource || '';

  return (
    <div className="space-y-6">
      <div className="cyber-card">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Rocket className="w-6 h-6 text-red-400" />
          <span className="neon-text">Space Economy Converter</span>
        </h2>
        <p className="text-gray-400 mb-6">Convert Earth currency to space colony credits. Resource-based valuations for 2035+ interplanetary trade.</p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white text-xl"
          />
          <select
            value={fromLoc}
            onChange={(e) => setFromLoc(e.target.value)}
            className="px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white"
          >
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <select
            value={toLoc}
            onChange={(e) => setToLoc(e.target.value)}
            className="px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white"
          >
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-xl border border-purple-500/30"
        >
          <div className="text-center">
            <p className="text-gray-400 mb-2">Conversion Result</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {convertedAmount.toFixed(2)} {toResource}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Rate: 1 {locations.find(l => l.id === fromLoc)?.resource} = {(toRate/fromRate).toFixed(3)} {toResource}
            </p>
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          {locations.map(loc => (
            <motion.div
              key={loc.id}
              className={`p-3 rounded-lg bg-gradient-to-br ${loc.color} bg-opacity-20 border border-white/10`}
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-xs text-gray-400">{loc.name}</p>
              <p className="text-lg font-bold">{loc.rate}x</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpaceEconomy;

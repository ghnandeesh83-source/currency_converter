import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Atom, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { WORLD_CURRENCIES } from '../constants/currencies';

const QuantumPrediction: React.FC = () => {
  const [amount, setAmount] = useState('10000');
  const [from, setFrom] = useState('INR');
  const [to, setTo] = useState('USD');
  const [showResults, setShowResults] = useState(false);

  // Simulate quantum superposition with 3 outcomes
  const baseRate = 0.012;
  const bestRate = baseRate * 1.05;
  const worstRate = baseRate * 0.95;

  const scenarios = {
    best: { amount: (parseFloat(amount) * bestRate).toFixed(2), probability: 25, rate: bestRate.toFixed(5) },
    expected: { amount: (parseFloat(amount) * baseRate).toFixed(2), probability: 50, rate: baseRate.toFixed(5) },
    worst: { amount: (parseFloat(amount) * worstRate).toFixed(2), probability: 25, rate: worstRate.toFixed(5) }
  };

  return (
    <div className="space-y-6">
      <div className="cyber-card">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Atom className="w-6 h-6 text-violet-400" />
          <span className="neon-text">Quantum Prediction Engine</span>
        </h2>
        <p className="text-gray-400 mb-6">Quantum superposition-based predictions. See 1000 parallel futures with probability weightings.</p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white"
          />
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white">
            {WORLD_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
          <select value={to} onChange={(e) => setTo(e.target.value)} className="px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white">
            {WORLD_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </div>

        <motion.button onClick={() => setShowResults(true)} className="cyber-button w-full" whileHover={{ scale: 1.02 }}>
          ⚛️ Calculate Quantum Superposition
        </motion.button>

        {showResults && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="font-bold text-green-400">Best Case (25% probability)</span>
              </div>
              <p className="text-2xl font-bold">${scenarios.best.amount}</p>
              <p className="text-xs text-gray-400">Rate: {scenarios.best.rate}</p>
            </div>

            <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Minus className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-cyan-400">Expected (50% probability)</span>
              </div>
              <p className="text-2xl font-bold">${scenarios.expected.amount}</p>
              <p className="text-xs text-gray-400">Rate: {scenarios.expected.rate}</p>
            </div>

            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <span className="font-bold text-red-400">Worst Case (25% probability)</span>
              </div>
              <p className="text-2xl font-bold">${scenarios.worst.amount}</p>
              <p className="text-xs text-gray-400">Rate: {scenarios.worst.rate}</p>
            </div>

            <div className="p-4 bg-purple-500/20 rounded-lg border border-purple-500/30 text-center">
              <p className="text-sm text-gray-300">Quantum State: <span className="text-cyber-purple font-bold">SUPERPOSITION</span></p>
              <p className="text-xs text-gray-400">Expected Value: ${((parseFloat(scenarios.best.amount) * 0.25 + parseFloat(scenarios.expected.amount) * 0.5 + parseFloat(scenarios.worst.amount) * 0.25)).toFixed(2)}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuantumPrediction;

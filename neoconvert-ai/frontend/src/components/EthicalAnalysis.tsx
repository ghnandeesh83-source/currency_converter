import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Scale, Leaf, Users, Eye, Award } from 'lucide-react';

const currencies = [
  { id: 'INR', name: 'Indian Rupee', scores: { stability: 85, inclusivity: 70, sustainability: 60, transparency: 75, fairness: 65 } },
  { id: 'USD', name: 'US Dollar', scores: { stability: 90, inclusivity: 65, sustainability: 55, transparency: 80, fairness: 60 } },
  { id: 'EUR', name: 'Euro', scores: { stability: 88, inclusivity: 80, sustainability: 75, transparency: 85, fairness: 78 } },
];

const EthicalAnalysis: React.FC = () => {
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const currency = currencies.find(c => c.id === selectedCurrency)!;
  const overall = Math.round((currency.scores.stability + currency.scores.inclusivity + currency.scores.sustainability + currency.scores.transparency + currency.scores.fairness) / 5);

  const getGrade = (score: number) => {
    if (score >= 80) return { grade: 'A', color: 'text-green-400' };
    if (score >= 70) return { grade: 'B', color: 'text-cyan-400' };
    if (score >= 60) return { grade: 'C', color: 'text-yellow-400' };
    return { grade: 'D', color: 'text-red-400' };
  };

  const grade = getGrade(overall);

  return (
    <div className="space-y-6">
      <div className="cyber-card">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-400" />
          <span className="neon-text">Ethical Currency Analyzer</span>
        </h2>
        <p className="text-gray-400 mb-6">ESG-style scoring for currencies. Evaluate stability, fairness, sustainability, and social impact.</p>

        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white mb-6"
        >
          {currencies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
        </select>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-500/30">
            <Award className="w-12 h-12 text-emerald-400" />
            <div>
              <p className={`text-4xl font-bold ${grade.color}`}>{grade.grade}</p>
              <p className="text-sm text-gray-400">Overall Grade</p>
            </div>
            <div className="border-l border-white/20 pl-4">
              <p className="text-2xl font-bold text-white">{overall}/100</p>
              <p className="text-sm text-gray-400">ESG Score</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(currency.scores).map(([key, score]) => (
            <motion.div
              key={key}
              className="p-3 bg-white/5 rounded-lg text-center border border-white/10"
              whileHover={{ scale: 1.05 }}
            >
              {key === 'stability' && <Scale className="w-4 h-4 mx-auto mb-1 text-blue-400" />}
              {key === 'inclusivity' && <Users className="w-4 h-4 mx-auto mb-1 text-purple-400" />}
              {key === 'sustainability' && <Leaf className="w-4 h-4 mx-auto mb-1 text-green-400" />}
              {key === 'transparency' && <Eye className="w-4 h-4 mx-auto mb-1 text-cyan-400" />}
              {key === 'fairness' && <Shield className="w-4 h-4 mx-auto mb-1 text-yellow-400" />}
              <p className="text-xs text-gray-400 capitalize">{key}</p>
              <p className="text-lg font-bold">{score}</p>
            </motion.div>
          ))}
        </div>

        {currency.scores.sustainability < 60 && (
          <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <p className="text-sm text-yellow-400">⚠️ Recommendation: Consider more sustainable currency alternatives</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EthicalAnalysis;

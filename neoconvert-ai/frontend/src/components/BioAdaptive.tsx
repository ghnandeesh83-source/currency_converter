import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, AlertTriangle, Shield } from 'lucide-react';

const BioAdaptive: React.FC = () => {
  const [heartRate, setHeartRate] = useState(75);
  const [stressLevel, setStressLevel] = useState(30);
  const [sleepQuality, setSleepQuality] = useState(7);

  const riskScore = Math.min(100, Math.max(0, 
    (heartRate - 60) * 1.5 + (100 - sleepQuality * 10) + stressLevel
  ));

  const getStatus = () => {
    if (riskScore > 70) return { text: 'HIGH STRESS', color: 'text-red-500', maxTx: '₹1,000' };
    if (riskScore > 40) return { text: 'MODERATE', color: 'text-yellow-400', maxTx: '₹10,000' };
    return { text: 'OPTIMAL', color: 'text-green-400', maxTx: '₹100,000' };
  };

  const status = getStatus();

  return (
    <div className="space-y-6">
      <div className="cyber-card">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-rose-400" />
          <span className="neon-text">Bio-Adaptive System</span>
        </h2>
        <p className="text-gray-400 mb-6">Senses your stress via wearable data. High stress = blocks risky trades. Optimal state = full access.</p>

        <div className="space-y-6 mb-6">
          <div>
            <label className="flex justify-between text-sm mb-2">
              <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-red-400" /> Heart Rate</span>
              <span>{heartRate} BPM</span>
            </label>
            <input
              type="range"
              min="50"
              max="120"
              value={heartRate}
              onChange={(e) => setHeartRate(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="flex justify-between text-sm mb-2">
              <span>Stress Level</span>
              <span>{stressLevel}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={stressLevel}
              onChange={(e) => setStressLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="flex justify-between text-sm mb-2">
              <span>Sleep Quality (hrs)</span>
              <span>{sleepQuality}h</span>
            </label>
            <input
              type="range"
              min="3"
              max="10"
              value={sleepQuality}
              onChange={(e) => setSleepQuality(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <motion.div
          className={`p-6 rounded-xl border ${riskScore > 70 ? 'bg-red-500/20 border-red-500' : riskScore > 40 ? 'bg-yellow-500/20 border-yellow-500' : 'bg-green-500/20 border-green-500'}`}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {riskScore > 70 ? <AlertTriangle className="w-6 h-6 text-red-500" /> : <Shield className="w-6 h-6 text-green-500" />}
              <span className={`text-xl font-bold ${status.color}`}>{status.text}</span>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{riskScore.toFixed(0)}%</p>
              <p className="text-xs text-gray-400">Risk Score</p>
            </div>
          </div>
          <p className="text-sm">Maximum Transaction Allowed: <span className="font-bold text-cyber-cyan">{status.maxTx}</span></p>
          {riskScore > 70 && (
            <p className="text-xs text-red-400 mt-2">⚠️ High stress detected. Large transactions restricted for your financial safety.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BioAdaptive;

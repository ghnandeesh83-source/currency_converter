import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Clock, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const locations = [
  { id: 'bengaluru', name: 'Bengaluru', wage: 85, category: 'IT Hub' },
  { id: 'mumbai', name: 'Mumbai', wage: 75, category: 'Financial' },
  { id: 'delhi', name: 'Delhi', wage: 70, category: 'Capital' },
  { id: 'chennai', name: 'Chennai', wage: 65, category: 'Manufacturing' },
  { id: 'hyderabad', name: 'Hyderabad', wage: 68, category: 'Tech' },
  { id: 'rural_bihar', name: 'Rural Bihar', wage: 25, category: 'Agricultural' },
];

const globalCompare = [
  { country: 'USA (USD)', wage: 1500 },
  { country: 'UK (GBP)', wage: 1200 },
  { country: 'Germany (EUR)', wage: 1100 },
  { country: 'Japan (JPY)', wage: 1000 },
  { country: 'Singapore (SGD)', wage: 1300 },
  { country: 'UAE (AED)', wage: 900 },
  { country: 'Australia (AUD)', wage: 1400 },
  { country: 'Canada (CAD)', wage: 1250 },
  { country: 'South Africa (ZAR)', wage: 450 },
  { country: 'Brazil (BRL)', wage: 500 },
];

const UniversalValueIndex: React.FC = () => {
  const [amount, setAmount] = useState('1000');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/universal/${amount}/bengaluru`);
      setResult(response.data.data);
    } catch (error) {
      // Mock data fallback
      const hours = parseFloat(amount) / 85;
      setResult({
        amount: parseFloat(amount),
        selectedLocation: { hoursRequired: hours.toFixed(1), hourlyWage: 85 },
        allLocations: locations.map(l => ({ city: l.name, hours: (parseFloat(amount) / l.wage).toFixed(1), hourlyWage: l.wage })),
        globalComparison: globalCompare.map(g => ({ country: g.country, hours: (parseFloat(amount) / g.wage).toFixed(1) })),
        insight: `₹${amount} requires ${hours.toFixed(1)} hours in Bengaluru`
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="cyber-card">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Globe className="w-6 h-6 text-green-400" />
          <span className="neon-text">Universal Value Index</span>
        </h2>
        <p className="text-gray-400 mb-6">Convert currency to human effort hours. See true purchasing power across India & the world.</p>

        <div className="flex gap-4 mb-6">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in INR"
            className="flex-1 px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white text-xl"
          />
          <motion.button
            onClick={handleCalculate}
            disabled={loading}
            className="cyber-button"
            whileHover={{ scale: 1.05 }}
          >
            {loading ? 'Calculating...' : 'Calculate Hours'}
          </motion.button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-xl border border-green-500/30">
              <h3 className="text-lg font-semibold mb-2 text-green-400">💡 Key Insight</h3>
              <p className="text-xl">{result.insight}</p>
              <p className="text-sm text-gray-400 mt-2">
                In Bengaluru (₹85/hr), but only {(parseFloat(amount) / 1500).toFixed(1)} hours in USA ($1500/hr avg)
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-black/30 rounded-lg">
                <h4 className="font-semibold mb-3 text-cyber-cyan flex items-center gap-2">
                  <Clock className="w-4 h-4" /> India Comparison
                </h4>
                <div className="space-y-2">
                  {result.allLocations?.map((loc: any) => (
                    <div key={loc.city} className="flex justify-between items-center p-2 bg-white/5 rounded">
                      <span>{loc.city}</span>
                      <span className="font-bold text-cyber-cyan">{loc.hours} hrs</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-black/30 rounded-lg">
                <h4 className="font-semibold mb-3 text-cyber-purple flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Global Currency Comparison
                </h4>
                <div className="space-y-2">
                  {result.globalComparison?.map((g: any) => (
                    <div key={g.country} className="flex justify-between items-center p-2 bg-white/5 rounded">
                      <span>{g.country}</span>
                      <span className="font-bold text-cyber-purple">{g.hours} hrs</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UniversalValueIndex;

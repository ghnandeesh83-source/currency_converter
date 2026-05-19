import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { WORLD_CURRENCIES } from '../constants/currencies';

const API_URL = 'http://localhost:5000/api';

const MainConverter: React.FC = () => {
  const [amount, setAmount] = useState<string>('1000');
  const [from, setFrom] = useState('INR');
  const [to, setTo] = useState('USD');
  const [mode, setMode] = useState('earth');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timePeriod, setTimePeriod] = useState('1M');
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  const currencies = WORLD_CURRENCIES;
  const spaceLocations = ['mars', 'moon', 'titan', 'asteroid'];

  const generateHistoricalData = (period: string) => {
    const data: any[] = [];
    const baseRate = from === 'USD' && to === 'EUR' ? 0.9259 : 0.85;
    const now = new Date();
    
    let points = 7;
    let daysPerPoint = 1;
    
    switch (period) {
      case '1W': points = 7; daysPerPoint = 1; break;
      case '1M': points = 30; daysPerPoint = 1; break;
      case '3M': points = 90; daysPerPoint = 1; break;
      case '6M': points = 180; daysPerPoint = 1; break;
      case '1Y': points = 12; daysPerPoint = 30; break;
    }
    
    for (let i = points; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * daysPerPoint));
      const variation = (Math.random() - 0.5) * 0.05;
      const rate = baseRate + variation;
      
      data.push({
        date: period === '1Y' 
          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rate: parseFloat(rate.toFixed(4))
      });
    }
    
    return data;
  };

  useEffect(() => {
    setHistoricalData(generateHistoricalData(timePeriod));
  }, [from, to, timePeriod]);

  const currentRate = historicalData[historicalData.length - 1]?.rate || 0.9259;
  const previousRate = historicalData[historicalData.length - 2]?.rate || 0.9285;
  const change = ((currentRate - previousRate) / previousRate) * 100;
  const high = Math.max(...historicalData.map(d => d.rate));
  const low = Math.min(...historicalData.map(d => d.rate));

  const handleConvert = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/convert`, {
        from,
        to,
        amount: parseFloat(amount),
        mode
      });
      setResult(response.data.data);
    } catch (error) {
      console.error('Conversion error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="cyber-card">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-cyber-cyan" />
          <span className="neon-text">Quantum Converter</span>
        </h2>

        <div className="flex gap-2 mb-6">
          {['earth', 'space', 'quantum'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                mode === m
                  ? 'bg-gradient-to-r from-cyber-cyan to-cyber-purple text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {m === 'earth' ? '🌍 Earth' : m === 'space' ? '🚀 Space' : '⚛️ Quantum'}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Amount (₹ default)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white text-xl"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">From</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white"
            >
              {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">To</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white"
            >
              {mode === 'space' 
                ? spaceLocations.map((loc) => <option key={loc} value={loc}>{loc}</option>)
                : currencies.map((c) => <option key={c} value={c}>{c}</option>)
              }
            </select>
          </div>
        </div>

        <motion.button onClick={handleConvert} disabled={loading} className="cyber-button w-full" whileHover={{ scale: 1.02 }}>
          {loading ? 'Processing...' : '✨ Execute Conversion'}
        </motion.button>

        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-6 bg-gradient-to-r from-cyber-purple/20 to-cyber-cyan/20 rounded-xl">
            <div className="grid md:grid-cols-2 gap-6">
              <div><p className="text-gray-400 text-sm">Original</p><p className="text-2xl font-bold">{result.original.amount} {result.original.currency}</p></div>
              <div><p className="text-gray-400 text-sm">Converted</p><p className="text-2xl font-bold text-cyber-cyan">{result.converted.amount} {result.converted.currency}</p></div>
            </div>
          </motion.div>
        )}

        {/* Historical Exchange Rate Graph */}
        {mode === 'earth' && historicalData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="mt-6 cyber-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                Historical Exchange Rate
                <span className="text-sm text-gray-400">{from} → {to}</span>
              </h3>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-black/30 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Current Rate</p>
                <p className="text-lg font-bold text-cyber-cyan">{currentRate.toFixed(4)}</p>
              </div>
              <div className="bg-black/30 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Change</p>
                <p className={`text-lg font-bold flex items-center gap-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {change.toFixed(2)}%
                </p>
              </div>
              <div className="bg-black/30 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">High</p>
                <p className="text-lg font-bold">{high.toFixed(4)}</p>
              </div>
              <div className="bg-black/30 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Low</p>
                <p className="text-lg font-bold">{low.toFixed(4)}</p>
              </div>
            </div>

            {/* Time Period Buttons */}
            <div className="flex gap-2 mb-4">
              {['1W', '1M', '3M', '6M', '1Y'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    timePeriod === period
                      ? 'bg-gradient-to-r from-cyber-cyan to-cyber-purple text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Graph */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <XAxis 
                    dataKey="date" 
                    stroke="#666"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#666"
                    style={{ fontSize: '12px' }}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0a0a0f', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#00d4ff" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: '#00d4ff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MainConverter;

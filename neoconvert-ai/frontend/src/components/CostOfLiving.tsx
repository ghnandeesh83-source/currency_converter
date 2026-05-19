import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Utensils, Car, ShoppingBag, Coffee, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface CostData {
  rent: number;
  food: number;
  transport: number;
  shopping: number;
  entertainment: number;
  total: number;
}

const countryCostData: Record<string, CostData> = {
  usa: { rent: 1500, food: 500, transport: 200, shopping: 300, entertainment: 200, total: 2700 },
  uk: { rent: 1200, food: 400, transport: 150, shopping: 250, entertainment: 150, total: 2150 },
  germany: { rent: 900, food: 350, transport: 120, shopping: 200, entertainment: 130, total: 1700 },
  japan: { rent: 800, food: 400, transport: 150, shopping: 250, entertainment: 150, total: 1750 },
  singapore: { rent: 1400, food: 350, transport: 100, shopping: 200, entertainment: 150, total: 2200 },
  india: { rent: 300, food: 150, transport: 50, shopping: 100, entertainment: 50, total: 650 }
};

const CostOfLiving: React.FC = () => {
  const [fromCountry, setFromCountry] = useState('india');
  const [toCountry, setToCountry] = useState('usa');
  const [salary, setSalary] = useState<number>(50000);
  const [convertedSalary, setConvertedSalary] = useState<number>(0);
  const [fromCost, setFromCost] = useState<CostData>(countryCostData.india);
  const [toCost, setToCost] = useState<CostData>(countryCostData.usa);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/convert`, {
        from: 'INR',
        to: 'USD',
        amount: salary,
        mode: 'earth'
      });
      
      const converted = response.data.data.converted.amount;
      setConvertedSalary(converted);
      setFromCost(countryCostData[fromCountry]);
      setToCost(countryCostData[toCountry]);
    } catch (error) {
      console.error('Conversion error:', error);
    }
    setLoading(false);
  };

  const purchasingPower = (convertedSalary / toCost.total) * 100;
  const lifestyleChange = purchasingPower - 100;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-cyber-cyan" />
          <span className="neon-text">Cost of Living Converter</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Current Country</label>
            <select
              value={fromCountry}
              onChange={(e) => setFromCountry(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white"
            >
              <option value="india">India</option>
              <option value="usa">USA</option>
              <option value="uk">UK</option>
              <option value="germany">Germany</option>
              <option value="japan">Japan</option>
              <option value="singapore">Singapore</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Target Country</label>
            <select
              value={toCountry}
              onChange={(e) => setToCountry(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white"
            >
              <option value="usa">USA</option>
              <option value="uk">UK</option>
              <option value="germany">Germany</option>
              <option value="japan">Japan</option>
              <option value="singapore">Singapore</option>
              <option value="india">India</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-2">Monthly Salary (INR)</label>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white text-xl"
            />
          </div>
        </div>

        <motion.button
          onClick={calculate}
          disabled={loading}
          className="cyber-button w-full"
          whileHover={{ scale: 1.02 }}
        >
          {loading ? 'Calculating...' : '💰 Calculate Lifestyle Cost'}
        </motion.button>
      </motion.div>

      {convertedSalary > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Purchasing Power Summary */}
          <div className="cyber-card p-6">
            <h3 className="text-xl font-bold mb-4">Lifestyle Comparison</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-black/30 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Current Salary</p>
                <p className="text-2xl font-bold">₹{salary.toLocaleString()}</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Converted Salary</p>
                <p className="text-2xl font-bold text-cyber-cyan">${convertedSalary.toFixed(2)}</p>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-cyber-purple/20 to-cyber-cyan/20 rounded-lg">
              <p className="font-bold mb-2">Purchasing Power: {purchasingPower.toFixed(0)}%</p>
              <p className={`flex items-center gap-2 ${lifestyleChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {lifestyleChange >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {lifestyleChange >= 0 ? 'Better lifestyle' : 'Tighter budget'} ({Math.abs(lifestyleChange).toFixed(0)}%)
              </p>
            </div>
          </div>

          {/* Cost Breakdown Comparison */}
          <div className="cyber-card p-6">
            <h3 className="text-xl font-bold mb-4">Monthly Cost Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-cyber-purple" />
                  <span>Rent</span>
                </div>
                <div className="text-right">
                  <p className="text-gray-400">{fromCountry.toUpperCase()}: ${fromCost.rent}</p>
                  <p className="text-cyber-cyan font-bold">{toCountry.toUpperCase()}: ${toCost.rent}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Utensils className="w-5 h-5 text-cyber-purple" />
                  <span>Food</span>
                </div>
                <div className="text-right">
                  <p className="text-gray-400">{fromCountry.toUpperCase()}: ${fromCost.food}</p>
                  <p className="text-cyber-cyan font-bold">{toCountry.toUpperCase()}: ${toCost.food}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-cyber-purple" />
                  <span>Transport</span>
                </div>
                <div className="text-right">
                  <p className="text-gray-400">{fromCountry.toUpperCase()}: ${fromCost.transport}</p>
                  <p className="text-cyber-cyan font-bold">{toCountry.toUpperCase()}: ${toCost.transport}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-cyber-purple" />
                  <span>Shopping</span>
                </div>
                <div className="text-right">
                  <p className="text-gray-400">{fromCountry.toUpperCase()}: ${fromCost.shopping}</p>
                  <p className="text-cyber-cyan font-bold">{toCountry.toUpperCase()}: ${toCost.shopping}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Coffee className="w-5 h-5 text-cyber-purple" />
                  <span>Entertainment</span>
                </div>
                <div className="text-right">
                  <p className="text-gray-400">{fromCountry.toUpperCase()}: ${fromCost.entertainment}</p>
                  <p className="text-cyber-cyan font-bold">{toCountry.toUpperCase()}: ${toCost.entertainment}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gradient-to-r from-cyber-cyan/20 to-cyber-purple/20 rounded-lg flex justify-between">
              <span className="font-bold">Total Monthly Cost</span>
              <div className="text-right">
                <p className="text-gray-400">{fromCountry.toUpperCase()}: ${fromCost.total}</p>
                <p className="text-cyber-cyan font-bold">{toCountry.toUpperCase()}: ${toCost.total}</p>
              </div>
            </div>
          </div>

          {/* Lifestyle Insight */}
          <div className="cyber-card p-6">
            <h3 className="text-xl font-bold mb-4">Lifestyle Insight</h3>
            <div className="bg-black/30 p-4 rounded-lg">
              <p className="text-gray-300">
                With your salary of <span className="text-cyber-cyan font-bold">${convertedSalary.toFixed(2)}</span> in {toCountry.toUpperCase()},
                you can afford {purchasingPower.toFixed(0)}% of the standard lifestyle.
                {lifestyleChange >= 0 
                  ? ' You will have a better lifestyle compared to your current location.'
                  : ' You may need to adjust your budget to maintain your current lifestyle.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CostOfLiving;

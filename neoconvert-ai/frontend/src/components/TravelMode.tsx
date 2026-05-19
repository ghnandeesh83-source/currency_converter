import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, MapPin, Wallet, Coffee, Hotel, Car, Utensils, Info } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface CountryData {
  name: string;
  currency: string;
  flag: string;
  avgDailyExpense: number;
  tips: string[];
  culturalInfo: string;
}

const countryData: Record<string, CountryData> = {
  usa: {
    name: 'United States',
    currency: 'USD',
    flag: '🇺🇸',
    avgDailyExpense: 150,
    tips: ['Tip 15-20% at restaurants', 'Sales tax added at checkout', 'Credit cards widely accepted'],
    culturalInfo: 'Tipping is expected in most service industries. Sales tax varies by state (0-10%).'
  },
  uk: {
    name: 'United Kingdom',
    currency: 'GBP',
    flag: '🇬🇧',
    avgDailyExpense: 120,
    tips: ['Tip 10-15% if service not included', 'VAT included in prices', 'Contactless payments common'],
    culturalInfo: 'Tipping is discretionary. VAT (20%) is included in displayed prices.'
  },
  japan: {
    name: 'Japan',
    currency: 'JPY',
    flag: '🇯🇵',
    avgDailyExpense: 100,
    tips: ['Tipping not customary', 'Cash still widely used', 'Convenience stores everywhere'],
    culturalInfo: 'Tipping can be considered rude. Carry cash as some places dont accept cards.'
  },
  germany: {
    name: 'Germany',
    currency: 'EUR',
    flag: '🇩🇪',
    avgDailyExpense: 110,
    tips: ['Round up to nearest euro', 'Cash preferred in small shops', 'Punctuality important'],
    culturalInfo: 'Tipping is done by rounding up. Germans value punctuality and precision.'
  },
  singapore: {
    name: 'Singapore',
    currency: 'SGD',
    flag: '🇸🇬',
    avgDailyExpense: 80,
    tips: ['Tipping not expected', 'Cards accepted everywhere', 'Clean and efficient'],
    culturalInfo: 'Tipping is not part of the culture. The city is extremely clean and efficient.'
  },
  uae: {
    name: 'United Arab Emirates',
    currency: 'AED',
    flag: '🇦🇪',
    avgDailyExpense: 100,
    tips: ['Tipping 10% appreciated', 'Luxury shopping', 'Friday-Saturday weekend'],
    culturalInfo: 'Friday and Saturday are the weekend. Dress modestly in public areas.'
  }
};

const TravelMode: React.FC = () => {
  const [fromCurrency, setFromCurrency] = useState('INR');
  const [destination, setDestination] = useState('usa');
  const [budget, setBudget] = useState<number>(50000);
  const [days, setDays] = useState<number>(7);
  const [convertedBudget, setConvertedBudget] = useState<number>(0);
  const [dailyBudget, setDailyBudget] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const calculateBudget = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/convert`, {
        from: fromCurrency,
        to: countryData[destination].currency,
        amount: budget,
        mode: 'earth'
      });
      
      const converted = response.data.data.converted.amount;
      setConvertedBudget(converted);
      setDailyBudget(converted / days);
    } catch (error) {
      console.error('Conversion error:', error);
    }
    setLoading(false);
  };

  const country = countryData[destination];
  const budgetStatus = dailyBudget >= country.avgDailyExpense ? 'sufficient' : 'tight';
  const budgetColor = budgetStatus === 'sufficient' ? 'text-green-400' : 'text-yellow-400';

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Plane className="w-6 h-6 text-cyber-cyan" />
          <span className="neon-text">Travel Mode</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Your Currency</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Destination</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white"
            >
              {Object.entries(countryData).map(([key, data]) => (
                <option key={key} value={key}>
                  {data.flag} {data.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Budget ({fromCurrency})</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white text-xl"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Trip Duration (Days)</label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white text-xl"
            />
          </div>
        </div>

        <motion.button
          onClick={calculateBudget}
          disabled={loading}
          className="cyber-button w-full"
          whileHover={{ scale: 1.02 }}
        >
          {loading ? 'Calculating...' : '✈️ Calculate Travel Budget'}
        </motion.button>
      </motion.div>

      {convertedBudget > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Budget Summary */}
          <div className="cyber-card p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-cyber-cyan" />
              Budget Summary
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-black/30 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Total Budget</p>
                <p className="text-2xl font-bold text-cyber-cyan">
                  {convertedBudget.toFixed(2)} {country.currency}
                </p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Daily Budget</p>
                <p className={`text-2xl font-bold ${budgetColor}`}>
                  {dailyBudget.toFixed(2)} {country.currency}
                </p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Avg Daily Cost</p>
                <p className="text-2xl font-bold">
                  {country.avgDailyExpense} {country.currency}
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gradient-to-r from-cyber-purple/20 to-cyber-cyan/20 rounded-lg">
              <p className={`font-bold ${budgetColor}`}>
                {budgetStatus === 'sufficient' ? '✅ Budget is sufficient' : '⚠️ Budget is tight'}
              </p>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="cyber-card p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyber-cyan" />
              Estimated Daily Expenses
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <Hotel className="w-6 h-6 text-cyber-purple mx-auto mb-2" />
                <p className="text-sm text-gray-400">Accommodation</p>
                <p className="font-bold">{(country.avgDailyExpense * 0.4).toFixed(0)} {country.currency}</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <Utensils className="w-6 h-6 text-cyber-purple mx-auto mb-2" />
                <p className="text-sm text-gray-400">Food</p>
                <p className="font-bold">{(country.avgDailyExpense * 0.3).toFixed(0)} {country.currency}</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <Car className="w-6 h-6 text-cyber-purple mx-auto mb-2" />
                <p className="text-sm text-gray-400">Transport</p>
                <p className="font-bold">{(country.avgDailyExpense * 0.2).toFixed(0)} {country.currency}</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <Coffee className="w-6 h-6 text-cyber-purple mx-auto mb-2" />
                <p className="text-sm text-gray-400">Misc</p>
                <p className="font-bold">{(country.avgDailyExpense * 0.1).toFixed(0)} {country.currency}</p>
              </div>
            </div>
          </div>

          {/* Cultural Tips */}
          <div className="cyber-card p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-cyber-cyan" />
              Cultural Tips & Information
            </h3>
            <div className="bg-black/30 p-4 rounded-lg mb-4">
              <p className="text-gray-300">{country.culturalInfo}</p>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-cyber-cyan">💡 Tips:</p>
              {country.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2 text-gray-300">
                  <span className="text-cyber-purple">•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TravelMode;

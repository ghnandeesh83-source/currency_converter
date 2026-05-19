import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Accessibility, Volume2, VolumeX, Type, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { WORLD_CURRENCIES } from '../constants/currencies';

const API_URL = 'http://localhost:5000/api';

const AccessibilityMode: React.FC = () => {
  const [amount, setAmount] = useState<string>('1000');
  const [from, setFrom] = useState('INR');
  const [to, setTo] = useState('USD');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [largeText, setLargeText] = useState(true);
  const [highContrast, setHighContrast] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const currencies = WORLD_CURRENCIES;

  const handleConvert = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/convert`, {
        from,
        to,
        amount: parseFloat(amount),
        mode: 'earth'
      });
      setResult(response.data.data);
      
      if (voiceEnabled) {
        speakText(`Converted ${amount} ${from} to ${response.data.data.converted.amount.toFixed(2)} ${to}`);
      }
    } catch (error) {
      console.error('Conversion error:', error);
    }
    setLoading(false);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const textSize = largeText ? 'text-2xl' : 'text-base';
  const contrastClass = highContrast ? 'bg-white text-black' : 'bg-black/30 text-white';

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`cyber-card p-8 ${highContrast ? 'bg-white border-4 border-black' : ''}`}
      >
        <h2 className={`text-3xl font-bold mb-6 flex items-center gap-2 ${highContrast ? 'text-black' : 'neon-text'}`}>
          <Accessibility className={`w-8 h-8 ${highContrast ? 'text-black' : 'text-cyber-cyan'}`} />
          <span>Accessibility Mode</span>
        </h2>

        {/* Accessibility Controls */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.button
            onClick={() => setLargeText(!largeText)}
            className={`p-4 rounded-lg font-bold flex flex-col items-center gap-2 transition-all ${
              largeText 
                ? 'bg-cyber-cyan text-black' 
                : 'bg-white/10 text-gray-400'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Type className="w-6 h-6" />
            <span className="text-sm">Large Text</span>
          </motion.button>

          <motion.button
            onClick={() => setHighContrast(!highContrast)}
            className={`p-4 rounded-lg font-bold flex flex-col items-center gap-2 transition-all ${
              highContrast 
                ? 'bg-cyber-cyan text-black' 
                : 'bg-white/10 text-gray-400'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {highContrast ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
            <span className="text-sm">High Contrast</span>
          </motion.button>

          <motion.button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-4 rounded-lg font-bold flex flex-col items-center gap-2 transition-all ${
              voiceEnabled 
                ? 'bg-cyber-cyan text-black' 
                : 'bg-white/10 text-gray-400'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {voiceEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            <span className="text-sm">Voice</span>
          </motion.button>
        </div>

        {/* Converter */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className={`block mb-3 font-bold ${highContrast ? 'text-black' : 'text-gray-400'}`}>
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full px-6 py-4 border-4 rounded-lg ${textSize} font-bold ${
                highContrast 
                  ? 'bg-white border-black text-black' 
                  : 'bg-black/30 border-white/10 text-white'
              }`}
            />
          </div>

          <div>
            <label className={`block mb-3 font-bold ${highContrast ? 'text-black' : 'text-gray-400'}`}>
              From
            </label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={`w-full px-6 py-4 border-4 rounded-lg ${textSize} font-bold ${
                highContrast 
                  ? 'bg-white border-black text-black' 
                  : 'bg-black/30 border-white/10 text-white'
              }`}
            >
              {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className={`block mb-3 font-bold ${highContrast ? 'text-black' : 'text-gray-400'}`}>
              To
            </label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={`w-full px-6 py-4 border-4 rounded-lg ${textSize} font-bold ${
                highContrast 
                  ? 'bg-white border-black text-black' 
                  : 'bg-black/30 border-white/10 text-white'
              }`}
            >
              {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <motion.button
          onClick={handleConvert}
          disabled={loading}
          className={`w-full py-6 rounded-xl font-bold ${textSize} transition-all ${
            highContrast 
              ? 'bg-black text-white border-4 border-black' 
              : 'cyber-button'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Processing...' : '🔄 Convert Currency'}
        </motion.button>
      </motion.div>

      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`cyber-card p-8 ${highContrast ? 'bg-black text-white border-4 border-white' : ''}`}
        >
          <h3 className={`text-3xl font-bold mb-6 ${highContrast ? 'text-white' : 'neon-text'}`}>
            Conversion Result
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className={`p-6 rounded-lg border-4 ${highContrast ? 'bg-white text-black border-white' : 'bg-black/30 border-white/10'}`}>
              <p className={`mb-2 font-bold ${highContrast ? 'text-black' : 'text-gray-400'}`}>Original</p>
              <p className={`text-4xl font-bold ${highContrast ? 'text-black' : ''}`}>
                {result.original.amount} {result.original.currency}
              </p>
            </div>
            <div className={`p-6 rounded-lg border-4 ${highContrast ? 'bg-cyber-cyan text-black border-cyber-cyan' : 'bg-gradient-to-r from-cyber-purple/20 to-cyber-cyan/20 border-cyber-cyan/30'}`}>
              <p className={`mb-2 font-bold ${highContrast ? 'text-black' : 'text-gray-400'}`}>Converted</p>
              <p className={`text-4xl font-bold ${highContrast ? 'text-black' : 'text-cyber-cyan'}`}>
                {result.converted.amount.toFixed(2)} {result.converted.currency}
              </p>
            </div>
          </div>

          {voiceEnabled && (
            <motion.button
              onClick={() => speakText(`Converted ${result.original.amount} ${result.original.currency} to ${result.converted.amount.toFixed(2)} ${result.converted.currency}`)}
              className={`mt-6 w-full py-4 rounded-lg font-bold text-xl flex items-center justify-center gap-3 ${
                highContrast 
                  ? 'bg-cyber-cyan text-black border-4 border-black' 
                  : 'bg-cyber-cyan/20 text-cyber-cyan border-2 border-cyber-cyan'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Volume2 className="w-6 h-6" />
              Speak Result
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AccessibilityMode;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe2, DollarSign, Euro, PoundSterling, IndianRupee } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface Country {
  name: string;
  code: string;
  currency: string;
  flag: string;
  rate: number;
  lat: number;
  lon: number;
}

const countries: Country[] = [
  { name: 'United States', code: 'USD', currency: 'USD', flag: 'US', rate: 1, lat: 38.9, lon: -77.03 },
  { name: 'United Kingdom', code: 'GBP', currency: 'GBP', flag: 'GB', rate: 0.79, lat: 51.5, lon: -0.12 },
  { name: 'Germany', code: 'EUR', currency: 'EUR', flag: 'DE', rate: 0.92, lat: 52.52, lon: 13.4 },
  { name: 'Japan', code: 'JPY', currency: 'JPY', flag: 'JP', rate: 149.5, lat: 35.68, lon: 139.69 },
  { name: 'India', code: 'INR', currency: 'INR', flag: 'IN', rate: 83.5, lat: 28.61, lon: 77.2 },
  { name: 'Singapore', code: 'SGD', currency: 'SGD', flag: 'SG', rate: 1.34, lat: 1.29, lon: 103.85 },
  { name: 'Australia', code: 'AUD', currency: 'AUD', flag: 'AU', rate: 1.53, lat: -33.86, lon: 151.2 },
  { name: 'Canada', code: 'CAD', currency: 'CAD', flag: 'CA', rate: 1.36, lat: 45.42, lon: -75.69 },
  { name: 'Brazil', code: 'BRL', currency: 'BRL', flag: 'BR', rate: 5.0, lat: -15.79, lon: -47.88 },
  { name: 'South Africa', code: 'ZAR', currency: 'ZAR', flag: 'ZA', rate: 18.5, lat: -25.74, lon: 28.19 },
];

const CurrencyMap: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [amount, setAmount] = useState<number>(100);
  const [fromCurrency] = useState('USD');
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const defaultMapCenter = { lat: 20, lon: 0 };

  const createEmbedUrl = (lat: number, lon: number) => {
    const delta = 22;
    const left = lon - delta;
    const right = lon + delta;
    const top = lat + delta;
    const bottom = lat - delta;
    const bbox = `${left},${bottom},${right},${top}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  };

  const mapUrl = createEmbedUrl(
    selectedCountry?.lat ?? defaultMapCenter.lat,
    selectedCountry?.lon ?? defaultMapCenter.lon
  );

  const handleCountryClick = async (country: Country) => {
    setSelectedCountry(country);
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/convert`, {
        from: fromCurrency,
        to: country.currency,
        amount,
        mode: 'earth'
      });
      setConvertedAmount(response.data.data.converted.amount);
    } catch (error) {
      console.error('Conversion error:', error);
    }
    setLoading(false);
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'USD': return <DollarSign className="w-4 h-4" />;
      case 'EUR': return <Euro className="w-4 h-4" />;
      case 'GBP': return <PoundSterling className="w-4 h-4" />;
      case 'JPY': return <DollarSign className="w-4 h-4" />;
      case 'INR': return <IndianRupee className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Globe2 className="w-6 h-6 text-cyber-cyan" />
          <span className="neon-text">Currency Map</span>
        </h2>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Amount ({fromCurrency})</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white text-xl"
          />
        </div>

        <div className="rounded-xl overflow-hidden min-h-[420px] border border-white/10 bg-black/20">
          <iframe
            title="OpenStreetMap Currency View"
            src={mapUrl}
            className="w-full h-[420px]"
            loading="lazy"
          />
        </div>

        <p className="text-center text-gray-400 mt-4 text-sm">
          Free map tiles powered by OpenStreetMap. Select a country below to center the map and convert.
        </p>
      </motion.div>

      {selectedCountry && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-card p-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyber-cyan to-cyber-purple flex items-center justify-center text-xl font-bold">
              {selectedCountry.flag}
            </div>
            <div>
              <h3 className="text-2xl font-bold">{selectedCountry.name}</h3>
              <p className="text-gray-400">{selectedCountry.currency}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-black/30 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Original Amount</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                {getCurrencyIcon(fromCurrency)}
                {amount} {fromCurrency}
              </p>
            </div>
            <div className="bg-gradient-to-r from-cyber-purple/20 to-cyber-cyan/20 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Converted Amount</p>
              <p className="text-2xl font-bold text-cyber-cyan flex items-center gap-2">
                {getCurrencyIcon(selectedCountry.currency)}
                {loading ? '...' : convertedAmount.toFixed(2)} {selectedCountry.currency}
              </p>
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Exchange Rate (1 {fromCurrency} = {selectedCountry.rate} {selectedCountry.currency})</p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyber-cyan to-cyber-purple h-2 rounded-full transition-all"
                style={{ width: `${Math.min(selectedCountry.rate / 150 * 100, 100)}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="cyber-card p-6"
      >
        <h3 className="text-xl font-bold mb-4">All Currencies</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {countries.map((country) => (
            <motion.button
              key={country.code}
              onClick={() => handleCountryClick(country)}
              className={`p-3 rounded-lg text-center transition-all ${
                selectedCountry?.code === country.code
                  ? 'bg-cyber-cyan text-black'
                  : 'bg-black/30 text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-xs mb-1 text-gray-400">{country.flag}</div>
              <div className="text-sm font-bold">{country.code}</div>
              <div className="text-xs text-gray-400">{country.currency}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default CurrencyMap;

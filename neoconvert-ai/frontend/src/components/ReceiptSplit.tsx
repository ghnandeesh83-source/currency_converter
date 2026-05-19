import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Users, Plus, Trash2, Divide, Wallet } from 'lucide-react';
import axios from 'axios';
import { WORLD_CURRENCIES } from '../constants/currencies';

import { API_URL } from '../config/api';

interface Person {
  id: string;
  name: string;
  currency: string;
  amount: number;
}

const ReceiptSplit: React.FC = () => {
  const [totalAmount, setTotalAmount] = useState<number>(100);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [people, setPeople] = useState<Person[]>([
    { id: '1', name: 'Person 1', currency: 'USD', amount: 0 },
    { id: '2', name: 'Person 2', currency: 'EUR', amount: 0 }
  ]);
  const [splitResults, setSplitResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const currencies = WORLD_CURRENCIES;

  const addPerson = () => {
    const newPerson: Person = {
      id: Date.now().toString(),
      name: `Person ${people.length + 1}`,
      currency: 'USD',
      amount: 0
    };
    setPeople([...people, newPerson]);
  };

  const removePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
  };

  const updatePerson = (id: string, field: keyof Person, value: string | number) => {
    setPeople(people.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const calculateSplit = async () => {
    setLoading(true);
    try {
      const splitAmount = totalAmount / people.length;
      const results = [];

      for (const person of people) {
        if (person.currency !== baseCurrency) {
          const response = await axios.post(`${API_URL}/convert`, {
            from: baseCurrency,
            to: person.currency,
            amount: splitAmount,
            mode: 'earth'
          });
          results.push({
            ...person,
            baseAmount: splitAmount,
            convertedAmount: response.data.data.converted.amount
          });
        } else {
          results.push({
            ...person,
            baseAmount: splitAmount,
            convertedAmount: splitAmount
          });
        }
      }

      setSplitResults(results);
    } catch (error) {
      console.error('Split calculation error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Receipt className="w-6 h-6 text-cyber-cyan" />
          <span className="neon-text">Receipt Split Converter</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Total Amount</label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(Number(e.target.value))}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white text-xl"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Base Currency</label>
            <select
              value={baseCurrency}
              onChange={(e) => setBaseCurrency(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white"
            >
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-cyber-cyan" />
              People to Split With
            </h3>
            <motion.button
              onClick={addPerson}
              className="flex items-center gap-2 px-4 py-2 bg-cyber-cyan/20 text-cyber-cyan rounded-lg hover:bg-cyber-cyan/30 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              Add Person
            </motion.button>
          </div>

          <div className="space-y-3">
            {people.map((person) => (
              <div key={person.id} className="flex gap-3 items-center bg-black/30 p-3 rounded-lg">
                <input
                  type="text"
                  value={person.name}
                  onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white"
                  placeholder="Name"
                />
                <select
                  value={person.currency}
                  onChange={(e) => updatePerson(person.id, 'currency', e.target.value)}
                  className="px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white"
                >
                  {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {people.length > 2 && (
                  <motion.button
                    onClick={() => removePerson(person.id)}
                    className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            ))}
          </div>
        </div>

        <motion.button
          onClick={calculateSplit}
          disabled={loading}
          className="cyber-button w-full"
          whileHover={{ scale: 1.02 }}
        >
          {loading ? 'Calculating...' : '💰 Calculate Split'}
        </motion.button>
      </motion.div>

      {splitResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="cyber-card p-6"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Divide className="w-5 h-5 text-cyber-cyan" />
            Split Results
          </h3>
          
          <div className="space-y-3">
            {splitResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyber-cyan to-cyber-purple flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold">{result.name}</p>
                    <p className="text-sm text-gray-400">{result.currency}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Base: {result.baseAmount.toFixed(2)} {baseCurrency}</p>
                  <p className="text-xl font-bold text-cyber-cyan">
                    {result.convertedAmount.toFixed(2)} {result.currency}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-cyber-purple/20 to-cyber-cyan/20 rounded-lg">
            <p className="text-center text-gray-300">
              Each person pays <span className="text-cyber-cyan font-bold">{(totalAmount / people.length).toFixed(2)} {baseCurrency}</span> 
              ({people.length} people)
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ReceiptSplit;

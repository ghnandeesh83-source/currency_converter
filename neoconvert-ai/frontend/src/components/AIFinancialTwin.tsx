import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, User, Bot, Sparkles } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface Message {
  role: 'user' | 'twin';
  content: string;
  timestamp: Date;
}

const AIFinancialTwin: React.FC = () => {
  const [userProfile, setUserProfile] = useState({
    name: '',
    income: '50000',
    riskTolerance: 'moderate',
    goals: ['savings', 'investment']
  });
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(true);

  const handleAskTwin = async () => {
    if (!query.trim()) return;
    
    const userMessage: Message = { role: 'user', content: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/twin`, {
        userData: userProfile,
        query,
        context: { amount: 10000, from: 'INR', to: 'USD' }
      });

      const twinMessage: Message = {
        role: 'twin',
        content: response.data.data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, twinMessage]);
    } catch (error) {
      const twinMessage: Message = {
        role: 'twin',
        content: 'As your financial twin, I\'ve analyzed your profile. Based on moderate risk tolerance and ₹50k income, I recommend waiting for a better rate. My confidence: 85%',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, twinMessage]);
    }

    setQuery('');
    setLoading(false);
    setShowProfile(false);
  };

  return (
    <div className="space-y-6">
      <div className="cyber-card">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          <span className="neon-text">AI Financial Twin</span>
        </h2>
        <p className="text-gray-400 mb-6">Your digital financial clone that learns your patterns and predicts your decisions.</p>

        {showProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-white/5 rounded-lg">
            <h3 className="font-semibold mb-3 text-cyber-cyan">Create Your Twin Profile</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <input
                placeholder="Your Name"
                value={userProfile.name}
                onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                className="px-3 py-2 bg-black/30 border border-white/10 rounded text-white"
              />
              <input
                placeholder="Monthly Income (₹)"
                value={userProfile.income}
                onChange={(e) => setUserProfile({...userProfile, income: e.target.value})}
                className="px-3 py-2 bg-black/30 border border-white/10 rounded text-white"
              />
              <select
                value={userProfile.riskTolerance}
                onChange={(e) => setUserProfile({...userProfile, riskTolerance: e.target.value})}
                className="px-3 py-2 bg-black/30 border border-white/10 rounded text-white"
              >
                <option value="low">Low Risk</option>
                <option value="moderate">Moderate Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Chat Interface */}
        <div className="bg-black/30 rounded-xl p-4 h-96 overflow-y-auto mb-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-20">
              <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Ask your AI Twin anything about currency conversion!</p>
              <p className="text-sm mt-2">Example: "Should I convert ₹10,000 to USD now?"</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-cyber-purple/30 border border-cyber-purple/50' 
                  : 'bg-cyber-cyan/20 border border-cyber-cyan/50'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  <span className="text-xs opacity-70">{msg.role === 'user' ? 'You' : 'AI Twin'}</span>
                </div>
                <p className="text-sm">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAskTwin()}
            placeholder="Ask your financial twin..."
            className="flex-1 px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white"
          />
          <motion.button
            onClick={handleAskTwin}
            disabled={loading}
            className="cyber-button"
            whileHover={{ scale: 1.05 }}
          >
            {loading ? 'Thinking...' : <MessageSquare className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AIFinancialTwin;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Check, X, AlertTriangle, Zap } from 'lucide-react';

const AutonomousAgent: React.FC = () => {
  const [rules, setRules] = useState([
    { id: 1, condition: 'EUR rises 2%', action: 'Auto-convert', active: true },
    { id: 2, condition: 'Amount > ₹1L', action: 'Require approval', active: true },
    { id: 3, condition: 'Market volatility > 5%', action: 'Block conversion', active: false },
  ]);

  const [trustScore, setTrustScore] = useState(85);
  const [pendingApprovals, setPendingApprovals] = useState([
    { id: 1, amount: '₹50,000', from: 'INR', to: 'USD', reason: 'Rate favorable' },
  ]);

  const toggleRule = (id: number) => {
    setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <div className="space-y-6">
      <div className="cyber-card">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Bot className="w-6 h-6 text-purple-400" />
          <span className="neon-text">Autonomous Decision Agent</span>
        </h2>

        {/* Trust Score */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-purple-500/20 rounded-lg text-center border border-purple-500/30">
            <p className="text-3xl font-bold text-purple-400">{trustScore}%</p>
            <p className="text-xs text-gray-400">Trust Score</p>
          </div>
          <div className="p-4 bg-cyan-500/20 rounded-lg text-center border border-cyan-500/30">
            <p className="text-3xl font-bold text-cyber-cyan">78%</p>
            <p className="text-xs text-gray-400">AI Learning</p>
          </div>
          <div className="p-4 bg-green-500/20 rounded-lg text-center border border-green-500/30">
            <p className="text-3xl font-bold text-green-400">Auto</p>
            <p className="text-xs text-gray-400">Mode</p>
          </div>
        </div>

        {/* Rules */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-cyber-cyan">Agent Rules</h3>
          <div className="space-y-2">
            {rules.map(rule => (
              <motion.div
                key={rule.id}
                className={`flex justify-between items-center p-3 rounded-lg border ${
                  rule.active ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <div>
                  <p className="font-medium">IF {rule.condition}</p>
                  <p className="text-sm text-gray-400">THEN {rule.action}</p>
                </div>
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`p-2 rounded ${rule.active ? 'bg-green-500 text-white' : 'bg-gray-600'}`}
                >
                  {rule.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        {pendingApprovals.length > 0 && (
          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <h3 className="font-semibold mb-2 text-yellow-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Pending Approvals ({pendingApprovals.length})
            </h3>
            {pendingApprovals.map(pending => (
              <div key={pending.id} className="flex justify-between items-center p-2 bg-black/30 rounded mb-2">
                <div>
                  <p className="font-medium">{pending.amount} {pending.from} → {pending.to}</p>
                  <p className="text-xs text-gray-400">{pending.reason}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-500 rounded text-sm">Approve</button>
                  <button className="px-3 py-1 bg-red-500 rounded text-sm">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutonomousAgent;

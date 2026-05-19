import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, ArrowRight, ShieldCheck, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';

interface LoginProps {
  onLogin: (user: any) => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await import('axios').then(m => 
        m.default.post('http://localhost:5000/api/login', {
          email,
          password
        })
      );

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        onLogin(response.data.user);
      } else {
        setError(response.data.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = {
      id: 'demo-user-123',
      name: 'Demo User',
      email: 'demo@neoconvert.ai',
      picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'
    };
    onLogin(demoUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="cyber-card rounded-2xl p-8 max-w-md w-full mx-4 border border-cyan-500/30"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display neon-text mb-2">Welcome Back</h1>
          <p className="text-gray-400">Access 2035+ currency features</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full cyber-button py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-lg mt-6"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <LogIn className="w-5 h-5 text-white" />
            )}
            {loading ? 'Logging in...' : 'Login'}
            {!loading && <ArrowRight className="w-5 h-5 text-white" />}
          </motion.button>
        </form>

        <div className="mt-4">
          <motion.button
            onClick={handleDemoLogin}
            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ShieldCheck className="w-5 h-5" />
            Continue as Demo User
          </motion.button>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <button
            onClick={onSwitchToRegister}
            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Don&apos;t have an account? Register
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span className="text-green-400">Secure login</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

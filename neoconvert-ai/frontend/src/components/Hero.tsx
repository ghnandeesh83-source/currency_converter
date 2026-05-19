import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Cpu, Globe, Rocket } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden py-12 md:py-20">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyber-purple/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyber-cyan/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-pink/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyber-purple/20 to-cyber-cyan/20 border border-cyber-cyan/30 mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-cyber-yellow" />
            <span className="text-sm font-medium text-cyber-cyan">NeoConvert AI v2.0</span>
          </motion.div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
            <span className="neon-text">NeoConvert</span>
            <span className="text-white"> AI</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-400 mb-6 max-w-3xl mx-auto">
            The <span className="text-cyber-cyan font-semibold">brain-melting</span> currency converter for{' '}
            <span className="text-cyber-purple font-semibold">2035+</span> economies
          </p>

          {/* Feature Icons */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8">
            {[
              { icon: Cpu, label: 'AI Twin', color: 'text-purple-400' },
              { icon: Globe, label: 'Universal Index', color: 'text-cyan-400' },
              { icon: Rocket, label: 'Space Economy', color: 'text-pink-400' },
            ].map((item, idx) => (
              <motion.div
                key={item.label}
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
              >
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-xs text-gray-500">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;

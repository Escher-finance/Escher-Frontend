'use client';

import { motion } from 'framer-motion';
import { Github, ExternalLink, Code2, Globe, Shield } from 'lucide-react';

export default function ShutdownView() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-escher-darkblue flex items-center justify-center p-6 font-inter">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-escher-electricblue/20 blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/20 blur-[120px] animate-float-delayed" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-escher-959aff/10 blur-[100px] animate-float-slow" />
      </div>

      {/* Main Content Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-2xl w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl text-center"
      >
        {/* Logo */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 flex justify-center"
        >
          <img 
            src="/images/escher-transparent-white.svg" 
            alt="Escher Logo" 
            className="h-12 md:h-16 w-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          />
        </motion.div>

        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="md:text-4xl font-funnel-display font-bold text-white mb-6 leading-tight tracking-tight"
        >
          Escher is now
          <span className="ml-2 text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-orange-500">
            Open Source
          </span>
        </motion.h1>

        {/* Description */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4 mb-10 text-escher-dfe0ff/80 text-lg md:text-xl leading-relaxed font-light"
        >
          <p>
            The Escher app is no longer active. 
          </p>
          <p className="text-sm md:text-base opacity-70">
            The technology developed by Escher for cross-chain LST infrastructure has been contributed as open-source public IP as part of an agreement with the <span className="text-white font-medium">Babylon Foundation</span>.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a 
            href="http://github.com/escher-finance" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center gap-2 bg-white text-escher-darkblue px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(31,207,104,0.3)] overflow-hidden"
          >
            <Github className="w-5 h-5 transition-transform group-hover:rotate-12" />
            <span>Explore Codebase</span>
          </a>
          
          <a 
            href="https://babylonchain.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2 bg-white/5 text-white px-8 py-4 rounded-2xl font-semibold border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105 active:scale-95"
          >
            <span>Babylon Foundation</span>
            <ExternalLink className="w-4 h-4 opacity-50 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
        </motion.div>

        {/* Footer Metrics/Features */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 pt-8 border-t border-white/5 grid grid-cols-3 gap-4"
        >
          <div className="flex flex-col items-center gap-1">
            <Code2 className="w-5 h-5 text-escher-959aff mb-1" />
            <span className="text-[10px] uppercase tracking-widest text-white/40">Open Source</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Globe className="w-5 h-5 text-escher-1fcf68 mb-1" />
            <span className="text-[10px] uppercase tracking-widest text-white/40">Cross-Chain</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Shield className="w-5 h-5 text-escher-electricblue_light1 mb-1" />
            <span className="text-[10px] uppercase tracking-widest text-white/40">Secured</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

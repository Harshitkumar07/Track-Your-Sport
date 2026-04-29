/* eslint-disable */
import React from 'react';
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Trophy, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthOverlay() {
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight/80 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-10 md:p-12 max-w-md w-full mx-4 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-volt to-indigo-600" />
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-volt rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-volt/30 hover:rotate-12 transition-transform">
            <Trophy size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 italic leading-none text-midnight">Community</h1>
          <p className="text-slate-400 mb-10 font-bold uppercase text-xs tracking-[0.2em] leading-relaxed">
            Universal Community for<br />Sports Extremists
          </p>
          
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-4 bg-volt text-white py-5 px-6 rounded-2xl font-black text-xl uppercase shadow-xl shadow-volt/20 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] transition-all tracking-tighter"
          >
            <LogIn size={24} />
            Enter Stadium
          </button>
          
          <div className="mt-8 pt-8 border-t border-midnight/5 w-full">
            <p className="text-[10px] text-slate-300 uppercase tracking-widest font-black">
              System v2.0 // Node_Beta_7
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

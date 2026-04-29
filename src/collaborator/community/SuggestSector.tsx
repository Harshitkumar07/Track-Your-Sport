import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, ArrowLeft, Trophy, Zap, Globe, Users } from 'lucide-react';
import { firebaseService } from './firebaseService';

interface SuggestSectorProps {
  onBack: () => void;
}

export default function SuggestSector({ onBack }: SuggestSectorProps) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setSubmitting(true);
    await firebaseService.suggestCommunity(name, desc);
    setSubmitting(false);
    setSubmitted(true);
    
    setTimeout(() => {
      onBack();
    }, 2500);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 sm:p-10">
        <motion.div 
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          className="w-32 h-32 bg-green-500/10 text-green-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-green-500/10"
        >
          <CheckCircle2 size={64} />
        </motion.div>
        <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-midnight mb-4">Proposal Logged</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm max-w-md">
          The Community Council will review your request. Returning to stadium shortly...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-midnight transition-colors font-black uppercase text-xs tracking-widest mb-8 group w-fit"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Community
      </button>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left Side: Text/Context */}
        <div className="space-y-8">
          <div>
            <div className="inline-block px-3 py-1 bg-volt/10 text-volt text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
              Community Expansion
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-midnight leading-[0.9]">
              Forge a New <span className="text-volt">Sector.</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg mt-6 max-w-md leading-relaxed">
              Don't see your favorite sport? Propose a new sector and lead the conversation. 
              The most requested sectors get unlocked every week.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 bg-white rounded-3xl border border-midnight/5 shadow-sm">
                <Users size={24} className="text-volt mb-3" />
                <h4 className="font-black uppercase text-xs text-midnight">Growth</h4>
                <p className="text-slate-400 text-[10px] uppercase font-bold mt-1">Build your tribe</p>
             </div>
             <div className="p-6 bg-white rounded-3xl border border-midnight/5 shadow-sm">
                <Globe size={24} className="text-volt mb-3" />
                <h4 className="font-black uppercase text-xs text-midnight">Global</h4>
                <p className="text-slate-400 text-[10px] uppercase font-bold mt-1">Worldwide Access</p>
             </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-midnight/5 border border-midnight/5"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Sport / Discipline</label>
              <input 
                autoFocus
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. BADMINTON, BOXING, SKATE..."
                className="w-full p-5 bg-slate-50 border border-midnight/5 rounded-2xl font-black text-xl uppercase focus:outline-none focus:ring-2 focus:ring-volt/20 focus:bg-white focus:border-volt/30 transition-all text-midnight placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Why should it join the community?</label>
              <textarea 
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe the demand and recent events..."
                rows={4}
                className="w-full p-5 bg-slate-50 border border-midnight/5 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-volt/20 focus:bg-white focus:border-volt/30 transition-all resize-none text-midnight"
              />
            </div>

            <button 
              disabled={submitting}
              type="submit"
              className="w-full bg-volt text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-volt/20 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 group"
            >
              {submitting ? 'PROCESSING...' : (
                <>
                  <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Signal The Refs
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-300 font-bold uppercase tracking-widest mt-4">
              Est. Review Time: 12-24 Hours
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

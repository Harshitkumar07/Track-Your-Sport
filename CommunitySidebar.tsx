import React, { useEffect, useState } from 'react';
import { firebaseService } from '../services/firebaseService';
import { Community } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Plus, X, Send, CheckCircle2, Zap, Flame } from 'lucide-react';

interface CommunitySidebarProps {
  selectedId: string | null;
  onSelect: (community: Community) => void;
  onSuggest: () => void;
}

export default function CommunitySidebar({ selectedId, onSelect, onSuggest }: CommunitySidebarProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    firebaseService.getCommunities().then((data) => {
      setCommunities(data);
      setLoading(false);
      // Auto-select first one if none selected
      if (!selectedId && data.length > 0) {
        onSelect(data[0]);
      }
    });
  }, []);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 md:p-6 border-b border-midnight/5 bg-volt/5 flex items-center justify-between">
        <h2 className="font-black uppercase italic tracking-tighter text-xl md:text-2xl text-midnight">Sectors</h2>
        <div className="bg-volt/10 text-volt px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest hidden lg:block">
          LIVE_DB
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Global Feed Item */}
        <button
          className={`w-full group flex items-center justify-between p-3 rounded-xl transition-all mb-2 ${
            selectedId === 'dugout' 
              ? 'bg-midnight text-white shadow-lg shadow-midnight/20 translate-x-1' 
              : 'bg-white text-midnight hover:bg-slate-50 border border-midnight/5'
          }`}
          onClick={(e) => {
            e.preventDefault();
            onSelect({ id: 'dugout' } as any);
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-volt rounded-xl flex items-center justify-center shadow-sm">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <div className="text-left">
              <p className="font-black uppercase text-sm leading-tight">The Dugout</p>
              <p className={`text-[10px] font-mono ${selectedId === 'dugout' ? 'text-white/80' : 'text-slate-400'}`}>
                GLOBAL CHATTER
              </p>
            </div>
          </div>
          <Activity size={14} className={selectedId === 'dugout' ? 'text-white' : 'text-volt'} />
        </button>

        <div>
          <div className="px-3 pt-4 pb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Data & Analytics</p>
          </div>
          <button
            className={`w-full group flex items-center justify-between p-3 rounded-xl transition-all mb-2 ${
              selectedId === 'standings' 
                ? 'bg-midnight text-white shadow-lg shadow-midnight/20 translate-x-1' 
                : 'bg-white text-midnight hover:bg-slate-50 border border-midnight/5'
            }`}
            onClick={(e) => {
              e.preventDefault();
              onSelect({ id: 'standings' } as any);
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-hot/10 rounded-xl flex items-center justify-center shadow-sm">
                <Activity size={20} className="text-hot" />
              </div>
              <div className="text-left">
                <p className="font-black uppercase text-sm leading-tight">Standings</p>
              </div>
            </div>
          </button>

          <button
            className={`w-full group flex items-center justify-between p-3 rounded-xl transition-all mb-2 ${
              selectedId === 'live-scores' 
                ? 'bg-midnight text-white shadow-lg shadow-midnight/20 translate-x-1' 
                : 'bg-white text-midnight hover:bg-slate-50 border border-midnight/5'
            }`}
            onClick={(e) => {
              e.preventDefault();
              onSelect({ id: 'live-scores' } as any);
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-volt/10 rounded-xl flex items-center justify-center shadow-sm relative">
                <div className="absolute top-1 right-1 w-2 h-2 bg-volt rounded-full animate-pulse" />
                <Activity size={20} className="text-volt" />
              </div>
              <div className="text-left">
                <p className="font-black uppercase text-sm leading-tight">Live Scores</p>
              </div>
            </div>
          </button>
        </div>

        <div className="h-px bg-midnight/5 mx-2 my-2" />

        <div className="px-3 pt-4 pb-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Communities</p>
        </div>

        {loading ? (
          <div className="p-4 animate-pulse space-y-4">
             {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 border-2 border-midnight/5" />)}
          </div>
        ) : (
          communities
            .filter((c, index, self) => 
              c.name.toLowerCase() !== 'the dugout' &&
              self.findIndex(t => t.name.toLowerCase() === c.name.toLowerCase()) === index
            )
            .map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className={`w-full group flex items-center justify-between p-3 rounded-xl transition-all ${
                selectedId === c.id 
                  ? 'bg-volt text-white shadow-lg shadow-volt/20 translate-x-1' 
                  : 'bg-white text-midnight hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl group-hover:scale-110 transition-transform">{c.icon}</span>
                <div className="text-left">
                  <p className="font-black uppercase text-sm leading-tight">{c.name}</p>
                  <p className={`text-[10px] font-mono ${selectedId === c.id ? 'text-white/80' : 'text-slate-400'}`}>
                    {c.memberCount.toLocaleString()} FANS
                  </p>
                </div>
              </div>
              <motion.div animate={{ opacity: selectedId === c.id ? 1 : 0 }}>
                <Activity size={14} className={selectedId === c.id ? 'text-white' : 'text-volt'} />
              </motion.div>
            </button>
          ))
        )}
      </div>
      <div className="p-4 border-t border-midnight/5 bg-slate-50/50">
        <button 
          onClick={onSuggest}
          className="w-full flex items-center justify-center gap-2 p-3 bg-white border border-midnight/10 rounded-xl font-bold uppercase text-[10px] text-midnight shadow-sm hover:shadow-md hover:border-volt/20 hover:text-volt transition-all"
        >
          <Plus size={14} />
          Suggest Sector
        </button>
      </div>
    </div>
  );
}

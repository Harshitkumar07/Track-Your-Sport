/* eslint-disable */
import React from 'react';
import { TrendingUp, MessageSquare, Zap, Activity } from 'lucide-react';

interface HotTopicsSidebarProps {
  onNavigateToDugout?: () => void;
}

export default function HotTopicsSidebar({ onNavigateToDugout }: HotTopicsSidebarProps) {
  const topics = [
    { id: 1, title: 'Transfer Deadline Madness', count: '1.2K', trend: 'up' },
    { id: 2, title: 'Post-Game: Lakers v Warriors', count: '850', trend: 'steady' },
    { id: 3, title: 'F1: New Engine Regulations', count: '430', trend: 'up' },
    { id: 4, title: 'GOAT Debate: Messi or Ronaldo?', count: '5.6K', trend: 'down' },
  ];

  return (
    <div className="space-y-8">
      {/* Live Scores */}
      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter italic mb-4 flex items-center gap-2">
          <Activity size={18} className="text-hot" />
          Live Matches
        </h3>
        <div className="space-y-3">
          {[
            { home: 'IND', away: 'AUS', score: '342/4', time: 'Day 1 Stumps' },
            { home: 'LAL', away: 'GSW', score: '102-98', time: 'Q4 2:12' },
            { home: 'MC', away: 'LIV', score: '2-1', time: '82\'' },
          ].map((m, i) => (
            <div key={i} className="p-4 bg-white border border-midnight/5 rounded-2xl shadow-sm flex items-center justify-between font-mono hover:shadow-md transition-all">
              <div className="flex flex-col text-xs font-black text-midnight">
                <span>{m.home}</span>
                <span>{m.away}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-black italic text-midnight">{m.score}</span>
                <span className="text-[9px] text-hot font-bold animate-pulse">{m.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-black uppercase tracking-tighter italic mb-4 flex items-center gap-2">
          <TrendingUp className="text-accent" />
          Heat Map
        </h3>
        <div className="space-y-4">
          {topics.map((t) => (
            <div key={t.id} onClick={onNavigateToDugout} className="p-4 bg-white border border-midnight/5 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black uppercase text-slate-300">TRENDING NOW</span>
                <Zap size={14} className={t.trend === 'up' ? 'text-volt fill-volt' : 'text-slate-200'} />
              </div>
              <h4 className="font-bold uppercase text-sm leading-tight mb-2 group-hover:text-volt text-midnight">{t.title}</h4>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <MessageSquare size={12} />
                <span>{t.count} RESPONSES</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-midnight text-white rounded-3xl shadow-xl shadow-midnight/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-volt/10 rounded-full -translate-y-10 translate-x-10 blur-3xl group-hover:bg-volt/20 transition-colors" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={20} className="text-volt" />
            <h3 className="font-black uppercase italic tracking-tighter">Live Community Stats</h3>
          </div>
          <div className="space-y-3 font-mono">
            <div className="flex justify-between">
               <span className="text-white/40 text-xs">ONLINE FANS</span>
               <span className="text-volt font-bold">12,402</span>
            </div>
            <div className="flex justify-between">
               <span className="text-white/40 text-xs">MSG / MIN</span>
               <span className="text-volt font-bold">842</span>
            </div>
            <div className="flex justify-between">
               <span className="text-white/40 text-xs">SERVER LATENCY</span>
               <span className="text-volt font-bold">24ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

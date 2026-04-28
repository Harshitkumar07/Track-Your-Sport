import React from 'react';
import { Activity, Clock, ArrowLeft } from 'lucide-react';

interface LiveScoresProps {
  onBack: () => void;
}

export default function LiveScoresView({ onBack }: LiveScoresProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10 w-full animate-fade-in relative">
      <button 
        onClick={onBack}
        className="flex lg:hidden items-center gap-2 text-slate-400 hover:text-midnight transition-colors font-black uppercase text-xs tracking-widest mb-8 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-volt/10 rounded-2xl flex items-center justify-center relative">
          <div className="absolute top-2 right-2 w-2 h-2 bg-volt rounded-full animate-pulse" />
          <Activity size={32} className="text-volt" />
        </div>
        <div>
          <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-midnight">Live Scores</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Real-time Updates</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { league: 'NBA', home: 'Lakers', away: 'Warriors', score: '102 - 98', time: 'Q4 2:12', status: 'live' },
          { league: 'EPL', home: 'Man City', away: 'Liverpool', score: '2 - 1', time: '82\'', status: 'live' },
          { league: 'Test Cricket', home: 'India', away: 'Australia', score: '342/4', time: 'Stumps', status: 'finished' },
          { league: 'NFL', home: 'Chiefs', away: 'Eagles', score: '0 - 0', time: 'Sun 8:00 PM', status: 'upcoming' },
        ].map((match, idx) => (
          <div key={idx} className="bg-white border border-midnight/5 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            {match.status === 'live' && (
              <div className="absolute top-0 right-0 py-1 px-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl">
                Live
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{match.league}</span>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock size={12} />
                <span className="text-[10px] font-bold uppercase">{match.time}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-midnight">{match.home}</span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-gray-500">{match.away}</span>
              </div>
            </div>
            {match.status !== 'upcoming' && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2 mt-3 font-mono font-black text-2xl tracking-tighter text-midnight bg-slate-50 px-3 py-1 rounded-xl">
                {match.score}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

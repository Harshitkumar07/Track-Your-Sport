/* eslint-disable */
import React from 'react';
import { Trophy, Activity, ArrowLeft } from 'lucide-react';

interface StandingsProps {
  onBack: () => void;
}

export default function StandingsView({ onBack }: StandingsProps) {
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
        <div className="w-16 h-16 bg-hot/10 rounded-2xl flex items-center justify-center">
          <Trophy size={32} className="text-hot" />
        </div>
        <div>
          <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-midnight">Standings</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Global Leagues & Tournaments</p>
        </div>
      </div>

      <div className="bg-white border border-midnight/5 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-midnight/5 bg-slate-50">
          <h3 className="font-black uppercase tracking-widest text-midnight">Premier League (Mock)</h3>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-midnight/5 text-xs font-black uppercase tracking-widest text-slate-400">
                <th className="p-4">Pos</th>
                <th className="p-4">Club</th>
                <th className="p-4">Pld</th>
                <th className="p-4">W</th>
                <th className="p-4">D</th>
                <th className="p-4">L</th>
                <th className="p-4">Pts</th>
              </tr>
            </thead>
            <tbody className="font-medium text-sm">
              {[
                { pos: 1, club: 'Manchester City', p: 38, w: 28, d: 7, l: 3, pts: 91 },
                { pos: 2, club: 'Arsenal', p: 38, w: 28, d: 5, l: 5, pts: 89 },
                { pos: 3, club: 'Liverpool', p: 38, w: 24, d: 10, l: 4, pts: 82 },
                { pos: 4, club: 'Aston Villa', p: 38, w: 20, d: 8, l: 10, pts: 68 },
              ].map((team, idx) => (
                <tr key={idx} className="border-b border-midnight/5 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-black">{team.pos}</td>
                  <td className="p-4">{team.club}</td>
                  <td className="p-4">{team.p}</td>
                  <td className="p-4">{team.w}</td>
                  <td className="p-4">{team.d}</td>
                  <td className="p-4">{team.l}</td>
                  <td className="p-4 font-black text-midnight">{team.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

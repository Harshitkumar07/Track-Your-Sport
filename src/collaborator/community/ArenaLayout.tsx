import React, { useState } from 'react';
import { auth } from './firebase';
import { User, LogOut, ChevronRight, Share2, Plus, Zap, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ArenaLayoutProps {
  children?: React.ReactNode;
  sidebar: React.ReactNode;
  rightBar?: React.ReactNode;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onNavigate?: (view: string) => void;
}

export default function ArenaLayout({ children, sidebar, rightBar, isSidebarOpen, setIsSidebarOpen, onNavigate }: ArenaLayoutProps) {
  const user = auth.currentUser;

  return (
    <div className="min-h-screen flex flex-col data-grid overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-midnight/10 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-50 sticky top-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="lg:hidden p-2 rounded-xl bg-volt text-white shadow-lg shadow-volt/20 hover:scale-105 active:scale-95 transition-all"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-midnight rounded-xl flex items-center justify-center hover:rotate-6 transition-transform">
              <span className="text-white font-black text-xl md:text-2xl italic">C</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic text-midnight">Community</h1>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-8 font-bold uppercase text-sm tracking-widest text-midnight/60">
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {user && (
            <div className="flex items-center gap-2 md:gap-3 border-l-2 border-midnight/10 pl-2 md:pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] md:text-xs font-black uppercase leading-tight">{user.displayName}</p>
                <p className="text-[8px] md:text-[10px] font-mono text-gray-400 tracking-tighter">LVL 42 FAN</p>
              </div>
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.uid}`} 
                className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-midnight/10 shadow-sm" 
                alt="Profile"
              />
              <button 
                onClick={() => auth.signOut()}
                className="p-1 md:p-2 hover:bg-hot/10 hover:text-hot transition-colors rounded-lg"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-midnight/60 backdrop-blur-sm z-30 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Left Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 w-72 lg:w-64 border-r border-midnight/5 bg-white z-40 
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            {sidebar}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative p-3 sm:p-4 md:p-8 lg:p-10 w-full max-w-full">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </main>

        {/* Right Sidebar - Trending */}
        {rightBar && (
          <aside className="w-80 border-l border-midnight/5 bg-white p-6 hidden xl:block overflow-y-auto">
            {rightBar}
          </aside>
        )}
      </div>

      {/* Ticker / Footer */}
      <footer className="h-10 border-t border-midnight/10 bg-midnight text-white/90 flex items-center overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee font-mono text-[11px] font-black uppercase tracking-tighter">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-8 flex items-center gap-2">
              <Zap size={14} className="fill-volt text-volt" />
              HOT TOPIC: Champions League Draw results are out!
              <ChevronRight size={14} className="text-volt" />
              TRANSFER NEWS: Mbappe move finalized?
            </span>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}

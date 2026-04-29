import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { firebaseService } from './firebaseService';
import ArenaLayout from './ArenaLayout';
import CommunitySidebar from './CommunitySidebar';
import ThreadList from './ThreadList';
import ChatInterface from './ChatInterface';
import SuggestSector from './SuggestSector';
import DugoutFeed from './DugoutFeed';
import HotTopicsSidebar from './HotTopicsSidebar';
import AuthOverlay from './AuthOverlay';
import StandingsView from './StandingsView';
import LiveScoresView from './LiveScoresView';
import { Community, Thread } from './types';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState<'arena' | 'suggest' | 'dugout' | 'standings' | 'live-scores' | 'heatmap'>('dugout');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        await firebaseService.syncUser(u);
        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F0F2F5] data-grid">
        <div className="w-12 h-12 border-4 border-midnight border-t-volt animate-spin mb-4" />
        <h2 className="font-black uppercase tracking-[0.2em] text-[10px] italic">Initializing Community...</h2>
      </div>
    );
  }

  if (!user) {
    return <AuthOverlay />;
  }

  return (
    <ArenaLayout
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      onNavigate={(v) => { 
        setView(v as any); 
        setSelectedCommunity(null); 
        setSelectedThread(null); 
        setIsSidebarOpen(false); 
      }}
      sidebar={
        <CommunitySidebar 
          selectedId={view === 'dugout' ? 'dugout' : view === 'standings' ? 'standings' : view === 'live-scores' ? 'live-scores' : selectedCommunity?.id || null} 
          onSelect={(c) => {
            if (c.id === 'dugout') {
              setView('dugout');
              setSelectedCommunity(null);
            } else if (c.id === 'standings') {
              setView('standings');
              setSelectedCommunity(null);
            } else if (c.id === 'live-scores') {
              setView('live-scores');
              setSelectedCommunity(null);
            } else {
              setView('arena');
              setSelectedCommunity(c);
            }
            setSelectedThread(null);
            setIsSidebarOpen(false);
          }} 
          onSuggest={() => {
            setView('suggest');
            setIsSidebarOpen(false);
          }}
        />
      }
      rightBar={<HotTopicsSidebar onNavigateToDugout={() => {
        setView('dugout');
        setSelectedCommunity(null);
        setSelectedThread(null);
      }} />}
    >
      <AnimatePresence mode="wait">
        {view === 'suggest' ? (
          <motion.div
            key="suggest-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <SuggestSector onBack={() => setView('arena')} />
          </motion.div>
        ) : view === 'standings' ? (
          <motion.div
            key="standings-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <StandingsView onBack={() => setView('dugout')} />
          </motion.div>
        ) : view === 'live-scores' ? (
          <motion.div
            key="live-scores-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <LiveScoresView onBack={() => setView('dugout')} />
          </motion.div>
        ) : view === 'dugout' ? (
          <motion.div
            key="dugout-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <DugoutFeed />
          </motion.div>
        ) : selectedCommunity && !selectedThread ? (
          <motion.div
            key={`list-${selectedCommunity.id}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ThreadList 
              community={selectedCommunity} 
              onSelectThread={setSelectedThread} 
            />
          </motion.div>
        ) : selectedCommunity && selectedThread ? (
          <motion.div
            key={`chat-${selectedThread.id}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <ChatInterface 
              community={selectedCommunity}
              thread={selectedThread}
              onBack={() => setSelectedThread(null)}
            />
          </motion.div>
        ) : (
          <div className="h-full flex items-center justify-center text-center opacity-30 select-none">
             <div>
               <h1 className="text-8xl font-black uppercase italic tracking-tighter">Community</h1>
               <p className="font-bold uppercase tracking-[0.5em]">Select a sector to begin</p>
             </div>
          </div>
        )}
      </AnimatePresence>
    </ArenaLayout>
  );
}

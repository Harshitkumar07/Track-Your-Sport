import React, { useEffect, useState } from 'react';
import { firebaseService } from '../services/firebaseService';
import { Community, Thread } from '../types';
import { MessageSquare, Clock, User, Hash, Plus, Zap, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DugoutFeed from './DugoutFeed';

interface ThreadListProps {
  community: Community;
  onSelectThread: (thread: Thread) => void;
}

export default function ThreadList({ community, onSelectThread }: ThreadListProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTags, setNewTags] = useState('');
  const [activeTab, setActiveTab] = useState<'discussions' | 'feed'>('discussions');

  useEffect(() => {
    const unsub = firebaseService.subscribeToThreads(community.id, setThreads);
    return () => unsub();
  }, [community.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const tags = newTags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag !== '');
    await firebaseService.createThread(community.id, newTitle.trim(), tags);
    setNewTitle('');
    setNewTags('');
    setShowCreate(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-midnight/10 pb-6 gap-6">
        <div>
          <div className="flex items-center gap-3">
             <span className="text-3xl md:text-5xl">{community.icon}</span>
             <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tighter italic text-midnight leading-none">{community.name} Sector</h2>
          </div>
          <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] md:text-xs tracking-[0.2em]">{community.description}</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="bg-volt text-white p-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-volt/20 hover:shadow-xl group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          Open Thread
        </button>
      </div>

      {/* Area Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-8 w-fit">
        <button 
          onClick={() => setActiveTab('discussions')}
          className={`px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
            activeTab === 'discussions' ? 'bg-white text-midnight shadow-sm' : 'text-slate-400 hover:text-midnight'
          }`}
        >
          Discussions
        </button>
        <button 
          onClick={() => setActiveTab('feed')}
          className={`px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
            activeTab === 'feed' ? 'bg-white text-midnight shadow-sm' : 'text-slate-400 hover:text-midnight'
          }`}
        >
          {community.name} Feed
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'feed' ? (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <DugoutFeed filterTag={community.name} />
          </motion.div>
        ) : (
          <motion.div
            key="discussions-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AnimatePresence>
              {showCreate && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <form onSubmit={handleCreate} className="bg-white border border-midnight/5 p-6 rounded-2xl shadow-xl">
              <h3 className="font-black uppercase mb-4 tracking-tight text-midnight">New Discussion Topic</h3>
              <input 
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What's the hot topic?"
                className="w-full p-4 border border-midnight/10 rounded-xl font-bold text-xl mb-4 focus:outline-none focus:ring-2 focus:ring-volt/20 focus:border-volt/30 transition-all"
              />
              <input 
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="Tags (comma separated, e.g. goat, predictions)"
                className="w-full p-3 border border-midnight/10 rounded-xl font-bold text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-volt/20 focus:border-volt/30 transition-all"
              />
              <div className="flex justify-end gap-4 font-bold">
                <button type="button" onClick={() => setShowCreate(false)} className="uppercase text-sm text-slate-400 hover:text-midnight transition-colors">Cancel</button>
                <button type="submit" className="bg-volt text-white px-6 py-2 rounded-xl uppercase text-sm font-black tracking-widest shadow-lg shadow-volt/20 hover:scale-105 transition-all">Create Thread</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        {threads.map((thread) => (
          <motion.button
            key={thread.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={() => onSelectThread(thread)}
            className="text-left bg-white border border-midnight/5 p-5 md:p-6 rounded-2xl group hover:shadow-xl hover:-translate-y-1 transition-all active:scale-[0.98] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-volt opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {thread.messageCount > 20 && (
                    <span className="bg-hot text-white text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm shadow-hot/20">
                      <Zap size={8} className="fill-white" />
                      HOT
                    </span>
                  )}
                  {thread.tags?.map((tag, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-500 text-[8px] font-black px-2 py-0.5 rounded-full border border-slate-200 uppercase tracking-tighter">
                      #{tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl md:text-2xl font-black uppercase leading-tight mb-2 text-midnight group-hover:text-volt transition-colors break-words">
                  {thread.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-1">
                    <User size={12} className="text-volt" />
                    By {thread.authorId === 'system' ? 'ARENA_BOT' : thread.authorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(thread.lastMessageAt?.seconds * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-6 sm:border-l border-midnight/5 sm:pl-6">
                <div className="text-center">
                  <p className="font-mono text-2xl font-black text-midnight group-hover:text-volt transition-colors leading-none">{thread.messageCount}</p>
                  <p className="text-[9px] font-black uppercase text-slate-400">RESPONSES</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-volt group-hover:text-white transition-all shadow-sm">
                  <MessageSquare size={20} />
                </div>
              </div>
            </div>
          </motion.button>
        ))}
        {threads.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-midnight/5 rounded-3xl">
            <h3 className="font-black uppercase text-2xl text-slate-300">Sector Quiet</h3>
            <p className="font-bold uppercase text-xs text-slate-400">Start a conversation to see it here</p>
          </div>
        )}
      </div>
    </motion.div>
  )}
</AnimatePresence>
</div>
  );
}

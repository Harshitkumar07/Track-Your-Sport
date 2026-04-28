import React, { useEffect, useRef, useState } from 'react';
import { firebaseService } from '../services/firebaseService';
import { Community, Thread, Message } from '../types';
import { Send, ArrowLeft, MoreVertical, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';

interface ChatInterfaceProps {
  community: Community;
  thread: Thread;
  onBack: () => void;
}

export default function ChatInterface({ community, thread, onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = firebaseService.subscribeToMessages(community.id, thread.id, setMessages);
    return () => unsub();
  }, [community.id, thread.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const msg = content.trim();
    setContent('');
    await firebaseService.sendMessage(community.id, thread.id, msg);
  };

  const currentUser = auth.currentUser;

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto bg-white border-x border-midnight/5 shadow-2xl">
      {/* Discussion Header */}
      <div className="h-16 border-b border-midnight/5 px-4 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
            <ArrowLeft size={20} className="text-midnight" />
          </button>
          <div className="border-l border-midnight/10 pl-4">
            <h3 className="font-black uppercase tracking-tight text-sm sm:text-lg leading-tight flex items-center gap-2 text-midnight line-clamp-1">
              {thread.title}
              {thread.messageCount > 50 && <Zap size={16} className="text-volt fill-volt shrink-0" />}
            </h3>
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
              Live conversation in <span className="text-volt font-black">{community.name} Sector</span>
            </p>
          </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-midnight transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        <div className="text-center py-8">
           <p className="bg-slate-100 text-slate-400 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] inline-block mx-auto rounded-full border border-slate-200">
             End-to-end encrypted discussion
           </p>
        </div>

        {messages.map((msg, index) => {
          const isMe = msg.authorId === currentUser?.uid;
          const isSystem = msg.authorId === 'system';
          const isMod = msg.authorId === thread.authorId && !isSystem;
          const showAvatar = index === 0 || messages[index - 1].authorId !== msg.authorId;
          
          if (isSystem) {
            return (
              <div key={msg.id} className="py-2 flex justify-center">
                <span className="bg-midnight/5 text-midnight/40 px-3 py-1 text-[9px] font-black uppercase tracking-widest border border-midnight/10">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <motion.div 
              key={msg.id}
              initial={{ x: isMe ? 20 : -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              {showAvatar && (
                <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <img 
                    src={msg.authorPhotoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${msg.authorId}`} 
                    className="w-7 h-7 rounded-full border border-midnight/10 shadow-sm" 
                    alt="P"
                  />
                  <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${isMod ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {msg.authorName}
                    {isMod && (
                      <span className="bg-indigo-600 text-white text-[7px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <ShieldCheck size={8} />
                        MOD
                      </span>
                    )}
                  </span>
                </div>
              )}
              <div className={`max-w-[90%] sm:max-w-[75%] p-4 border border-midnight/5 font-medium text-sm shadow-sm transition-all break-words ${
                isMe 
                  ? 'bg-volt text-white rounded-2xl rounded-tr-sm' 
                  : 'bg-white text-midnight rounded-2xl rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-midnight/10 bg-white/80 backdrop-blur-md">
        <div className="flex gap-2 sm:gap-4 w-full">
          <input 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-w-0 p-3 sm:p-4 border border-midnight/10 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-volt/20 focus:border-volt/30 transition-all text-sm sm:text-base bg-white"
          />
          <button 
            type="submit" 
            disabled={!content.trim()}
            className="shrink-0 bg-volt text-white p-3 sm:p-4 rounded-2xl shadow-lg shadow-volt/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center aspect-square sm:aspect-auto"
          >
            <Send size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
      </form>
    </div>
  );
}

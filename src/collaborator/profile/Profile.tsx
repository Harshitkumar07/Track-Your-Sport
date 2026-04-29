/* eslint-disable */
import React, { useState, useRef } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ExternalLink,
  Camera
} from 'lucide-react';

import { UserData } from './types';

interface ProfileProps {
  initialUser: UserData;
}

// --- MOCK DATA FOR COMMUNITIES ---
const joinedCommunities = [
  {
    id: 'com_001',
    name: 'Seattle Strikers FC',
    category: 'Soccer',
    members: 1240,
    role: 'Member',
    iconUrl: 'https://images.unsplash.com/photo-1518605368461-1e1252281142?q=80&w=128&h=128&auto=format&fit=crop',
    href: '#/community/seattle-strikers', // Replace with your actual router links
    joinedDate: 'Apr 2023'
  },
  {
    id: 'com_002',
    name: 'PNW Marathon Trainers',
    category: 'Running',
    members: 856,
    role: 'Moderator',
    iconUrl: 'https://images.unsplash.com/photo-1552674605-15c21f32a4f3?q=80&w=128&h=128&auto=format&fit=crop',
    href: '#/community/pnw-marathon',
    joinedDate: 'Jan 2024'
  },
  {
    id: 'com_003',
    name: 'Tactical Playbook Discord',
    category: 'Strategy',
    members: 3420,
    role: 'Member',
    iconUrl: 'https://images.unsplash.com/photo-1508344928928-7165b67de128?q=80&w=128&h=128&auto=format&fit=crop',
    href: '#/community/tactical-playbook',
    joinedDate: 'Nov 2023'
  }
];

export default function Profile({ initialUser }: ProfileProps) {
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatarUrl);
  const [bannerUrl, setBannerUrl] = useState(initialUser.bannerUrl);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File, type: 'avatarUrl' | 'bannerUrl') => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          if (type === 'avatarUrl') setAvatarUrl(e.target.result as string);
          else setBannerUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatarUrl' | 'bannerUrl') => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageUpload(e.target.files[0], type);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files[0], 'avatarUrl');
    }
  };

  const handleCommunityRedirect = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    // In a real app, use your router: navigate(href) or window.location.href = href
    console.log(`Redirecting to community: ${href}`);
    alert(`Redirecting to community page!\n(Path: ${href})`);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans pb-12">
      {/* Banner Section */}
      <div 
        className="h-48 md:h-64 w-full relative bg-gradient-to-r from-blue-600 to-indigo-900 shadow-inner overflow-hidden group cursor-pointer"
        onClick={() => bannerInputRef.current?.click()}
        title="Click to update banner"
      >
        <img 
          src={bannerUrl} 
          alt="Profile Banner" 
          className="w-full h-full object-cover mix-blend-overlay opacity-80 transition-opacity group-hover:opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="bg-black/50 text-white px-4 py-2 rounded-lg items-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex">
              <Camera className="w-5 h-5 mr-2" />
              Change Banner
           </div>
        </div>
        <input 
          type="file" 
          ref={bannerInputRef} 
          onChange={(e) => handleFileChange(e, 'bannerUrl')} 
          accept="image/*" 
          className="hidden" 
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header & Info Offset */}
        <div className="relative -mt-16 sm:-mt-24 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end sm:space-x-5">
            <div 
              className={`relative group cursor-pointer rounded-3xl ${isDragging ? 'ring-4 ring-blue-500 ring-offset-2 ring-offset-[#0f172a]' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              title="Click or drag to change profile photo"
            >
              <img 
                src={avatarUrl} 
                alt={initialUser.name}
                className="h-32 w-32 sm:h-40 sm:w-40 rounded-3xl border-4 border-[#0f172a] shadow-2xl object-cover bg-slate-800 transition-opacity group-hover:opacity-75"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-3xl border-4 border-[#0f172a]">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => handleFileChange(e, 'avatarUrl')} 
                accept="image/*" 
                className="hidden" 
              />
              <div className="absolute bottom-2 right-2 h-6 w-6 bg-green-400 rounded-full border-4 border-[#0f172a] z-10" title="Online"></div>
            </div>
            
            <div className="mt-4 sm:mt-0 pt-4 sm:pb-2 text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-4xl font-bold text-white">{initialUser.name}</h1>
              <p className="text-slate-400 font-medium text-lg mt-1"><span className="text-blue-400">{initialUser.username}</span></p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Details */}
          <div className="space-y-6 lg:col-span-1">
            {/* About Card */}
            <div className="bg-[#1e293b] rounded-2xl shadow-xl border border-slate-800 p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">About</h2>
              <p className="text-slate-300 mb-6 leading-relaxed">
                {initialUser.bio || "No bio provided."}
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-center text-slate-400">
                  <MapPin className="w-5 h-5 mr-3 text-slate-500" />
                  <span className="text-slate-200 font-medium">{initialUser.location || "N/A"}</span>
                </li>
                {/* ACCOUNT CREATION DATE HERE */}
                <li className="flex items-center text-slate-400">
                  <Calendar className="w-5 h-5 mr-3 text-slate-500" />
                  <span className="text-slate-200 font-medium">Member since {initialUser.joinDate}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Communities */}
          <div className="space-y-6 lg:col-span-2">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Users className="w-6 h-6 mr-2 text-blue-500" />
                  Joined Communities
                </h2>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold">
                  {joinedCommunities.length} Active
                </span>
              </div>

              {/* Communities List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {joinedCommunities.map((community) => (
                  <div 
                    key={community.id}
                    className="bg-[#1e293b] p-5 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-blue-500/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img 
                        src={community.iconUrl} 
                        alt={community.name} 
                        className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-xl object-cover bg-slate-800 border border-slate-700"
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                          {community.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {community.members.toLocaleString()} Members • {community.role} • Joined {community.joinedDate}
                        </p>
                      </div>
                    </div>
                    
                    {/* REDIRECT BUTTON */}
                    <a 
                      href={community.href}
                      onClick={(e) => handleCommunityRedirect(community.href, e)}
                      className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-blue-600 transition-all flex-shrink-0 ml-2"
                      title="Join Room"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Placeholder for Recent Posts / Activity feed inside Communities */}
            <div className="bg-[#1e293b] rounded-2xl shadow-xl border border-slate-800 p-6 mt-8">
               <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6">Recent Activity</h2>
               <div className="text-center text-slate-500 py-8 border-2 border-dashed border-slate-700/50 rounded-xl">
                 No recent activity to show in communities.
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

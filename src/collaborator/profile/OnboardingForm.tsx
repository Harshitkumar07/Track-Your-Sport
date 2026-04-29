/* eslint-disable */
import React, { useState, useRef } from 'react';
import { Camera, MapPin, User, FileText, AtSign, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { UserData } from './types';

interface OnboardingFormProps {
  onComplete: (data: UserData) => void;
}

export default function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [formData, setFormData] = useState<Omit<UserData, 'id'>>({
    name: '',
    username: '',
    bio: '',
    location: '',
    avatarUrl: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=256&h=256&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1558365849-6bcb8b0454bf?q=80&w=1200&h=300&auto=format&fit=crop',
    joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File, type: 'avatarUrl' | 'bannerUrl') => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setFormData(prev => ({ ...prev, [type]: e.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.username) {
        const generatedId = `usr_${Math.random().toString(36).substr(2, 9)}`;
        const dataToSubmit: UserData = {
          ...formData,
          id: generatedId,
          username: formData.username.startsWith('@') ? formData.username : `@${formData.username}`
        };
        onComplete(dataToSubmit);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex items-center justify-center p-4 sm:p-8">
      <div className="bg-[#1e293b] rounded-3xl shadow-2xl border border-slate-800 w-full max-w-2xl overflow-hidden shadow-blue-900/20">
        
        {/* Banner Section inside Modal */}
        <div 
          className="h-32 md:h-40 w-full relative bg-[#0f172a] group cursor-pointer border-b border-slate-800"
          onClick={() => bannerInputRef.current?.click()}
          title="Click to change banner"
        >
          <img 
            src={formData.bannerUrl} 
            alt="Banner" 
            className="w-full h-full object-cover mix-blend-overlay opacity-80"
          />
          <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-sm">
            <div className="text-white px-4 py-2 rounded-lg flex items-center bg-black/50 font-medium">
                <ImageIcon className="w-5 h-5 mr-2" />
                Upload Banner
            </div>
          </div>
          <input 
            type="file" 
            ref={bannerInputRef}
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'bannerUrl')}
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <div className="px-6 pb-8 sm:px-10">
            <div className="flex justify-center -mt-16 mb-8 relative z-10">
               <div 
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to change profile photo"
                >
                  <img 
                    src={formData.avatarUrl} 
                    alt="Avatar"
                    className="h-32 w-32 rounded-3xl border-4 border-[#1e293b] shadow-xl object-cover bg-slate-800 transition-opacity group-hover:opacity-75"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-3xl border-4 border-[#1e293b]">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'avatarUrl')}
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white tracking-tight">Complete Your Profile</h1>
              <p className="text-slate-400 mt-2">Add details to help communities know you better.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-slate-500" />
                            </div>
                            <input 
                              type="text" 
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                              placeholder="Alex Morgan"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <AtSign className="h-5 w-5 text-slate-500" />
                            </div>
                            <input 
                              type="text" 
                              required
                              value={formData.username}
                              onChange={(e) => setFormData({...formData, username: e.target.value})}
                              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                              placeholder="alexm_sports"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Location</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-slate-500" />
                        </div>
                        <input 
                          type="text" 
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          className="w-full bg-[#0f172a] border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                          placeholder="e.g. Seattle, WA"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Bio</label>
                    <div className="relative">
                        <div className="absolute top-4 left-4 pointer-events-none">
                            <FileText className="h-5 w-5 text-slate-500" />
                        </div>
                        <textarea 
                          rows={3}
                          value={formData.bio}
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                          className="w-full bg-[#0f172a] border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none font-medium text-sm"
                          placeholder="Tell us about your sports interests..."
                        />
                    </div>
                </div>

                <div className="pt-6">
                    <button 
                      type="submit"
                      disabled={!formData.name || !formData.username}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl py-4 transition-colors flex items-center justify-center shadow-lg shadow-blue-600/20"
                    >
                      Save Profile & Enter
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}

/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Share2, Send, Zap, Globe, Image as ImageIcon, X, ArrowLeft, Check, Trash2 } from 'lucide-react';
import { firebaseService } from './firebaseService';
import { Post, PostComment } from './types';
import { auth } from './firebase';
import { formatDistanceToNow } from 'date-fns';

interface DugoutFeedProps {
  filterTag?: string;
  onPostCreated?: () => void;
}

export default function DugoutFeed({ filterTag, onPostCreated }: DugoutFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = firebaseService.subscribeToPosts((data) => {
      const filtered = filterTag 
        ? data.filter(p => p.sportTag?.toLowerCase() === filterTag.toLowerCase())
        : data;
      setPosts(filtered);
      setLoading(false);
    });
    return () => unsub();
  }, [filterTag]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500000) {
      alert("Image exceeds 500KB. Please compress or choose a smaller shot.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadstart = () => setIsUploading(true);
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert("Failed to load image. Try another one.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imagePreview) return;
    
    setIsUploading(true);
    try {
      await firebaseService.createPost(content, filterTag, imagePreview || undefined);
      setContent('');
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onPostCreated?.();
    } catch (error) {
      console.error("Submission failed:", error);
      alert("The play was blocked! Failed to post.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLike = (postId: string) => {
    firebaseService.likePost(postId);
  };

  const handleDelete = async (postId: string) => {
    await firebaseService.deletePost(postId);
    if (selectedPost?.id === postId) {
      setSelectedPost(null);
    }
  };

  const handleShare = async (post: Post) => {
    const shareData = {
      title: 'Community Dugout',
      text: `${post.authorName}: ${post.content}`,
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert('Community link copied to clipboard!');
      }
    } catch (err) {
      console.log('Share error:', err);
    }
  };

  if (selectedPost) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button 
          onClick={() => setSelectedPost(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-midnight transition-colors font-black uppercase text-xs tracking-widest mb-4 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to feed
        </button>
        <PostCard post={selectedPost} onLike={handleLike} onShare={handleShare} onDelete={handleDelete} isDetailed />
        <CommentSection post={selectedPost} />
      </div>
    );
  }

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
         <div className="w-12 h-12 border-4 border-volt border-t-transparent rounded-full animate-spin" />
         <p className="font-black uppercase tracking-widest text-xs">Entering The Dugout...</p>
       </div>
     );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Feed Header */}
      <div className="flex items-center justify-between border-b border-midnight/5 pb-4">
        <div className="flex items-center gap-3">
           <Zap className="text-volt fill-volt" size={24} />
           <h2 className="text-3xl font-black uppercase italic tracking-tighter text-midnight line-clamp-1">The Dugout</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-400 tracking-widest shrink-0">
          <Globe size={12} />
          Global Feed
        </div>
      </div>

      {/* Post Box */}
      <div className="bg-white rounded-3xl border border-midnight/5 shadow-sm p-4 sm:p-6 transition-all focus-within:shadow-xl focus-within:border-volt/20">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <img 
              src={auth.currentUser?.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${auth.currentUser?.uid}`} 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border border-midnight/10 object-cover flex-shrink-0"
              alt="Avatar"
            />
            <div className="flex-1 space-y-4">
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening in the world of sports?"
                className="w-full bg-transparent border-none focus:ring-0 text-md sm:text-lg font-medium placeholder:text-slate-300 resize-none min-h-[60px]"
              />
              
              {imagePreview && (
                <div className="relative rounded-2xl overflow-hidden border border-midnight/5 group">
                  <img src={imagePreview} className="w-full max-h-[300px] object-cover" alt="Preview" />
                  <button 
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 p-1.5 bg-midnight/50 text-white rounded-full hover:bg-midnight transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-midnight/5 flex items-center justify-between">
            <div className="flex gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-xl transition-colors ${imagePreview ? 'text-volt bg-volt/5' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <ImageIcon size={20} />
              </button>
            </div>
            <button 
              disabled={(!content.trim() && !imagePreview) || isUploading}
              type="submit"
              className="bg-volt text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-volt/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100 text-xs sm:text-base"
            >
              {isUploading ? 'Sending...' : 'Post'} <Send size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onLike={handleLike} 
              onShare={handleShare}
              onDelete={handleDelete}
              onClick={() => setSelectedPost(post)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface PostCardProps {
  key?: any;
  post: Post;
  onLike: (id: string) => void;
  onShare: (post: Post) => void | Promise<void>;
  onDelete: (id: string) => void;
  onClick?: () => void;
  isDetailed?: boolean;
}

function PostCard({ post, onLike, onShare, onDelete, onClick, isDetailed = false }: PostCardProps) {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isOwner = auth.currentUser?.uid === post.authorId;
  const isLiked = post.likedBy?.includes(auth.currentUser?.uid || '');

  const performShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const performDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    
    setIsDeleting(true);
    try {
      await onDelete(post.id);
    } catch (error) {
      console.error(error);
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white border border-midnight/5 rounded-3xl p-4 sm:p-5 transition-all ${!isDetailed ? 'hover:shadow-md cursor-pointer group' : ''}`}
      onClick={!isDetailed ? onClick : undefined}
    >
      <div className="flex gap-3 sm:gap-4">
        <img 
          src={post.authorPhotoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${post.authorId}`} 
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border border-midnight/10 object-cover flex-shrink-0"
          alt="Avatar"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-black uppercase text-sm text-midnight truncate max-w-[150px]">{post.authorName}</span>
            {post.sportTag && (
              <span className="bg-volt/10 text-volt text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                {post.sportTag}
              </span>
            )}
            <span className="text-slate-300 text-[10px] lowercase font-bold whitespace-nowrap">
               • {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate()) : 'just now'}
            </span>
          </div>
          <p className={`${isDetailed ? 'text-lg sm:text-2xl' : 'text-sm sm:text-base'} text-midnight/90 leading-relaxed break-words whitespace-pre-wrap mb-4`}>
            {post.content}
          </p>
          
          {post.imageUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 rounded-2xl overflow-hidden border border-midnight/5 shadow-inner bg-slate-50 relative group/img"
            >
              <img 
                src={post.imageUrl} 
                className="w-full max-h-[500px] object-cover transition-transform duration-500 group-hover/img:scale-[1.01]" 
                alt="Post content" 
                loading="lazy" 
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.naturalHeight > 500) target.style.objectPosition = 'top';
                }}
              />
            </motion.div>
          )}

          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={(e) => { e.stopPropagation(); onLike(post.id); }}
              className={`flex items-center gap-1.5 transition-colors group/btn ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}
            >
              <div className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-red-50' : 'group-hover/btn:bg-red-50'}`}>
                <Heart 
                  size={18} 
                  className={`transition-all ${isLiked ? 'fill-red-500 text-red-500' : 'fill-white text-slate-400'}`} 
                />
              </div>
              <span className={`text-xs font-bold ${isLiked ? 'text-red-500' : ''}`}>{post.likes}</span>
            </button>
            <button className="flex items-center gap-1.5 text-slate-400 hover:text-volt transition-colors group/btn">
              <div className="p-2 rounded-full group-hover/btn:bg-slate-50 transition-colors">
                <MessageSquare size={18} />
              </div>
              <span className="text-xs font-bold">{post.comments}</span>
            </button>
            <button 
              onClick={performShare}
              className={`flex items-center gap-1.5 transition-colors group/btn ${copied ? 'text-volt' : 'text-slate-400 hover:text-indigo-500'}`}
            >
              <div className={`p-2 rounded-full transition-colors ${copied ? 'bg-volt/10' : 'group-hover/btn:bg-indigo-50'}`}>
                {copied ? <Check size={18} /> : <Share2 size={18} />}
              </div>
              {isDetailed && <span className="text-xs font-bold uppercase tracking-widest">{copied ? 'Copied' : 'Share'}</span>}
            </button>

            {isOwner && (
              <button 
                onClick={performDelete}
                disabled={isDeleting}
                className={`flex items-center gap-1.5 transition-colors group/btn ml-auto ${confirmDelete ? 'text-red-600' : 'text-slate-400 hover:text-red-600'}`}
              >
                <div className={`p-2 rounded-full transition-colors ${confirmDelete ? 'bg-red-50' : 'group-hover/btn:bg-red-50'}`}>
                  {isDeleting ? (
                    <div className="w-[18px] h-[18px] border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </div>
                {(isDetailed || confirmDelete) && (
                  <span className="text-xs font-black uppercase tracking-widest">
                    {isDeleting ? 'Deleting...' : confirmDelete ? 'Sure?' : 'Delete'}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CommentSection({ post }: { post: Post }) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = firebaseService.subscribeToPostComments(post.id, (data) => {
      setComments(data);
      setLoading(false);
    });
    return () => unsub();
  }, [post.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await firebaseService.createPostComment(post.id, content);
    setContent('');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-midnight/5 p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <img 
            src={auth.currentUser?.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${auth.currentUser?.uid}`} 
            className="w-8 h-8 rounded-xl border border-midnight/10 object-cover flex-shrink-0"
            alt="Avatar"
          />
          <div className="flex-1 flex gap-2">
            <input 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Post your reply"
              className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-volt/20 focus:bg-white transition-all"
            />
            <button 
              disabled={!content.trim()}
              type="submit"
              className="bg-volt text-white px-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-volt/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              Reply
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4 ml-4 sm:ml-10 border-l-2 border-midnight/5 pl-4 sm:pl-6">
        {loading ? (
          <p className="text-center py-4 text-slate-300 text-xs font-black uppercase tracking-widest">Loading Replies...</p>
        ) : comments.length === 0 ? (
          <p className="text-center py-4 text-slate-300 text-xs font-black uppercase tracking-widest">No replies yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-2xl border border-midnight/5 p-4">
              <div className="flex gap-3">
                <img 
                  src={comment.authorPhotoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${comment.authorId}`} 
                  className="w-8 h-8 rounded-xl border border-midnight/10 object-cover flex-shrink-0"
                  alt="Avatar"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black uppercase text-[10px] text-midnight">{comment.authorName}</span>
                    <span className="text-slate-300 text-[8px] font-bold">
                       • {comment.createdAt?.toDate ? formatDistanceToNow(comment.createdAt.toDate()) : 'just now'}
                    </span>
                  </div>
                  <p className="text-midnight/80 leading-relaxed text-xs sm:text-sm">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

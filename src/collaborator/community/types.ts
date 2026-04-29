/* eslint-disable */
export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  createdAt: any;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  icon: string;
  memberCount: number;
}

export interface Thread {
  id: string;
  communityId: string;
  title: string;
  authorId: string;
  authorName: string;
  createdAt: any;
  lastMessageAt: any;
  messageCount: number;
  tags: string[];
}

export interface Message {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  createdAt: any;
  type: 'text' | 'image';
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  createdAt: any;
  likes: number;
  likedBy?: string[];
  comments: number;
  sportTag?: string;
  imageUrl?: string;
}

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  createdAt: any;
}

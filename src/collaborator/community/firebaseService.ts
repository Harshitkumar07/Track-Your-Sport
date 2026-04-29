/* eslint-disable */
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  addDoc,
  updateDoc,
  increment,
  writeBatch,
  deleteDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { UserProfile, Community, Thread, Message, Post, PostComment } from './types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firebaseService = {
  // User Profile
  async syncUser(user: any) {
    const userRef = doc(db, 'users', user.uid);
    try {
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        const profile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || 'Anonymous Player',
          photoURL: user.photoURL || '',
          bio: '',
          createdAt: serverTimestamp(),
        };
        await setDoc(userRef, profile);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  },

  // Communities
  async getCommunities(): Promise<Community[]> {
    const path = 'communities';
    try {
      const snap = await getDocs(collection(db, path));
      const existingNames = snap.docs.map(d => d.data().name);
      
      const seeds = [
        { name: 'NBA', description: 'National Basketball Association discussions.', icon: '🏀', memberCount: 1240 },
        { name: 'UEFA', description: 'European Football favorites and transfers.', icon: '⚽', memberCount: 2840 },
        { name: 'CRICKET', description: 'IPL, Test Matches, and World Cup fever.', icon: '🏏', memberCount: 3100 },
        { name: 'TENNIS', description: 'ATP, WTA, and Grand Slam coverage.', icon: '🎾', memberCount: 820 },
        { name: 'E-SPORTS', description: 'VALORANT, CS2, and Dota Pro Circuit.', icon: '🎮', memberCount: 2100 },
        { name: 'NFL', description: 'American Football gridiron talk.', icon: '🏈', memberCount: 950 },
        { name: 'F1', description: 'High-speed Formula 1 chatter.', icon: '🏎️', memberCount: 620 },
      ];

      for (const s of seeds) {
        if (!existingNames.includes(s.name)) {
          const ref = doc(collection(db, 'communities'));
          await setDoc(ref, s);
          
          // Seed threads for new community
          const threadSeeds = s.name === 'CRICKET' ? [
            { title: "IPL 2026 Predictions: Who's taking the trophy?", authorName: "COMMUNITY_BOT", messageCount: 85, tags: ['IPL', 'LIVE'] },
            { title: "Is Test Cricket dying? Debate inside.", authorName: "COMMUNITY_BOT", messageCount: 34, tags: ['TEST', 'DEBATE'] }
          ] : [
            { title: `Welcome to ${s.name} Sector`, authorName: "COMMUNITY_BOT", messageCount: 1, tags: ['Welcome'] }
          ];

          for (const t of threadSeeds) {
            const tRef = doc(collection(db, `communities/${ref.id}/threads`));
            await setDoc(tRef, {
              ...t,
              communityId: ref.id,
              authorId: 'system',
              createdAt: serverTimestamp(),
              lastMessageAt: serverTimestamp(),
            });
            
            const mRef = doc(collection(db, `communities/${ref.id}/threads/${tRef.id}/messages`));
            await setDoc(mRef, {
              threadId: tRef.id,
              authorId: 'system',
              authorName: 'COMMUNITY_BOT',
              authorPhotoURL: '',
              content: `Let the ${t.title} discussion begin!`,
              createdAt: serverTimestamp(),
              type: 'text'
            });
          }
        }
      }

      const finalSnap = await getDocs(collection(db, path));
      
      // Also seed some global posts if empty
      const postsSnap = await getDocs(collection(db, 'posts'));
      if (postsSnap.empty) {
        const postSeeds = [
          { content: "Can't believe India defended that total! Cricket logic is something else. 🏏🔥", authorName: "COMMUNITY_BOT", authorId: "system", likes: 124, comments: 12, sportTag: "CRICKET" },
          { content: "The level of competition in the NBA this season is insane. Every night is a battle. 🏀", authorName: "COMMUNITY_BOT", authorId: "system", likes: 85, comments: 5, sportTag: "NBA" },
          { content: "F1 2026 technical regulations look spicy. Who's excited for the engine changes? 🏎️", authorName: "COMMUNITY_BOT", authorId: "system", likes: 42, comments: 8, sportTag: "F1" },
          { content: "Welcome to THE DUGOUT! This is the home of global sports talk. Share your takes! 🏟️", authorName: "COMMUNITY_BOT", authorId: "system", likes: 250, comments: 45, sportTag: "GENERAL" }
        ];
        for (const p of postSeeds) {
          await addDoc(collection(db, 'posts'), {
            ...p,
            likedBy: [],
            createdAt: serverTimestamp()
          });
        }
      }

      return finalSnap.docs.map(d => ({ id: d.id, ...d.data() } as Community));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  async suggestCommunity(name: string, description: string) {
    const path = 'suggestions';
    try {
      await addDoc(collection(db, path), {
        name,
        description,
        userId: auth.currentUser?.uid,
        userName: auth.currentUser?.displayName,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Threads
  subscribeToThreads(communityId: string, callback: (threads: Thread[]) => void) {
    const path = `communities/${communityId}/threads`;
    const q = query(
      collection(db, path),
      orderBy('lastMessageAt', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Thread)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  async createThread(communityId: string, title: string, tags: string[] = []) {
    if (!auth.currentUser) throw new Error('Unauthenticated');
    const path = `communities/${communityId}/threads`;
    try {
      const thread: Omit<Thread, 'id'> = {
        communityId,
        title,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        messageCount: 0,
        tags,
      };
      const res = await addDoc(collection(db, path), thread);
      return res.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Messages
  subscribeToMessages(communityId: string, threadId: string, callback: (messages: Message[]) => void) {
    const path = `communities/${communityId}/threads/${threadId}/messages`;
    const q = query(
      collection(db, path),
      orderBy('createdAt', 'asc'),
      limit(100)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  async sendMessage(communityId: string, threadId: string, content: string) {
    if (!auth.currentUser) throw new Error('Unauthenticated');
    const messagePath = `communities/${communityId}/threads/${threadId}/messages`;
    const threadPath = `communities/${communityId}/threads/${threadId}`;
    
    try {
      const batch = writeBatch(db);
      
      const message: Omit<Message, 'id'> = {
        threadId,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || 'Anonymous',
        authorPhotoURL: auth.currentUser.photoURL || '',
        content,
        createdAt: serverTimestamp(),
        type: 'text',
      };
      
      const newMessageRef = doc(collection(db, messagePath));
      batch.set(newMessageRef, message);
      
      const threadRef = doc(db, threadPath);
      batch.update(threadRef, {
        lastMessageAt: serverTimestamp(),
        messageCount: increment(1)
      });
      
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, messagePath);
    }
  },

  // Global Posts (The Dugout)
  subscribeToPosts(callback: (posts: Post[]) => void) {
    const path = 'posts';
    const q = query(
      collection(db, path),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  async createPost(content: string, sportTag?: string, imageUrl?: string) {
    if (!auth.currentUser) throw new Error('Unauthenticated');
    const path = 'posts';
    try {
      const post: any = {
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || 'Anonymous',
        authorPhotoURL: auth.currentUser.photoURL || '',
        content,
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
        comments: 0,
      };

      if (sportTag) post.sportTag = sportTag;
      if (imageUrl) post.imageUrl = imageUrl;

      await addDoc(collection(db, path), post);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deletePost(postId: string) {
    if (!auth.currentUser) throw new Error('Unauthenticated');
    const path = `posts/${postId}`;
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async likePost(postId: string) {
    if (!auth.currentUser) return;
    const postRef = doc(db, 'posts', postId);
    const userId = auth.currentUser.uid;
    
    try {
      const snap = await getDoc(postRef);
      if (!snap.exists()) return;
      
      const post = snap.data() as Post;
      const likedBy = post.likedBy || [];
      const isLiked = likedBy.includes(userId);
      
      await updateDoc(postRef, {
        likes: increment(isLiked ? -1 : 1),
        likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `posts/${postId}`);
    }
  },

  // Post Comments
  subscribeToPostComments(postId: string, callback: (comments: PostComment[]) => void) {
    const path = `posts/${postId}/comments`;
    const q = query(
      collection(db, path),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as PostComment)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  async createPostComment(postId: string, content: string) {
    if (!auth.currentUser) throw new Error('Unauthenticated');
    const path = `posts/${postId}/comments`;
    const postRef = doc(db, 'posts', postId);
    
    try {
      const batch = writeBatch(db);
      
      const commentRef = doc(collection(db, path));
      batch.set(commentRef, {
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || 'Anonymous',
        authorPhotoURL: auth.currentUser.photoURL || '',
        content,
        createdAt: serverTimestamp()
      });
      
      batch.update(postRef, {
        comments: increment(1)
      });
      
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
};

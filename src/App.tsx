import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import CharacterCreation from './components/CharacterCreation';
import WorldSimulation from './components/WorldSimulation';
import { motion } from 'motion/react';
import { Shield, LogOut } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser.uid);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-emerald-500">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Shield size={48} />
          <p className="text-zinc-400 font-mono text-sm tracking-widest uppercase">Initializing World Engine...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 max-w-md w-full p-8 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl text-center"
        >
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <Shield className="text-emerald-500" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Hero Society</h1>
          <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
            Enter a living, breathing world where 80% of humanity possesses supernatural abilities. Your actions have permanent consequences.
          </p>
          <button 
            onClick={handleLogin}
            className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-zinc-950 py-12 px-4 relative">
        <div className="absolute top-4 right-4 z-50">
          <button onClick={handleLogout} className="text-zinc-500 hover:text-zinc-300 flex items-center gap-2 text-sm bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
        <CharacterCreation onComplete={() => fetchUserProfile(user.uid)} />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-50">
        <button onClick={handleLogout} className="text-zinc-500 hover:text-zinc-300 flex items-center gap-2 text-sm bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-800">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
      <WorldSimulation userProfile={userProfile} />
    </div>
  );
}

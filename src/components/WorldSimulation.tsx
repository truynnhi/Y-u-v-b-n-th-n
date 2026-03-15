import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { generateWorldResponse } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { Send, User, Shield, Zap, BookOpen, Search } from 'lucide-react';
import LoreGuide from './LoreGuide';

export default function WorldSimulation({ userProfile }: { userProfile: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoreGuide, setShowLoreGuide] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !auth.currentUser || loading) return;

    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    try {
      const messagesRef = collection(db, 'users', auth.currentUser.uid, 'messages');
      
      // Save user message
      await addDoc(messagesRef, {
        role: 'user',
        content: userMsg,
        timestamp: serverTimestamp()
      });

      // Prepare history for AI
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: userMsg });

      // Generate AI response
      const aiResponse = await generateWorldResponse(history, userProfile.character);

      // Save AI response
      await addDoc(messagesRef, {
        role: 'model',
        content: aiResponse,
        timestamp: serverTimestamp()
      });

    } catch (error) {
      console.error("Error in simulation:", error);
      alert("An error occurred while simulating the world.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartSimulation = async () => {
    if (!auth.currentUser || loading) return;
    setLoading(true);
    try {
      const messagesRef = collection(db, 'users', auth.currentUser.uid, 'messages');
      const initialPrompt = "I have just entered the world. Describe my current surroundings, the time of day, any ongoing minor events nearby, and what I am currently doing based on my occupation and background.";
      
      const aiResponse = await generateWorldResponse([{ role: 'user', content: initialPrompt }], userProfile.character);

      await addDoc(messagesRef, {
        role: 'model',
        content: aiResponse,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error starting simulation:", error);
      alert("Failed to start the simulation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Sidebar: Character Profile */}
      <div className="w-80 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col overflow-y-auto">
        <h2 className="text-xl font-bold text-emerald-400 mb-6 tracking-tight flex items-center gap-2">
          <User size={20} /> Identity
        </h2>
        
        <div className="space-y-6">
          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Name</div>
            <div className="text-lg text-zinc-200">{userProfile.character.name}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Age</div>
              <div className="text-zinc-300">{userProfile.character.age}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Occupation</div>
              <div className="text-zinc-300">{userProfile.character.occupation}</div>
            </div>
          </div>

          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
              <Zap size={14} /> Quirk
            </div>
            <div className="text-sm text-zinc-300 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
              {userProfile.character.quirk}
            </div>
          </div>

          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
              <BookOpen size={14} /> Background
            </div>
            <div className="text-sm text-zinc-400 leading-relaxed">
              {userProfile.character.background}
            </div>
          </div>
        </div>
      </div>

      {/* Main Simulation Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 pointer-events-none opacity-50" />
        
        {/* Header */}
        <header className="px-8 py-4 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md z-10 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-zinc-200 flex items-center gap-2">
              <Shield className="text-emerald-500" size={20} />
              World Simulation Engine
            </h1>
            <p className="text-xs text-zinc-500 mt-1">Immersive Hero Society Simulation</p>
          </div>
          <button 
            onClick={() => setShowLoreGuide(!showLoreGuide)}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800 transition-colors"
          >
            <Search size={16} />
            Lore Guide
          </button>
        </header>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 z-10">
          {messages.length === 0 && !loading && (
            <div className="text-center text-zinc-500 mt-20 flex flex-col items-center">
              <p className="mb-4 text-lg">The world awaits your arrival.</p>
              <button 
                onClick={handleStartSimulation}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-medium transition-colors"
              >
                Enter the World
              </button>
            </div>
          )}
          
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-3xl rounded-2xl p-6 ${
                msg.role === 'user' 
                  ? 'bg-emerald-900/30 border border-emerald-800/50 text-emerald-100' 
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
              }`}>
                {msg.role === 'user' ? (
                  <div className="text-sm font-medium mb-2 text-emerald-400">Your Action</div>
                ) : (
                  <div className="text-sm font-medium mb-2 text-zinc-500">World Event</div>
                )}
                <div className="prose prose-invert prose-zinc max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-950">
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-zinc-500 flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200" />
                <span className="ml-2 text-sm">The world is reacting...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800/50 z-10">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Describe your action..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-full pl-6 pr-16 py-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Send size={18} className={input.trim() && !loading ? 'ml-1' : ''} />
            </button>
          </form>
        </div>

        <AnimatePresence>
          {showLoreGuide && <LoreGuide onClose={() => setShowLoreGuide(false)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

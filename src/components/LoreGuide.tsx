import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import { Search, Send, X } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function LoreGuide({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userQuery = query.trim();
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userQuery,
        config: {
          systemInstruction: "You are an expert on the My Hero Academia universe. Answer the user's questions accurately using Google Search.",
          tools: [{ googleSearch: {} }]
        }
      });

      setMessages(prev => [...prev, { role: 'model', content: response.text || "No response." }]);
    } catch (error) {
      console.error("Lore search error:", error);
      setMessages(prev => [...prev, { role: 'model', content: "Failed to retrieve lore information." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-0 right-0 bottom-0 w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col z-50 shadow-2xl"
    >
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
        <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
          <Search size={18} />
          World Lore Guide
        </h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-sm text-zinc-500 text-center mt-10">
            Ask any question about the My Hero Academia universe, quirks, or history.
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-emerald-300 text-right' : 'text-zinc-300 bg-zinc-800/50 p-3 rounded-lg'}`}>
            <Markdown>{msg.content}</Markdown>
          </div>
        ))}
        {loading && (
          <div className="text-sm text-zinc-500 flex items-center gap-2">
            <Search size={14} className="animate-pulse" /> Searching archives...
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            placeholder="Search lore..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-4 pr-10 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1.5 bottom-1.5 text-emerald-500 disabled:text-zinc-600"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </motion.div>
  );
}

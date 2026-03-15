import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { motion } from 'motion/react';

export default function CharacterCreation({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [quirk, setQuirk] = useState('');
  const [background, setBackground] = useState('');
  const [occupation, setOccupation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        character: {
          name,
          age: parseInt(age),
          quirk,
          background,
          occupation,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      onComplete();
    } catch (error) {
      console.error("Error creating character:", error);
      alert("Failed to create character.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-2xl mx-auto p-8 bg-zinc-900 rounded-2xl shadow-2xl text-zinc-100 border border-zinc-800"
    >
      <h2 className="text-3xl font-bold mb-6 text-emerald-400 font-sans tracking-tight">Create Your Identity</h2>
      <p className="mb-8 text-zinc-400">In a world where 80% of the population possesses a Quirk, who are you?</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Full Name</label>
            <input 
              required 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., Kaito Tanaka"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Age</label>
            <input 
              required 
              type="number" 
              value={age} 
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., 18"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Occupation</label>
          <input 
            required 
            type="text" 
            value={occupation} 
            onChange={(e) => setOccupation(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g., U.A. Student, Civilian, Support Engineer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Quirk (Superpower)</label>
          <textarea 
            required 
            value={quirk} 
            onChange={(e) => setQuirk(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24"
            placeholder="Describe your quirk, its type (Emitter, Transformation, Mutant), and its limitations. Or state 'Quirkless'."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Background Story</label>
          <textarea 
            required 
            value={background} 
            onChange={(e) => setBackground(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-32"
            placeholder="Where are you from? What are your motivations and fears?"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? 'Entering the World...' : 'Enter the World'}
        </button>
      </form>
    </motion.div>
  );
}

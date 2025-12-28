'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/api';
import Cookies from 'js-cookie';
import { LogOut, Edit, X, Save, Terminal } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const router = useRouter();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [platform, setPlatform] = useState('codeforces'); 
  const [loading, setLoading] = useState(true);
  
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ codeforces_handle: '', leetcode_handle: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    setIsLoggedIn(!!token);

    const fetchData = async () => {
      setLoading(true);
      try {
        const lbRes = await api.get(`/stats/leaderboard/${platform}`);
        setLeaderboard(lbRes.data);

        if (token) {
          const userRes = await api.get(`/stats/${platform}`);
          setUser(userRes.data);
        }
      } catch (err) {
        console.error("Error loading data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [platform]);

  const handleLogout = () => {
    Cookies.remove('token');
    router.push('/login');
  };

  const openEditModal = () => {
    setEditForm({ 
        codeforces_handle: user?.handle || '', 
        leetcode_handle: '' 
    });
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/profile', editForm);
      alert("Updated.");
      setShowEdit(false);
      window.location.reload(); 
    } catch (err) {
      alert("Failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen text-white p-4 md:p-8">
      
      {/* --- TOP NAV --- */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-8">
         <div className="flex items-center gap-2 text-orange-500 font-mono text-sm opacity-50">
            <Terminal size={16} />
            <span>v1.0.0</span>
         </div>

        {!isLoggedIn ? (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/login')}
            className="border border-orange-500/30 text-orange-500 px-6 py-2 rounded-xl hover:bg-orange-500 hover:text-black transition cursor-pointer font-mono text-sm"
          >
            Login
          </motion.button>
        ) : (
          <div className="flex gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openEditModal}
              className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 flex items-center gap-2 px-4 py-2 rounded-xl text-sm hover:border-orange-500 cursor-pointer transition-colors text-zinc-300"
            >
              <Edit size={14} /> <span className="hidden sm:inline">Edit</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 flex items-center gap-2 px-4 py-2 rounded-xl text-sm hover:border-red-500 hover:text-red-400 cursor-pointer transition-colors text-zinc-300"
            >
              <LogOut size={14} />
            </motion.button>
          </div>
        )}
      </div>

      {/* --- TITLE & TOGGLE HEADER --- */}
      {/* FIXED: 
          1. flex-wrap: Prevents overlap when shrinking.
          2. items-end: Aligns the bottoms of text and toggle perfectly.
          3. ml-auto (on toggle): Pushes toggle to the far right automatically.
      */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-wrap items-end gap-4">
        
        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-5xl md:text-6xl font-black tracking-tighter text-white leading-none"
        >
          DASH<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 pr-2">BOARD</span>
        </motion.h1>

        {/* Toggle (ml-auto pushes it to right) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-1 rounded-xl flex relative ml-auto"
        >
            <button 
                onClick={() => setPlatform('codeforces')}
                className={`relative z-10 px-6 py-2 rounded-lg text-sm font-mono font-bold transition-colors cursor-pointer ${platform === 'codeforces' ? 'text-black' : 'text-zinc-500 hover:text-white'}`}
            >
                CF
                {platform === 'codeforces' && (
                    <motion.div 
                        layoutId="active-pill"
                        className="absolute inset-0 bg-orange-500 rounded-lg shadow-[0_0_10px_rgba(249,115,22,0.4)] -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
            </button>

            <button 
                onClick={() => setPlatform('leetcode')}
                className={`relative z-10 px-6 py-2 rounded-lg text-sm font-mono font-bold transition-colors cursor-pointer ${platform === 'leetcode' ? 'text-black' : 'text-zinc-500 hover:text-white'}`}
            >
                LC
                {platform === 'leetcode' && (
                    <motion.div 
                        layoutId="active-pill"
                        className="absolute inset-0 bg-orange-500 rounded-lg shadow-[0_0_10px_rgba(249,115,22,0.4)] -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
            </button>
        </motion.div>
      </div>

      {/* --- USER STATS CARD --- */}
      <AnimatePresence mode='wait'>
        {isLoggedIn && user && (
            <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 max-w-5xl mx-auto mb-8 p-8 rounded-2xl flex justify-between items-center relative overflow-hidden"
            >
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
                <p className="text-orange-500 font-mono text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                    Live Stats
                </p>
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold text-white tracking-tight">{user.handle}</h2>
                    <div className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-sm font-mono font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                        <span>#</span>{user.websiteRank}
                    </div>
                </div>
            </div>

            <div className="text-right relative z-10">
                <p className="text-zinc-500 text-xs font-mono uppercase mb-1">
                    {platform === 'codeforces' ? 'Rating' : 'Solved'}
                </p>
                
                <motion.div 
                    key={platform} 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-end"
                >
                    <span className="text-5xl font-mono font-bold text-white leading-none">
                        {platform === 'codeforces' ? user.rating : user.solved}
                    </span>
                    <span className="text-lg font-mono text-zinc-400 mt-1">
                         {platform === 'codeforces' 
                            ? `${user.solved || 0} Solved`
                            : `Rating: ${user.rating || 0}`
                         }
                    </span>
                </motion.div>
            </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- LEADERBOARD TABLE --- */}
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/5 text-zinc-500 text-xs font-mono uppercase tracking-wider border-b border-white/5">
            <tr>
              <th className="p-5 font-medium w-20">Rank</th>
              <th className="p-5 font-medium">User Handle</th>
              <th className="p-5 font-medium text-right">
                  {platform === 'codeforces' ? 'Solved' : 'Rating'}
              </th>
              <th className="p-5 font-medium text-right">
                  {platform === 'codeforces' ? 'Rating' : 'Solved'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
               [...Array(5)].map((_, i) => (
                   <tr key={i} className="animate-pulse">
                       <td className="p-5"><div className="h-4 w-8 bg-white/5 rounded"></div></td>
                       <td className="p-5"><div className="h-4 w-32 bg-white/5 rounded"></div></td>
                       <td className="p-5 text-right"><div className="h-4 w-12 bg-white/5 rounded ml-auto"></div></td>
                       <td className="p-5 text-right"><div className="h-4 w-12 bg-white/5 rounded ml-auto"></div></td>
                   </tr>
               ))
            ) : leaderboard.map((u, idx) => (
              <motion.tr 
                key={u.id || idx} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }} 
                className={`
                    hover:bg-orange-500/5 transition-colors duration-200 group
                    ${user && u.handle === user.handle ? 'bg-orange-500/10' : ''}
                `}
              >
                <td className="p-5 font-mono text-zinc-400 group-hover:text-orange-500 transition-colors">
                    {idx + 1 < 4 ? <span className="text-orange-400 font-bold">#{idx + 1}</span> : <span className="opacity-50">#{idx + 1}</span>}
                </td>
                <td className="p-5 font-semibold text-zinc-200 flex items-center gap-3">
                    {u.handle}
                    {user && u.handle === user.handle && <span className="text-[10px] bg-orange-500 text-black px-2 py-0.5 rounded font-bold uppercase tracking-wide">YOU</span>}
                </td>
                
                <td className="p-5 text-right font-mono text-zinc-400 text-base">
                  {platform === 'codeforces' ? u.cf_solved : u.lc_rating}
                </td>

                <td className="p-5 text-right font-mono text-white text-lg font-medium group-hover:text-orange-500 transition-colors">
                  {platform === 'codeforces' ? u.cf_rating : u.lc_solved}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- EDIT MODAL (Unchanged) --- */}
      <AnimatePresence>
      {showEdit && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ duration: 0.3 }}
            className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl w-full max-w-md relative shadow-2xl"
          >
            <button onClick={() => setShowEdit(false)} className="absolute top-5 right-5 text-zinc-500 hover:text-white cursor-pointer transition">
                <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-6 text-white font-mono">Update_Profile()</h3>
            <form onSubmit={handleUpdate} className="flex flex-col gap-5">
               <div>
                   <label className="text-xs text-zinc-500 font-mono uppercase ml-1 mb-2 block">var cf_handle =</label>
                   <input 
                        value={editForm.codeforces_handle}
                        onChange={(e) => setEditForm({...editForm, codeforces_handle: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl outline-none transition-all text-sm bg-black/60 border border-orange-500/20 text-orange-500 font-mono focus:ring-1 focus:ring-orange-500 text-white" 
                    />
               </div>
               <div>
                   <label className="text-xs text-zinc-500 font-mono uppercase ml-1 mb-2 block">var lc_handle =</label>
                   <input 
                        value={editForm.leetcode_handle}
                        onChange={(e) => setEditForm({...editForm, leetcode_handle: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl outline-none transition-all text-sm bg-black/60 border border-orange-500/20 text-orange-500 font-mono focus:ring-1 focus:ring-orange-500 text-white" 
                    />
               </div>
               <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={saving}
                className="w-full mt-4 py-3 rounded-xl cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 tracking-wide uppercase text-sm bg-orange-500 text-black font-semibold shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]"
               >
                   {saving ? 'Executing...' : <><Save size={16} /> COMMIT CHANGES</>}
               </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
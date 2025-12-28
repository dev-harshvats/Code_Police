'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/api';
import Cookies from 'js-cookie';
import { LogOut, Edit, X, Save, Terminal, Target, CheckCircle } from 'lucide-react'; 
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
  
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [newGoal, setNewGoal] = useState(3);
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
          setNewGoal(userRes.data.dailyGoal || 3);
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
    setEditForm({ codeforces_handle: user?.handle || '', leetcode_handle: '' });
    setShowEdit(true);
  };

  const handleUpdateProfile = async (e) => {
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

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
        await api.put('/auth/goal', { daily_goal: parseInt(newGoal) });
        setUser({...user, dailyGoal: parseInt(newGoal)});
        setShowGoalEdit(false);
    } catch (err) {
        alert("Failed.");
    } finally {
        setSaving(false);
    }
  };

  const goal = user?.dailyGoal || 1;
  const progress = user?.todaySolved || 0;
  const percentage = Math.min(100, (progress / goal) * 100);
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="min-h-screen text-white p-4 md:p-8">
      
      {/* --- TOP NAV --- */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-8">
         <div className="flex items-center gap-2 text-orange-500 font-mono text-sm opacity-50">
            <Terminal size={16} />
            <span>v1.0.0</span>
         </div>
         {isLoggedIn && (
            <div className="flex gap-4">
                 <button onClick={handleLogout} className="text-zinc-500 hover:text-red-400 transition"><LogOut size={18} /></button>
            </div>
         )}
      </div>

      {/* --- TITLE & TOGGLE --- */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-wrap items-end gap-4">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
          className="text-5xl md:text-6xl font-black tracking-tighter text-white leading-none"
        >
          DASH<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 pr-2">BOARD</span>
        </motion.h1>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-1 rounded-xl flex relative ml-auto">
            {['codeforces', 'leetcode'].map(p => (
                <button key={p} onClick={() => setPlatform(p)} className={`relative z-10 px-6 py-2 rounded-lg text-sm font-mono font-bold transition-colors cursor-pointer ${platform === p ? 'text-black' : 'text-zinc-500 hover:text-white'}`}>
                    {p === 'codeforces' ? 'CF' : 'LC'}
                    {platform === p && <motion.div layoutId="active-pill" className="absolute inset-0 bg-orange-500 rounded-lg shadow-[0_0_10px_rgba(249,115,22,0.4)] -z-10" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                </button>
            ))}
        </motion.div>
      </div>

      {/* --- STATS GRID --- */}
      <AnimatePresence mode='wait'>
        {isLoggedIn && user && (
            <div className="max-w-5xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. MAIN STATS CARD */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl flex justify-between items-center relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                        <p className="text-orange-500 font-mono text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span> Live Stats
                        </p>
                        <div className="flex items-center gap-4">
                            <h2 className="text-3xl font-bold text-white tracking-tight">{user.handle}</h2>
                            <div className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-sm font-mono font-bold flex items-center gap-1">
                                <span>#</span>{user.websiteRank}
                            </div>
                        </div>
                        <button onClick={openEditModal} className="mt-4 flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition"><Edit size={12}/> Edit Profile</button>
                    </div>
                    <div className="text-right relative z-10">
                        <p className="text-zinc-500 text-xs font-mono uppercase mb-1">{platform === 'codeforces' ? 'Rating' : 'Solved'}</p>
                        <span className="text-5xl font-mono font-bold text-white leading-none">{platform === 'codeforces' ? user.rating : user.solved}</span>
                        <p className="text-lg font-mono text-zinc-400 mt-1">{platform === 'codeforces' ? `${user.solved || 0} Solved` : `Rating: ${user.rating || 0}`}</p>
                    </div>
                </motion.div>

                {/* 2. DAILY GOAL CARD */}
                <motion.div 
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                    className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-1">Daily Goal</p>
                            <h3 className="text-2xl font-bold text-white">{user.todaySolved} <span className="text-zinc-500 text-lg">/ {user.dailyGoal}</span></h3>
                        </div>
                        <div className="relative w-16 h-16">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="32" cy="32" r={radius} stroke="#3f3f46" strokeWidth="6" fill="transparent" />
                                <circle cx="32" cy="32" r={radius} stroke="#f97316" strokeWidth="6" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-orange-500">
                                {progress >= goal ? <CheckCircle size={20} /> : <Target size={20} />}
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowGoalEdit(true)}
                        className="mt-4 w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-400 hover:text-white transition flex items-center justify-center gap-2"
                    >
                        Adjust Goal
                    </button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* --- LEADERBOARD --- */}
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
         <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-zinc-500 text-xs font-mono uppercase tracking-wider border-b border-white/5">
                <tr>
                    <th className="p-5 font-medium w-20">Rank</th>
                    <th className="p-5 font-medium">User Handle</th>
                    <th className="p-5 font-medium text-right">{platform === 'codeforces' ? 'Solved' : 'Rating'}</th>
                    <th className="p-5 font-medium text-right">{platform === 'codeforces' ? 'Rating' : 'Solved'}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {leaderboard.map((u, idx) => (
                     <tr key={idx} className={`${user && u.handle === user.handle ? 'bg-orange-500/10' : ''}`}>
                        <td className="p-5 font-mono text-zinc-400 group-hover:text-orange-500 transition-colors">
                            {idx + 1 < 4 ? <span className="text-orange-400 font-bold">#{idx + 1}</span> : <span className="opacity-50">#{idx + 1}</span>}
                        </td>
                        <td className="p-5 font-semibold text-zinc-200">{u.handle}</td>
                        <td className="p-5 text-right font-mono text-zinc-400">{platform === 'codeforces' ? u.cf_solved : u.lc_rating}</td>
                        <td className="p-5 text-right font-mono text-white">{platform === 'codeforces' ? u.cf_rating : u.lc_solved}</td>
                     </tr>
                ))}
            </tbody>
         </table>
      </div>

      {/* --- EDIT GOAL MODAL --- */}
      <AnimatePresence>
        {showGoalEdit && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-zinc-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm relative">
                    <button onClick={() => setShowGoalEdit(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={18} /></button>
                    <h3 className="text-lg font-bold text-white mb-4">Set Daily Target</h3>
                    <input 
                        type="number" min="1" max="50"
                        value={newGoal} onChange={(e) => setNewGoal(e.target.value)}
                        className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white font-mono mb-4 focus:border-orange-500 outline-none"
                    />
                    <button onClick={handleUpdateGoal} className="w-full py-2 bg-orange-500 text-black font-bold rounded-lg hover:bg-orange-400 transition">Save Goal</button>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- EDIT PROFILE MODAL --- */}
      <AnimatePresence>
      {showEdit && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl w-full max-w-md relative shadow-2xl">
            <button onClick={() => setShowEdit(false)} className="absolute top-5 right-5 text-zinc-500 hover:text-white cursor-pointer transition"><X size={20} /></button>
            <h3 className="text-xl font-bold mb-6 text-white font-mono">Update_Profile()</h3>
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
               <div><label className="text-xs text-zinc-500 font-mono uppercase ml-1 mb-2 block">var cf_handle =</label><input value={editForm.codeforces_handle} onChange={(e) => setEditForm({...editForm, codeforces_handle: e.target.value})} className="w-full px-4 py-3 rounded-xl outline-none transition-all text-sm bg-black/60 border border-orange-500/20 text-orange-500 font-mono focus:ring-1 focus:ring-orange-500 text-white" /></div>
               <div><label className="text-xs text-zinc-500 font-mono uppercase ml-1 mb-2 block">var lc_handle =</label><input value={editForm.leetcode_handle} onChange={(e) => setEditForm({...editForm, leetcode_handle: e.target.value})} className="w-full px-4 py-3 rounded-xl outline-none transition-all text-sm bg-black/60 border border-orange-500/20 text-orange-500 font-mono focus:ring-1 focus:ring-orange-500 text-white" /></div>
               <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={saving} className="w-full mt-4 py-3 rounded-xl cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 tracking-wide uppercase text-sm bg-orange-500 text-black font-semibold shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]">{saving ? 'Executing...' : <><Save size={16} /> COMMIT CHANGES</>}</motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
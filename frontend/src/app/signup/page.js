'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import { Mail, Lock, User, Terminal, AlertTriangle, CheckCircle } from 'lucide-react'; 

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '', password: '', cfHandle: '', leetcodeHandle: ''
  });
  
  // State for the Custom Dialog
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, message: '' });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- 1. CUSTOM VALIDATION (Replaces Browser Default) ---
    if (!formData.email.trim() || !formData.password.trim()) {
        setErrorDialog({ isOpen: true, message: 'Critical: Email and Password are mandatory fields.' });
        return;
    }

    if (!formData.cfHandle.trim() && !formData.leetcodeHandle.trim()) {
        setErrorDialog({ isOpen: true, message: 'Requirement: At least one handle (CF or LC) must be provided.' });
        return;
    }

    try {
      const res = await api.post('/auth/signup', formData);
      Cookies.set('token', res.data.token, { expires: 7 }); 
      router.push('/dashboard');
    } catch (err) {
      setErrorDialog({ isOpen: true, message: err.response?.data?.msg || 'Signup process failed.' });
    }
  };

  const getIcon = (fieldName) => {
    switch(fieldName) {
        case 'email': return <Mail size={18} />;
        case 'password': return <Lock size={18} />;
        case 'cfHandle': return <Terminal size={18} />;
        case 'leetcodeHandle': return <Terminal size={18} />;
        default: return <User size={18} />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 shadow-2xl w-[380px] px-8 py-10 rounded-2xl flex flex-col items-center"
      >
        <h2 className="text-3xl text-white font-bold mb-2 tracking-tight">System<span className="text-orange-500">Init</span></h2>
        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-8">Create New User</p>

        {/* Added noValidate to stop default browser bubbles */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4" noValidate>
          
          {['email', 'password'].map((field, index) => (
            <motion.div key={field} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * index, duration: 0.4 }} className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">{getIcon(field)}</div>
              <input 
                name={field}
                type={field === 'password' ? 'password' : 'text'}
                placeholder={field === 'email' ? 'Email Address' : 'Password'}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all text-sm bg-black/60 border border-orange-500/20 text-orange-500 font-mono placeholder:text-white/30 placeholder:font-sans focus:ring-1 focus:ring-orange-500"
              />
            </motion.div>
          ))}

          {['cfHandle', 'leetcodeHandle'].map((field, index) => (
            <motion.div key={field} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + (0.1 * index), duration: 0.4 }} className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">{getIcon(field)}</div>
              <input 
                name={field}
                type="text"
                placeholder={field === 'cfHandle' ? 'Codeforces Handle (Optional)' : 'LeetCode Handle (Optional)'}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all text-sm bg-black/60 border border-orange-500/20 text-orange-500 font-mono placeholder:text-white/30 placeholder:font-sans focus:ring-1 focus:ring-orange-500"
              />
            </motion.div>
          ))}

          <motion.button 
            type="submit" 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.4 } }}
            whileHover={{ scale: 1.05, transition: { duration: 0.1 } }}
            whileTap={{ scale: 0.95 }}
            className="w-full mt-4 py-3 rounded-xl cursor-pointer tracking-wide uppercase text-sm bg-orange-500 text-black font-semibold shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]"
          >
            Initialize
          </motion.button>
        </form>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.4 }} className="mt-6 text-xs text-zinc-500">
          Already registered? <Link href="/login" className="text-orange-500 hover:text-orange-400 cursor-pointer font-mono hover:underline">./login</Link>
        </motion.p>
      </motion.div>

      {/* --- CUSTOM ERROR DIALOG (Main Theme) --- */}
      <AnimatePresence>
        {errorDialog.isOpen && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setErrorDialog({ ...errorDialog, isOpen: false })} // Close on background click
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()} // Prevent close on modal click
                    className="bg-zinc-900 border border-orange-500/30 p-6 rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(249,115,22,0.1)] relative"
                >
                    <div className="flex items-center gap-3 mb-4 text-orange-500">
                        <AlertTriangle size={24} />
                        <h3 className="font-mono font-bold text-lg">System.Error()</h3>
                    </div>
                    
                    <p className="text-zinc-400 text-sm font-mono mb-6 leading-relaxed">
                        {errorDialog.message}
                    </p>

                    <button 
                        onClick={() => setErrorDialog({ ...errorDialog, isOpen: false })}
                        className="w-full py-2 rounded-lg bg-orange-500/10 border border-orange-500/50 text-orange-500 hover:bg-orange-500 hover:text-black transition-all font-mono text-sm uppercase font-bold tracking-wide"
                    >
                        [ Acknowledge ]
                    </button>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
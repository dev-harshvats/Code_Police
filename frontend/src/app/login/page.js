'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/api';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertTriangle } from 'lucide-react'; // Added AlertTriangle

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  
  // New Dialog State
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Custom Validation
    if (!formData.email.trim() || !formData.password.trim()) {
        setErrorDialog({ isOpen: true, message: 'Authentication Error: Email and Password are required.' });
        return;
    }

    try {
      const res = await api.post('/auth/login', formData);
      Cookies.set('token', res.data.token, { expires: 7 }); 
      router.push('/dashboard');
    } catch (err) {
      // Show Custom Dialog on API Error
      setErrorDialog({ 
          isOpen: true, 
          message: err.response?.data?.msg || 'Access Denied: Invalid credentials.' 
      });
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
        <h2 className="text-3xl text-white font-bold mb-2 tracking-tight">System<span className="text-orange-500">Login</span></h2>
        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-8">Access Dashboard</p>

        {/* Removed the old simple error div */}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4" noValidate>
          
          {/* EMAIL INPUT */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="relative"
          >
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                name="email" 
                type="email" 
                placeholder="Email Address" 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all text-sm bg-black/60 border border-orange-500/20 text-orange-500 font-mono placeholder:text-white/30 placeholder:font-sans focus:ring-1 focus:ring-orange-500"
              />
          </motion.div>
          
          {/* PASSWORD INPUT */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="relative"
          >
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                name="password" 
                type="password" 
                placeholder="Password" 
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all text-sm bg-black/60 border border-orange-500/20 text-orange-500 font-mono placeholder:text-white/30 placeholder:font-sans focus:ring-1 focus:ring-orange-500"
              />
          </motion.div>

          <motion.button 
            type="submit" 
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { delay: 0.3, duration: 0.4 } 
            }}
            whileHover={{ 
              scale: 1.05, 
              transition: { duration: 0.1 } 
            }}
            whileTap={{ scale: 0.95 }}
            className="w-full mt-4 py-3 rounded-xl cursor-pointer tracking-wide uppercase text-sm bg-orange-500 text-black font-semibold shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]"
          >
            Authenticate
          </motion.button>
        </form>

        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-6 text-xs text-zinc-500"
        >
          New User? <Link href="/signup" className="text-orange-500 hover:text-orange-400 cursor-pointer font-mono hover:underline">./signup</Link>
        </motion.p>
      </motion.div>

      {/* --- CUSTOM ERROR DIALOG --- */}
      <AnimatePresence>
        {errorDialog.isOpen && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setErrorDialog({ ...errorDialog, isOpen: false })}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-zinc-900 border border-orange-500/30 p-6 rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(249,115,22,0.1)] relative"
                >
                    <div className="flex items-center gap-3 mb-4 text-orange-500">
                        <AlertTriangle size={24} />
                        <h3 className="font-mono font-bold text-lg">Access.Denied()</h3>
                    </div>
                    
                    <p className="text-zinc-400 text-sm font-mono mb-6 leading-relaxed">
                        {errorDialog.message}
                    </p>

                    <button 
                        onClick={() => setErrorDialog({ ...errorDialog, isOpen: false })}
                        className="w-full py-2 rounded-lg bg-orange-500/10 border border-orange-500/50 text-orange-500 hover:bg-orange-500 hover:text-black transition-all font-mono text-sm uppercase font-bold tracking-wide"
                    >
                        [ Retry ]
                    </button>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
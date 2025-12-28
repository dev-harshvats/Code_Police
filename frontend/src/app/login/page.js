'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/api';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react'; // Import Icons

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', formData);
      Cookies.set('token', res.data.token, { expires: 7 }); 
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid credentials');
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

        {error && (
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-orange-500 text-xs mb-4 text-center bg-orange-900/10 px-4 py-2 rounded-xl border border-orange-500/20 w-full font-mono"
            >
                {`> Error: ${error}`}
            </motion.div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          
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
                required
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
                required
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
    </div>
  );
}
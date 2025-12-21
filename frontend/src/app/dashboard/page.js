'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/api'; // The Axios instance we created
import Cookies from 'js-cookie';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Check if token exists
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login'); // Redirect if not logged in
      return;
    }

    // 2. Fetch Codeforces Stats
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats/codeforces');
        setStats(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch stats", err);
        setError("Could not load Codeforces data. Check your handle.");
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  // 3. Handle Loading State
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-blue-600">Loading your stats...</div>
      </div>
    );
  }

  // 4. Handle Error State
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  // 5. Render Dashboard
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Coding Dashboard</h1>
          <button 
            onClick={() => {
              Cookies.remove('token');
              router.push('/login'); // We will build login next
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
          >
            Logout
          </button>
        </div>

        {/* Platform Toggles (Visual only for now) */}
        <div className="flex space-x-4 mb-8">
          <button className="px-6 py-2 bg-blue-600 text-white rounded shadow">Codeforces</button>
          <button className="px-6 py-2 bg-white text-gray-600 rounded shadow hover:bg-gray-100">LeetCode</button>
          <button className="px-6 py-2 bg-white text-gray-600 rounded shadow hover:bg-gray-100">GeeksForGeeks</button>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <img 
              src={stats.titlePhoto} 
              alt="Avatar" 
              className="w-20 h-20 rounded-full border-2 border-gray-200"
            />
            
            {/* User Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{stats.handle}</h2>
              <p className="text-gray-500">Rank: <span className="font-semibold text-blue-600 capitalize">{stats.rank}</span></p>
              <p className="text-gray-500">Current Rating: <span className="font-bold text-black">{stats.rating}</span></p>
              <p className="text-gray-500">Max Rating: <span className="font-bold text-green-600">{stats.maxRating}</span></p>
            </div>
          </div>
        </div>

        {/* Future Section: Daily Progress */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow h-40 flex flex-col justify-center items-center">
            <h3 className="text-gray-500 mb-2">Daily Goal</h3>
            <p className="text-3xl font-bold text-gray-800">0 / 3</p>
            <span className="text-sm text-yellow-500 mt-1">Keep pushing!</span>
          </div>
          <div className="bg-white p-6 rounded-lg shadow h-40 flex flex-col justify-center items-center">
            <h3 className="text-gray-500 mb-2">Total Solved</h3>
            <p className="text-3xl font-bold text-gray-800">--</p>
            <span className="text-sm text-gray-400">Coming soon via Scraper</span>
          </div>
        </div>

      </div>
    </div>
  );
}
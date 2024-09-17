'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Redirect to Google OAuth authorization endpoint
  const handleAuthorize = () => {
    window.location.href = '/api/authorize'; // Redirect to authorize route
  };

  // Fetch YouTube stats using the access token
  const fetchStats = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`/api/youtubeStats?accessToken=${accessToken}`);
      const data = await res.json();
      setStats(data);
      await updateSheet(data);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateSheet = async (stats: any) => {
    try {
      const res = await fetch('/api/googleSheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken, stats }),
      });

      if (!res.ok) {
        throw new Error('Failed to update sheet');
      }

      console.log('Sheet updated successfully');
    } catch (error) {
      console.error('Error updating sheet:', error);
    }
  };

  // Extract the access token from URL on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('access_token');
    if (token) {
      setAccessToken(token);
    }
  }, []);

  // Fetch stats when access token is available
  useEffect(() => {
    if (accessToken) {
      fetchStats();
    }
  }, [accessToken]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
          YouTube Channel Stats 
        </h1>

        {!accessToken ? (
          <button
            onClick={handleAuthorize}
            className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
          >
            Authorize with Google
          </button>
        ) : (
          <button
            onClick={fetchStats}
            className="w-full py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-200"
          >
            Fetch YouTube Stats
          </button>
        )}

        {stats && (
          <div className="mt-6 p-4 bg-gray-200 rounded-lg">
            <p className="text-lg font-semibold text-gray-700">Hours Watched:</p>
            <p className="text-xl text-gray-900">{stats.totalViews}</p>
            <p className="text-lg font-semibold text-gray-700 mt-2">Likes:</p>
            <p className="text-xl text-gray-900">{stats.totalLikes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

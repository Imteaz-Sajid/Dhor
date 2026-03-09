import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { postAPI } from '../services/api';

const CRIME_TYPES = ['theft', 'assault', 'vandalism', 'robbery', 'fraud', 'harassment', 'other'];

const crimeColors = {
  theft: 'bg-yellow-100 text-yellow-700',
  assault: 'bg-red-100 text-red-700',
  vandalism: 'bg-orange-100 text-orange-700',
  robbery: 'bg-red-200 text-red-800',
  fraud: 'bg-purple-100 text-purple-700',
  harassment: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-600',
};

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const Home = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', crimeType: 'other' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [loadingPosts, setLoadingPosts] = useState(true);

  const fetchPosts = async () => {
    try {
      const data = await postAPI.getPosts();
      setPosts(data.posts || []);
    } catch {
      // silently ignore
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    setFormSuccess('');
    try {
      await postAPI.createPost(formData);
      setFormSuccess('Crime report submitted! Nearby users have been notified.');
      setFormData({ title: '', description: '', crimeType: 'other' });
      setShowForm(false);
      fetchPosts();
    } catch (err) {
      setFormError(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto pb-10">
        {/* Welcome card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mt-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Welcome{user.name ? `, ${user.name}` : ''}!
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {user.thana && user.district ? `${user.thana}, ${user.district}` : 'Your community safety dashboard'}
              </p>
            </div>
            <button
              onClick={() => { setShowForm((v) => !v); setFormError(''); setFormSuccess(''); }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Report Crime
            </button>
          </div>

          {/* Success banner */}
          {formSuccess && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {formSuccess}
            </div>
          )}

          {/* Report Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-800">New Crime Report</h3>
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crime Type</label>
                <select
                  value={formData.crimeType}
                  onChange={(e) => setFormData({ ...formData, crimeType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CRIME_TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief title of the incident"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what happened..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Crime Feed */}
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Reports</h3>

        {loadingPosts ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            No reports yet. Be the first to report an incident.
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${crimeColors[post.crimeType] || crimeColors.other}`}>
                        {post.crimeType}
                      </span>
                      <span className="text-xs text-gray-400">{post.thana}, {post.district}</span>
                    </div>
                    <h4 className="font-semibold text-gray-800 text-sm">{post.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{post.description}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{post.postedBy || 'Anonymous'}</span>
                  <span>·</span>
                  <span>{timeAgo(post.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;

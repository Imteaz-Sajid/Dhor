import React, { useState, useEffect } from 'react';
import { locationData, districts } from '../data/locations';
import { userAPI } from '../services/api';
import Navbar from '../components/Navbar';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit form state
  const [formData, setFormData] = useState({
    name: '',
    district: '',
    thana: '',
  });
  const [thanas, setThanas] = useState([]);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        setUser(response.user);
        setFormData({
          name: response.user.name,
          district: response.user.district,
          thana: response.user.thana,
        });
        setThanas(locationData[response.user.district] || []);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'district') {
      setFormData({
        ...formData,
        district: value,
        thana: '',
      });
      setThanas(locationData[value] || []);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle profile update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await userAPI.updateProfile(formData);
      setUser(response.user);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      name: user.name,
      district: user.district,
      thana: user.thana,
    });
    setThanas(locationData[user.district] || []);
    setIsEditing(false);
    setError('');
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Trust score color based on level
  const getTrustColor = (score) => {
    if (score >= 80) return 'from-green-400 to-emerald-500';
    if (score >= 50) return 'from-yellow-400 to-amber-500';
    if (score >= 20) return 'from-orange-400 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  // Badge styles
  const getBadgeStyle = (badge) => {
    const styles = {
      Rookie: 'bg-gray-100 text-gray-700 border-gray-300',
      Contributor: 'bg-blue-100 text-blue-700 border-blue-300',
      Trusted: 'bg-green-100 text-green-700 border-green-300',
      Veteran: 'bg-purple-100 text-purple-700 border-purple-300',
      Guardian: 'bg-yellow-100 text-yellow-800 border-yellow-400',
    };
    return styles[badge] || 'bg-indigo-100 text-indigo-700 border-indigo-300';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center pt-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm text-center">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && !isEditing && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* ─── Profile Card ─── */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Banner */}
            <div className="h-28 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {getInitials(user?.name)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-16 pb-6 px-6 text-center">
              {!isEditing ? (
                /* ─── View Mode ─── */
                <>
                  <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{user?.email}</p>

                  {/* Phone & NID */}
                  <div className="mt-3 flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{user?.phone}</span>
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center space-x-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                      </svg>
                      <span>NID: {user?.nid}</span>
                    </span>
                  </div>

                  {/* District & Thana */}
                  <div className="mt-2 flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{user?.district}</span>
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center space-x-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{user?.thana}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-6 inline-flex items-center px-5 py-2 border border-indigo-300 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                </>
              ) : (
                /* ─── Edit Mode ─── */
                <form onSubmit={handleUpdate} className="text-left space-y-5 mt-2">
                  {error && (
                    <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* District */}
                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                      District
                    </label>
                    <select
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      <option value="">Select District</option>
                      {districts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Thana */}
                  <div>
                    <label htmlFor="thana" className="block text-sm font-medium text-gray-700 mb-1">
                      Thana / Upazila
                    </label>
                    <select
                      id="thana"
                      name="thana"
                      value={formData.thana}
                      onChange={handleChange}
                      required
                      disabled={!formData.district}
                      className={`w-full px-4 py-2.5 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm ${
                        !formData.district ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                      }`}
                    >
                      <option value="">
                        {formData.district ? 'Select Thana/Upazila' : 'First select a district'}
                      </option>
                      {thanas.map((thana) => (
                        <option key={thana} value={thana}>
                          {thana}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* ─── Community Trust Dashboard ─── */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Community Trust Dashboard
            </h3>

            {/* Trust Score */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Trust Score</span>
                <span className="text-sm font-bold text-gray-900">{user?.trustScore ?? 0} / 100</span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getTrustColor(user?.trustScore ?? 0)} transition-all duration-700 ease-out`}
                  style={{ width: `${Math.min(user?.trustScore ?? 0, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {(user?.trustScore ?? 0) >= 80
                  ? 'Excellent — you are a trusted community member!'
                  : (user?.trustScore ?? 0) >= 50
                  ? 'Good standing — keep contributing!'
                  : (user?.trustScore ?? 0) >= 20
                  ? 'Getting started — report incidents to boost your score.'
                  : 'New member — welcome to the community!'}
              </p>
            </div>

            {/* Badges */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Your Badges</h4>
              <div className="flex flex-wrap gap-2">
                {(user?.badges || ['Rookie']).map((badge, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getBadgeStyle(badge)} shadow-sm`}
                  >
                    {/* Star icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Profile;

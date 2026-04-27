import React, { useState, useEffect } from 'react';
import { locationData, districts } from '../data/locations';
import { userAPI, reportAPI, notificationAPI } from '../services/api';
import Navbar from '../components/Navbar';
import CreateReport from '../components/CreateReport';

const crimeColors = {
  Extortion: 'bg-orange-100 text-orange-700',
  Theft: 'bg-yellow-100 text-yellow-700',
  Robbery: 'bg-red-200 text-red-800',
  Harassment: 'bg-pink-100 text-pink-700',
  Assault: 'bg-red-100 text-red-700',
  Other: 'bg-gray-100 text-gray-600',
};

const statusColors = {
  Pending: 'bg-yellow-50 text-yellow-600 border border-yellow-200',
  Verified: 'bg-green-50 text-green-600 border border-green-200',
  Rejected: 'bg-red-50 text-red-600 border border-red-200',
  Resolved: 'bg-blue-50 text-blue-600 border border-blue-200',
};

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [myReports, setMyReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

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
    fetchMyReports();
    fetchNotifications();
  }, []);

  const fetchMyReports = async () => {
    try {
      const data = await reportAPI.getMyReports();
      setMyReports(data.reports || []);
    } catch {
      // non-critical
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await notificationAPI.getNotifications();
      setNotifications(data.notifications || []);
    } catch {
      // non-critical
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silent
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // silent
    }
  };

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
      let avatarUrl;
      if (avatarFile) {
        setUploadingAvatar(true);
        const uploadRes = await reportAPI.uploadAvatar(avatarFile);
        avatarUrl = uploadRes.imageUrl;
        setUploadingAvatar(false);
      }

      const payload = { ...formData };
      if (avatarUrl) payload.profilePicture = avatarUrl;

      const response = await userAPI.updateProfile(payload);
      setUser(response.user);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      localStorage.setItem('user', JSON.stringify(response.user));
      setAvatarFile(null);
      setAvatarPreview(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Update error:', err);
      setUploadingAvatar(false);
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
    setAvatarFile(null);
    setAvatarPreview(null);
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
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {getInitials(user?.name)}
                      </span>
                    </div>
                  )}
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

                  <div className="flex justify-center gap-3 mt-6">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-5 py-2 border border-indigo-300 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="inline-flex items-center px-5 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                  >
                    📋 Create Report
                  </button>
                  </div>
                </>
              ) : (
                /* ─── Edit Mode ─── */
                <form onSubmit={handleUpdate} className="text-left space-y-5 mt-2">
                  {error && (
                    <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Profile Picture Upload */}
                  <div className="flex flex-col items-center">
                    <label className="cursor-pointer group relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-gray-300 group-hover:border-indigo-400 transition-colors">
                        {avatarPreview || user?.profilePicture ? (
                          <img src={avatarPreview || user?.profilePicture} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setAvatarFile(file);
                            setAvatarPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                    <p className="text-xs text-gray-400 mt-2">Click to change profile picture</p>
                  </div>

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
                      disabled={saving || uploadingAvatar}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingAvatar ? 'Uploading photo...' : saving ? 'Saving...' : 'Save Changes'}
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

          {/* ─── Notifications ─── */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Notifications
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
              </h3>
              {notifications.some((n) => !n.isRead) && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={markingAll}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
                >
                  {markingAll ? 'Marking...' : 'Mark all read'}
                </button>
              )}
            </div>

            {loadingNotifs ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center py-12 px-6">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm font-medium">No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {notifications.map((notif) => (
                  <li
                    key={notif._id}
                    className={`flex items-start gap-3 px-5 py-4 transition-colors ${
                      notif.isRead ? 'bg-white' : 'bg-indigo-50/50'
                    }`}
                  >
                    {/* Dot */}
                    <span className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${
                      notif.isRead ? 'bg-gray-200' : 'bg-indigo-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${
                        notif.isRead ? 'text-gray-500' : 'text-gray-800 font-medium'
                      }`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkOneRead(notif._id)}
                        className="flex-shrink-0 text-xs text-indigo-500 hover:text-indigo-700 font-medium mt-0.5"
                      >
                        Read
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ─── My Reports ─── */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">
                  My Reports
                </h3>
                <span className="text-xs font-semibold bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded-full">
                  {myReports.length}
                </span>
              </div>
            </div>
            {loadingReports ? (
              <div className="flex justify-center py-12">
                <div className="w-7 h-7 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : myReports.length === 0 ? (
              <div className="flex flex-col items-center py-14 px-6">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm font-medium">No reports yet</p>
                <p className="text-gray-300 text-xs mt-1">Create your first report to see it here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {myReports.map((report) => (
                  <div key={report._id} className="group hover:bg-gray-50/50 transition-colors">
                    {/* Image banner if exists */}
                    {report.imageUrl && (
                      <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
                        <img
                          src={report.imageUrl}
                          alt="report"
                          className="w-full h-full object-cover"
                        />
                        {/* Gradient overlay with badges */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${crimeColors[report.crimeType] || crimeColors.Other}`}>
                            {report.crimeType}
                          </span>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${statusColors[report.status] || statusColors.Pending}`}>
                            {report.status}
                          </span>
                        </div>
                        <span className="absolute top-3 right-3 text-xs text-white/80 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
                          {timeAgo(report.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className="px-5 py-4">
                      {/* Badges row for no-image reports */}
                      {!report.imageUrl && (
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${crimeColors[report.crimeType] || crimeColors.Other}`}>
                              {report.crimeType}
                            </span>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[report.status] || statusColors.Pending}`}>
                              {report.status}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">{timeAgo(report.createdAt)}</span>
                        </div>
                      )}
                      <h4 className="font-semibold text-gray-800 text-sm leading-snug">{report.title}</h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">{report.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ─── Create Report Modal ─── */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto pt-10 pb-10 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowReportModal(false); }}
        >
          <div className="w-full max-w-xl relative">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute -top-4 -right-2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-gray-800 text-lg font-bold"
            >
              ×
            </button>
            <CreateReport onSuccess={() => { setShowReportModal(false); fetchMyReports(); }} />
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;

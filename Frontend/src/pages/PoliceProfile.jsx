import React, { useState, useEffect } from 'react';
import { locationData } from '../data/locations';
import { userAPI, reportAPI, policeAPI } from '../services/api';
import PoliceNavbar from '../components/PoliceNavbar';

const PoliceProfile = () => {
  const [officer, setOfficer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [casesResolved, setCasesResolved] = useState(0);
  const [activeInvestigations, setActiveInvestigations] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [assignedCases, setAssignedCases] = useState([]);
  const [solvedCases, setSolvedCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(true);

  // Edit form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    district: '',
    thana: '',
  });
  const [thanas, setThanas] = useState([]);

  // Fetch officer profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        setOfficer(response.user);
        setFormData({
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone,
          district: response.user.district,
          thana: response.user.thana,
        });
        setThanas(locationData[response.user.district] || []);
      } catch (err) {
        console.error('Failed to load officer profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Re-fetch stats when officer changes
  useEffect(() => {
    if (officer && statsLoading) {
      const fetchStats = async () => {
        try {
          const data = await reportAPI.getAllReports();
          const reports = data.reports || [];

          const officerCases = reports.filter(
            (report) => report.assignedOfficer?._id === officer._id
          );

          const resolved = officerCases.filter((r) => r.policeStatus === 'Solved').length;
          setCasesResolved(resolved);

          const investigating = officerCases.filter((r) => r.policeStatus === 'Assigned').length;
          setActiveInvestigations(investigating);
        } catch (err) {
          console.error('Failed to load stats:', err);
        } finally {
          setStatsLoading(false);
        }
      };
      fetchStats();
    }
  }, [officer]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await policeAPI.getMyCases();
        setAssignedCases(data.assigned || []);
        setSolvedCases(data.solved || []);
      } catch (err) {
        console.error('Failed to load cases:', err);
      } finally {
        setCasesLoading(false);
      }
    };

    fetchCases();
  }, []);

  const handleMarkSolved = async (reportId) => {
    try {
      const res = await policeAPI.updateCaseStatus(reportId, 'Solved');
      setAssignedCases((prev) => prev.filter((r) => r._id !== reportId));
      setSolvedCases((prev) => [res.report, ...prev]);
    } catch (err) {
      setError(err.message || 'Failed to mark case solved');
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
      const response = await userAPI.updateProfile(formData);
      setOfficer(response.user);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PoliceNavbar />
        <div className="mt-16 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            <p className="mt-4 text-slate-600">Loading officer profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!officer) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PoliceNavbar />
        <div className="mt-16 max-w-2xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Failed to load officer profile. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PoliceNavbar />
      
      <div className="mt-20 max-w-2xl mx-auto px-4 pb-20">
        {/* Success & Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Officer Profile Card Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{officer.name}</h1>
                  <span className="px-4 py-1 bg-blue-500 text-white rounded-full text-sm font-semibold">
                    OFFICER
                  </span>
                </div>
                <p className="text-slate-200 text-lg mb-4">{officer.email}</p>
                <div className="space-y-2">
                  <p className="text-slate-100">
                    <span className="font-semibold">Assigned District:</span> {officer.district}
                  </p>
                  <p className="text-slate-100">
                    <span className="font-semibold">Thana (Police Station):</span> {officer.thana}
                  </p>
                  <p className="text-slate-100">
                    <span className="font-semibold">Phone:</span> {officer.phone}
                  </p>
                </div>
              </div>

              {/* Profile Picture */}
              <div className="ml-6">
                <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center">
                  {officer.profilePicture ? (
                    <img
                      src={officer.profilePicture}
                      alt="Officer"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Cases Resolved */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="text-slate-600 text-sm font-semibold mb-2">CASES RESOLVED</div>
            <div className="text-4xl font-bold text-green-600">
              {statsLoading ? '...' : casesResolved}
            </div>
            <p className="text-slate-500 text-xs mt-2">In your jurisdiction</p>
          </div>

          {/* Active Investigations */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="text-slate-600 text-sm font-semibold mb-2">ACTIVE INVESTIGATIONS</div>
            <div className="text-4xl font-bold text-orange-600">
              {statsLoading ? '...' : activeInvestigations}
            </div>
            <p className="text-slate-500 text-xs mt-2">Currently investigating</p>
          </div>
        </div>

        {/* Edit Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Contact Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Officer Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* District (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  District (Fixed)
                </label>
                <input
                  type="text"
                  value={formData.district}
                  disabled
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">Your jurisdiction is locked. Contact administrator to change.</p>
              </div>

              {/* Thana (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Thana/Police Station (Fixed)
                </label>
                <input
                  type="text"
                  value={formData.thana}
                  disabled
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">Your assigned station is locked. Contact administrator to change.</p>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 transition-colors font-medium"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: officer.name,
                      email: officer.email,
                      phone: officer.phone,
                      district: officer.district,
                      thana: officer.thana,
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Officer Name</p>
                <p className="text-lg font-medium text-slate-900">{officer.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Email</p>
                <p className="text-lg text-slate-700">{officer.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Phone Number</p>
                <p className="text-lg text-slate-700">{officer.phone}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">District</p>
                  <p className="text-lg text-slate-700 font-medium">{officer.district}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Thana</p>
                  <p className="text-lg text-slate-700 font-medium">{officer.thana}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* My Ongoing Cases */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">My Ongoing Cases</h3>
          {casesLoading && (
            <p className="text-sm text-slate-500">Loading assigned cases...</p>
          )}
          {!casesLoading && assignedCases.length === 0 && (
            <p className="text-sm text-slate-500">No active assignments yet.</p>
          )}
          {!casesLoading && assignedCases.length > 0 && (
            <div className="space-y-3">
              {assignedCases.map((report) => (
                <div key={report._id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 truncate">{report.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {report.crimeType} • {report.district}, {report.thana}
                      </p>
                    </div>
                    <button
                      onClick={() => handleMarkSolved(report._id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Mark as Case Solved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Cases */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Completed Cases</h3>
          {casesLoading && (
            <p className="text-sm text-slate-500">Loading completed cases...</p>
          )}
          {!casesLoading && solvedCases.length === 0 && (
            <p className="text-sm text-slate-500">No completed cases yet.</p>
          )}
          {!casesLoading && solvedCases.length > 0 && (
            <div className="space-y-3">
              {solvedCases.map((report) => (
                <div key={report._id} className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 truncate">{report.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {report.crimeType} • {report.district}, {report.thana}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badge Section */}
        {officer.badges && officer.badges.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Badges & Achievements</h3>
            <div className="flex flex-wrap gap-3">
              {officer.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 rounded-full font-semibold text-sm shadow-md"
                >
                  ⭐ {badge}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoliceProfile;

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { dashboardAPI } from '../services/api';

/* ── status badge config ── */
const STATUS_STYLES = {
  Pending:       'bg-red-100 text-red-800',
  Investigating: 'bg-yellow-100 text-yellow-800',
  Verified:      'bg-blue-100 text-blue-800',
  Rejected:      'bg-gray-100 text-gray-600',
  Resolved:      'bg-green-100 text-green-800',
};

const STATUS_ICONS = {
  Pending:       '⏳',
  Investigating: '🔍',
  Verified:      '✅',
  Rejected:      '❌',
  Resolved:      '🛡️',
};

/* ── progress step helper ── */
function getProgressStep(status) {
  if (status === 'Resolved') return 3;
  if (status === 'Investigating' || status === 'Verified') return 2;
  return 1; // Pending / Rejected
}

const STEPS = ['Reported', 'Community Verified', 'Police Action'];

/* ── component ── */
const UserDashboard = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, investigating: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await dashboardAPI.getMyReports();
        setReports(res.data.reports);
        setStats(res.data.stats);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-500 mt-1">Track the status of reports you've submitted.</p>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Total */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-xl">📋</div>
            <div>
              <p className="text-sm text-gray-500">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
          {/* Investigating */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 text-xl">🔍</div>
            <div>
              <p className="text-sm text-gray-500">Active Investigations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.investigating}</p>
            </div>
          </div>
          {/* Resolved */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 text-xl">🛡️</div>
            <div>
              <p className="text-sm text-gray-500">Resolved Cases</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
            </div>
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 text-red-700 rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && reports.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium">You haven't submitted any reports yet.</p>
            <p className="text-sm mt-1">Head to the Home feed to file your first report.</p>
          </div>
        )}

        {/* ── Report Cards ── */}
        {!loading && reports.length > 0 && (
          <div className="space-y-5">
            {reports.map((report) => {
              const step = getProgressStep(report.status);
              return (
                <div
                  key={report._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-shadow hover:shadow-md"
                >
                  <div className="p-6">
                    {/* Top row: title + badge */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {report.title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {report.crimeType} • {report.district}, {report.thana} • {formatDate(report.createdAt)}
                        </p>
                      </div>
                      <span className={`flex-shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[report.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_ICONS[report.status]} {report.status}
                      </span>
                    </div>

                    {(report.policeStatus === 'Assigned' || report.policeStatus === 'Solved') && (
                      <div className="mb-3 text-xs text-gray-600">
                        <span className="font-semibold">
                          {report.policeStatus === 'Assigned' ? 'Status: Police Assigned' : 'Status: Case Solved'}
                        </span>
                        {report.assignedOfficer?.name && (
                          <span className="ml-2">
                            Assigned to: Officer {report.assignedOfficer.name}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4">
                      {report.description}
                    </p>

                    {/* Vote counts */}
                    <div className="flex items-center gap-4 text-sm mb-5">
                      <span className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-lg font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        {report.votes.confirm} Confirm
                      </span>
                      <span className="flex items-center gap-1.5 text-red-700 bg-red-50 px-3 py-1 rounded-lg font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        {report.votes.dispute} Dispute
                      </span>
                    </div>

                    {/* ── Progress Tracker ── */}
                    <div className="flex items-center gap-0 mb-1">
                      {STEPS.map((label, i) => {
                        const isActive = i < step;
                        const isCurrent = i === step - 1;
                        return (
                          <React.Fragment key={label}>
                            {/* Step dot */}
                            <div className="flex flex-col items-center" style={{ minWidth: 80 }}>
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                  ${isCurrent
                                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                                    : isActive
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-gray-200 text-gray-500'}`}
                              >
                                {isActive ? '✓' : i + 1}
                              </div>
                              <span className={`text-xs mt-1.5 text-center leading-tight ${isActive ? 'text-indigo-700 font-semibold' : 'text-gray-400'}`}>
                                {label}
                              </span>
                            </div>
                            {/* Connector line */}
                            {i < STEPS.length - 1 && (
                              <div
                                className={`flex-1 h-0.5 -mt-5 ${i < step - 1 ? 'bg-indigo-600' : 'bg-gray-200'}`}
                              />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* ── Police Note ── */}
                    {report.policeNote && (
                      <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <span className="text-sm font-semibold text-blue-800">Official Police Message</span>
                        </div>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          {report.policeNote}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Image thumbnail (bottom strip) */}
                  {report.imageUrl && (
                    <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Evidence photo attached
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;

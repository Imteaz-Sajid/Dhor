import React, { useEffect, useState } from 'react';
import PoliceNavbar from '../components/PoliceNavbar';
import { reportAPI, policeAPI, userAPI } from '../services/api';

const statusBadge = (status) => {
  switch (status) {
    case 'Resolved':
      return 'bg-green-100 text-green-800';
    case 'Investigating':
      return 'bg-yellow-100 text-yellow-800';
    case 'Verified':
      return 'bg-blue-100 text-blue-800';
    case 'Rejected':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-red-100 text-red-800';
  }
};

const PoliceFeed = () => {
  const [reports, setReports] = useState([]);
  const [officer, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workingId, setWorkingId] = useState('');
  const [brokenImages, setBrokenImages] = useState({});

  const getImageUrl = (report) => {
    const raw =
      report.imageUrl ||
      report.image ||
      (Array.isArray(report.images) ? report.images[0] : null) ||
      (Array.isArray(report.imageUrls) ? report.imageUrls[0] : null);

    if (!raw || typeof raw !== 'string') return null;
    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
      return raw;
    }
    return raw.startsWith('/') ? `http://localhost:5001${raw}` : raw;
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [reportData, profileData] = await Promise.all([
          reportAPI.getAllReports(),
          userAPI.getProfile(),
        ]);
        setReports(reportData.reports || []);
        setOfficer(profileData.user || null);
      } catch (err) {
        setError(err.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const updateReport = (updated) => {
    setReports((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
  };

  const handleVerify = async (reportId) => {
    setWorkingId(reportId);
    try {
      const res = await policeAPI.verifyReport(reportId);
      updateReport(res.report);
    } catch (err) {
      setError(err.message || 'Failed to verify report');
    } finally {
      setWorkingId('');
    }
  };

  const handleNotVerified = async (reportId) => {
    setWorkingId(reportId);
    try {
      const res = await policeAPI.markNotVerified(reportId);
      updateReport(res.report);
    } catch (err) {
      setError(err.message || 'Failed to mark not verified');
    } finally {
      setWorkingId('');
    }
  };

  const handleAssign = async (reportId) => {
    setWorkingId(reportId);
    try {
      const res = await policeAPI.assignCase(reportId);
      updateReport(res.report);
    } catch (err) {
      setError(err.message || 'Failed to assign case');
    } finally {
      setWorkingId('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PoliceNavbar />

      <div className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Police Feed</h1>
          <p className="text-slate-500 mt-1">Review and manage public reports across districts.</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
          </div>
        )}

        {!loading && reports.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            No reports found.
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="space-y-5">
            {reports.map((report) => {
              const canAct =
                officer &&
                report.thana === officer.thana &&
                report.district === officer.district;

              return (
              <div key={report._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 truncate">{report.title}</h3>
                    <p className="text-sm text-slate-400 mt-0.5">
                      {report.crimeType} • {report.district}, {report.thana} • {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.isPoliceVerified && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                        Verified by Police
                      </span>
                    )}
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">
                  {report.description}
                </p>

                <div className="w-full rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '4 / 3' }}>
                  {getImageUrl(report) && !brokenImages[report._id] ? (
                    <img
                      src={getImageUrl(report)}
                      alt="Report evidence"
                      className="w-full h-full object-contain bg-slate-100"
                      loading="lazy"
                      onError={() =>
                        setBrokenImages((prev) => ({ ...prev, [report._id]: true }))
                      }
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-slate-400">No photo available</span>
                    </div>
                  )}
                </div>

                {report.assignedOfficer && (
                  <div className="text-xs text-slate-600 mb-3">
                    Assigned to: <span className="font-semibold">Officer {report.assignedOfficer.name}</span>
                  </div>
                )}

                {!canAct && (
                  <div className="text-xs text-slate-500 mb-2">
                    Actions available only for reports in your assigned thana.
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {!report.isPoliceVerified && canAct && (
                    <button
                      onClick={() => handleVerify(report._id)}
                      disabled={workingId === report._id}
                      className="px-3 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
                    >
                      Verify
                    </button>
                  )}
                  {canAct && (
                    <button
                      onClick={() => handleNotVerified(report._id)}
                      disabled={workingId === report._id}
                      className="px-3 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 disabled:bg-slate-100"
                    >
                      Not Verified
                    </button>
                  )}
                  {!report.assignedOfficer && canAct && (
                    <button
                      onClick={() => handleAssign(report._id)}
                      disabled={workingId === report._id}
                      className="px-3 py-2 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-500"
                    >
                      Assign to Me
                    </button>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PoliceFeed;

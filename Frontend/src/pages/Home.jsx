Here is the resolved version that keeps **RoleBasedNavbar** and all existing features intact:

```jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import RoleBasedNavbar from '../components/RoleBasedNavbar';
import CommentSection from '../components/CommentSection';
import { reportAPI, voteAPI } from '../services/api';
import { locationData, districts } from '../data/locations';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadow,
});

const crimeColors = {
  Extortion: 'bg-orange-100 text-orange-700',
  Theft: 'bg-yellow-100 text-yellow-700',
  Robbery: 'bg-red-200 text-red-800',
  Harassment: 'bg-pink-100 text-pink-700',
  Assault: 'bg-red-100 text-red-700',
  Other: 'bg-gray-100 text-gray-600',
  theft: 'bg-yellow-100 text-yellow-700',
  assault: 'bg-red-100 text-red-700',
  vandalism: 'bg-orange-100 text-orange-700',
  robbery: 'bg-red-200 text-red-800',
  fraud: 'bg-purple-100 text-purple-700',
  harassment: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-600',
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

/* ─── Single report card ─── */
const ReportCard = ({ report, currentUser }) => {
  const [mapOpen, setMapOpen] = useState(false);
  const [confirmCount, setConfirmCount] = useState(0);
  const [disputeCount, setDisputeCount] = useState(0);
  const [userVote, setUserVote] = useState(null); // 'Confirm' | 'Dispute' | null
  const [voteLoading, setVoteLoading] = useState(true);
  const [eligible, setEligible] = useState(false);

  const coords = report.location?.coordinates; // GeoJSON: [lng, lat]
  const hasLocation = Array.isArray(coords) && coords.length === 2;
  const lat = hasLocation ? coords[1] : null;
  const lng = hasLocation ? coords[0] : null;
  const trustRating =
    report.userId?.trustScore != null
      ? (report.userId.trustScore / 20).toFixed(1)
      : null;

  useEffect(() => {
    const fetchVoteStats = async () => {
      try {
        const data = await voteAPI.getStats(report._id);
        setConfirmCount(data.stats.confirmCount);
        setDisputeCount(data.stats.disputeCount);
        setUserVote(data.stats.userVote);
        setEligible(data.stats.eligible);
      } catch {
        // silently ignore — votes are non-critical
      } finally {
        setVoteLoading(false);
      }
    };
    fetchVoteStats();
  }, [report._id]);

  const handleVote = async (type) => {
    if (userVote === type) return;

    const prevVote = userVote;
    const prevConfirm = confirmCount;
    const prevDispute = disputeCount;

    // Optimistic update
    let newConfirm = confirmCount;
    let newDispute = disputeCount;
    if (prevVote === 'Confirm') newConfirm -= 1;
    if (prevVote === 'Dispute') newDispute -= 1;
    if (type === 'Confirm') newConfirm += 1;
    if (type === 'Dispute') newDispute += 1;

    setConfirmCount(newConfirm);
    setDisputeCount(newDispute);
    setUserVote(type);

    try {
      await voteAPI.castVote(report._id, type);
    } catch {
      // Roll back on failure
      setConfirmCount(prevConfirm);
      setDisputeCount(prevDispute);
      setUserVote(prevVote);
    }
  };

  const totalVotes = confirmCount + disputeCount;
  const trustPct   = totalVotes > 0 ? (confirmCount / totalVotes) * 100 : 0;
  const disputePct = totalVotes > 0 ? (disputeCount / totalVotes) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">

      {/* ─── Header: avatar · name · rating · time · crime badge ─── */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          {report.userId?.profilePicture ? (
            <img src={report.userId.profilePicture} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 select-none">
              {(report.userId?.name?.[0] || '?').toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {report.userId?.name || 'Anonymous'}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              {trustRating && (
                <>
                  <span className="text-yellow-400">★</span>
                  <span>{trustRating}</span>
                  <span className="text-gray-200">|</span>
                </>
              )}
              <span>{timeAgo(report.createdAt)}</span>
            </div>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${crimeColors[report.crimeType] || crimeColors.Other}`}>
          {report.crimeType}
        </span>
      </div>

      {/* ─── Image (square) with mini-map in bottom-right corner ─── */}
      <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
        {report.imageUrl ? (
          <img
            src={report.imageUrl}
            alt="Evidence"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-400">No photo attached</span>
          </div>
        )}

        {/* Mini map thumbnail — bottom-right corner */}
        {hasLocation && (
          <button
            onClick={() => setMapOpen(true)}
            className="absolute bottom-3 right-3 w-20 h-20 rounded-xl overflow-hidden shadow-xl border-2 border-white hover:scale-105 transition-transform z-10"
            title="View location on map"
          >
            <MapContainer
              center={[lat, lng]}
              zoom={14}
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              touchZoom={false}
              keyboard={false}
              attributionControl={false}
              style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[lat, lng]} />
            </MapContainer>
          </button>
        )}
      </div>

      {/* ─── Footer: title · status · description · location ─── */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-semibold text-gray-800 text-sm leading-snug">{report.title}</h4>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[report.status] || statusColors.Pending}`}>
            {report.status}
          </span>
        </div>
        {(report.district || report.thana) && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {[report.thana, report.district].filter(Boolean).join(', ')}
          </p>
        )}
        <p className="text-sm text-gray-500 line-clamp-2">{report.description}</p>

        {/* ─── Trust Bar ─── */}
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-green-600">✓ Confirm {confirmCount}</span>
            <span className="text-gray-400">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
            <span className="font-medium text-red-500">Dispute {disputeCount} ✗</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-green-500 transition-all duration-500 ease-out"
              style={{ width: `${trustPct}%` }}
            />
            <div
              className="h-full bg-red-400 transition-all duration-500 ease-out"
              style={{ width: `${disputePct}%` }}
            />
          </div>
          {totalVotes === 0 && (
            <p className="text-xs text-center text-gray-400">No votes yet — be the first to verify</p>
          )}
        </div>

        {/* ─── Vote Buttons ─── */}
        {eligible ? (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => handleVote('Confirm')}
              disabled={voteLoading}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 border-2
                ${userVote === 'Confirm'
                  ? 'bg-green-500 border-green-500 text-white shadow scale-[1.02]'
                  : 'border-green-400 text-green-600 bg-white hover:bg-green-50'}
                disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              ✅ Confirm
            </button>
            <button
              onClick={() => handleVote('Dispute')}
              disabled={voteLoading}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 border-2
                ${userVote === 'Dispute'
                  ? 'bg-red-500 border-red-500 text-white shadow scale-[1.02]'
                  : 'border-red-400 text-red-500 bg-white hover:bg-red-50'}
                disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              ❌ Refute
            </button>
          </div>
        ) : (
          !voteLoading && (
            <p className="mt-3 text-xs text-center text-gray-400 bg-gray-50 rounded-xl py-2 px-3">
              Only residents of {report.thana}, {report.district} can vote on this report
            </p>
          )
        )}
      </div>

      {/* ─── Comments ─── */}
      <CommentSection report={report} currentUser={currentUser} />

      {/* ─── Expanded map modal ─── */}
      {mapOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setMapOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative"
            style={{ height: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title pill */}
            <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur rounded-xl px-3 py-1.5 shadow text-xs font-medium text-gray-700 max-w-[65%] truncate">
              📍 {report.title}
            </div>
            {/* Close button */}
            <button
              onClick={() => setMapOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 text-lg font-bold"
            >
              ×
            </button>
            <MapContainer
              center={[lat, lng]}
              zoom={15}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <Marker position={[lat, lng]} />
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};

const crimeTypes = ['Extortion', 'Theft', 'Robbery', 'Harassment', 'Assault', 'Other'];

/* ─── Home page ─── */
const Home = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  // Filter state
  const [filterCrimeType, setFilterCrimeType] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterThana, setFilterThana] = useState('');

  const thanas = filterDistrict ? locationData[filterDistrict] || [] : [];

  const fetchReports = async () => {
    try {
      const data = await reportAPI.getAllReports();
      setReports(data.reports || []);
    } catch {
      // silently ignore
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Reset thana when district changes
  useEffect(() => {
    setFilterThana('');
  }, [filterDistrict]);

  const filteredReports = reports.filter((r) => {
    if (filterCrimeType && r.crimeType !== filterCrimeType) return false;
    if (filterDistrict && r.district !== filterDistrict) return false;
    if (filterThana && r.thana !== filterThana) return false;
    return true;
  });

  const hasActiveFilter = filterCrimeType || filterDistrict || filterThana;

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleBasedNavbar />

      <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto pb-10">
        {/* Welcome card */}
        <div className="bg-white rounded-2xl shadow-md p-5 mt-4 mb-5">
          <h2 className="text-xl font-bold text-gray-900">
            Welcome{user.name ? `, ${user.name}` : ''}!
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {user.thana && user.district
              ? `${user.thana}, ${user.district}`
              : 'Your community safety dashboard'}
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Filter Reports</p>
            {hasActiveFilter && (
              <button
                onClick={() => { setFilterCrimeType(''); setFilterDistrict(''); setFilterThana(''); }}
                className="text-xs text-red-500 hover:text-red-600 font-medium"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={filterCrimeType}
              onChange={(e) => setFilterCrimeType(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
            >
              <option value="">All Crime Types</option>
              {crimeTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
            >
              <option value="">All Districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={filterThana}
              onChange={(e) => setFilterThana(e.target.value)}
              disabled={!filterDistrict}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All Thanas</option>
              {thanas.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Feed label */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          {hasActiveFilter ? `${filteredReports.length} result${filteredReports.length !== 1 ? 's' : ''}` : 'Recent Reports'}
        </p>

        {loadingReports ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {hasActiveFilter ? 'No reports match your filters.' : 'No reports yet. Be the first to report an incident.'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <ReportCard key={report._id} report={report} currentUser={user} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
```

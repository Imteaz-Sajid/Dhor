import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { missingAPI } from '../services/api';

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

/* ── Single entity card ──────────────────────────────────────────────────── */
const EntityCard = ({ entity, currentUser, onStatusUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const d         = entity.descriptions || {};
  const img       = entity.images?.[0];
  const isOwner   = currentUser?._id === entity.userId?._id ||
                    currentUser?.id  === entity.userId?._id;
  const isPolice  = currentUser?.role === 'police';
  const canUpdate = (isOwner || isPolice) && entity.status === 'Missing';

  const handleMarkFound = async () => {
    setUpdating(true);
    try {
      await missingAPI.updateStatus(entity._id, 'Found');
      onStatusUpdate(entity._id, 'Found');
    } catch {
      // silently ignore
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">

      {/* ── Image / placeholder ── */}
      <div className="relative" style={{ aspectRatio: '4/3' }}>
        {img ? (
          <img src={img} alt={entity.nameOrModel} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-6xl">{entity.entityType === 'Person' ? '👤' : '🚗'}</span>
          </div>
        )}

        {/* Status banner */}
        <div className={`absolute top-0 left-0 right-0 py-1.5 flex items-center justify-center gap-1.5 text-xs font-bold tracking-widest uppercase ${
          entity.status === 'Missing' ? 'bg-red-600 text-white' : 'bg-green-500 text-white'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${entity.status === 'Missing' ? 'bg-red-200 animate-pulse' : 'bg-green-200'}`} />
          {entity.status === 'Missing' ? 'Missing' : 'Found'}
        </div>

        {/* Type chip */}
        <span className={`absolute bottom-2 right-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
          entity.entityType === 'Person' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {entity.entityType}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">

        {/* Name / model */}
        <h3 className="font-bold text-gray-900 text-base leading-tight">{entity.nameOrModel}</h3>

        {/* Vehicle: prominent license plate */}
        {entity.entityType === 'Vehicle' && d.licensePlate && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
            <span className="text-xs font-bold text-yellow-700 uppercase tracking-wide flex-shrink-0">Plate</span>
            <span className="font-mono font-extrabold text-lg text-yellow-900 tracking-wider leading-none">
              {d.licensePlate}
            </span>
          </div>
        )}

        {/* Person: prominent age + blood group pills */}
        {entity.entityType === 'Person' && (d.age || d.bloodGroup) && (
          <div className="flex flex-wrap gap-2">
            {d.age && (
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                Age: {d.age}
              </span>
            )}
            {d.bloodGroup && (
              <span className="bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                {d.bloodGroup}
              </span>
            )}
            {d.height && (
              <span className="bg-gray-50 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                {d.height} cm
              </span>
            )}
          </div>
        )}

        {/* Extra description lines */}
        <div className="text-xs text-gray-500 space-y-0.5">
          {entity.entityType === 'Person' && (
            <>
              {d.weight          && <p>Weight: {d.weight} kg</p>}
              {d.lastWornClothing && <p>Last worn: {d.lastWornClothing}</p>}
            </>
          )}
          {entity.entityType === 'Vehicle' && (
            <>
              {d.color     && <p>Color: {d.color}{d.makeModel ? ` · ${d.makeModel}` : ''}</p>}
              {d.chassisNumber && (
                <p className="font-mono text-gray-400">Chassis: {d.chassisNumber}</p>
              )}
            </>
          )}
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400 pt-1 border-t border-gray-50">
          <span>Last seen {new Date(entity.lastSeenDate).toLocaleDateString('en-BD')}</span>
          <span>·</span>
          <span>Reported {timeAgo(entity.createdAt)}</span>
        </div>

        {/* Reporter */}
        {entity.userId?.name && (
          <p className="text-xs text-gray-400">By: {entity.userId.name}</p>
        )}

        {/* Mark as Found */}
        {canUpdate && (
          <button
            onClick={handleMarkFound}
            disabled={updating}
            className="mt-auto w-full py-2 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600 disabled:opacity-40 transition-colors"
          >
            {updating ? 'Updating…' : '✅ Mark as Found'}
          </button>
        )}
      </div>
    </div>
  );
};

/* ── Missing Board page ──────────────────────────────────────────────────── */
const MissingBoard = () => {
  const user     = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  const [entities,     setEntities]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterType,   setFilterType]   = useState('');
  const [filterStatus, setFilterStatus] = useState('Missing');

  useEffect(() => {
    const fetchEntities = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filterType)   params.entityType = filterType;
        if (filterStatus) params.status     = filterStatus;
        const data = await missingAPI.getAll(params);
        setEntities(data.entities || []);
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    };
    fetchEntities();
  }, [filterType, filterStatus]);

  const handleStatusUpdate = (id, newStatus) => {
    setEntities((prev) =>
      prev.map((e) => (e._id === id ? { ...e, status: newStatus } : e))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-12">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Missing Board</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Help locate missing persons and stolen vehicles in your community
            </p>
          </div>
          <button
            onClick={() => navigate('/report-missing')}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Report Missing
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <option value="">All Types</option>
            <option value="Person">Person</option>
            <option value="Vehicle">Vehicle</option>
          </select>

          <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
            {[
              { value: '',        label: 'All'     },
              { value: 'Missing', label: 'Missing' },
              { value: 'Found',   label: 'Found'   },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilterStatus(value)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  filterStatus === value
                    ? value === 'Found'
                      ? 'bg-green-500 text-white'
                      : value === 'Missing'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-700 text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results count ── */}
        {!loading && (
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            {entities.length} record{entities.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entities.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400">
            <span className="text-5xl block mb-3">🔍</span>
            <p>No records found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {entities.map((entity) => (
              <EntityCard
                key={entity._id}
                entity={entity}
                currentUser={user}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MissingBoard;

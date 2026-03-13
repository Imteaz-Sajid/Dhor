import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { stationAPI } from '../services/api';

/* ── Inline station card ── */
const StationCard = ({ station, isPolice, isEditing, editForm, setEditForm, onEdit, onSave, onCancel, saving }) => {
  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl border-2 border-red-400 shadow-md p-5 flex flex-col gap-3">
        <p className="font-bold text-gray-900 text-sm leading-snug">{station.name}</p>

        <div className="space-y-2">
          <label className="block">
            <span className="text-xs text-gray-500 font-medium">Contact Number</span>
            <input
              type="tel"
              value={editForm.contactNumber}
              onChange={(e) => setEditForm((f) => ({ ...f, contactNumber: e.target.value }))}
              className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500 font-medium">Email</span>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </label>
        </div>

        <div className="flex gap-2 mt-1">
          <button
            onClick={() => onSave(station._id)}
            disabled={saving}
            className="flex-1 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-xl hover:bg-red-600 disabled:opacity-40 transition-colors"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="flex-1 py-1.5 border border-gray-200 text-gray-500 text-xs font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Name + edit icon */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="font-semibold text-gray-800 text-sm leading-snug">{station.name}</p>
        </div>
        {isPolice && (
          <button
            onClick={() => onEdit(station)}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-gray-400 flex items-center justify-center transition-colors"
            title="Edit contact details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>

      {/* Contact info */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="font-mono">{station.contactNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="truncate">{station.email}</span>
        </div>
      </div>

      {/* Action buttons for regular users */}
      {!isPolice && (
        <div className="flex gap-2 mt-1">
          <a
            href={`tel:${station.contactNumber}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-xl hover:bg-red-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call Now
          </a>
          <a
            href={`mailto:${station.email}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </a>
        </div>
      )}
    </div>
  );
};

/* ── Directory page ── */
const Directory = () => {
  const user      = JSON.parse(localStorage.getItem('user') || '{}');
  const isPolice  = user.role === 'police';

  const [stations,   setStations]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [editingId,  setEditingId]  = useState(null);
  const [editForm,   setEditForm]   = useState({ contactNumber: '', email: '' });
  const [saving,     setSaving]     = useState(false);
  const [showAdd,    setShowAdd]    = useState(false);
  const [newStation, setNewStation] = useState({ name: '', contactNumber: '', email: '' });
  const [adding,     setAdding]     = useState(false);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await stationAPI.getAllStations();
        setStations(data.stations || []);
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  const filteredStations = stations.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditClick = (station) => {
    setEditingId(station._id);
    setEditForm({ contactNumber: station.contactNumber, email: station.email });
  };

  const handleSave = async (stationId) => {
    setSaving(true);
    try {
      const data = await stationAPI.updateStation(stationId, editForm);
      setStations((prev) => prev.map((s) => (s._id === stationId ? data.station : s)));
      setEditingId(null);
    } catch {
      // silently ignore
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newStation.name.trim() || adding) return;
    setAdding(true);
    try {
      const data = await stationAPI.addStation(newStation);
      setStations((prev) => [...prev, data.station].sort((a, b) => a.name.localeCompare(b.name)));
      setNewStation({ name: '', contactNumber: '', email: '' });
      setShowAdd(false);
    } catch {
      // silently ignore
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-12">

        {/* ── Hero banner ── */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Emergency Police Directory</h1>
              <p className="text-red-100 text-sm mt-0.5">
                Bangladesh Police Station Contact Information
                {isPolice && <span className="ml-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">Police Admin</span>}
              </p>
            </div>
          </div>
        </div>

        {/* ── Search + Add ── */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search police stations…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
            />
          </div>
          {isPolice && (
            <button
              onClick={() => setShowAdd((v) => !v)}
              className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Station
            </button>
          )}
        </div>

        {/* ── Add station form (police only) ── */}
        {isPolice && showAdd && (
          <form onSubmit={handleAdd} className="bg-white rounded-2xl border-2 border-indigo-300 shadow-sm p-5 mb-5 space-y-3">
            <p className="text-sm font-semibold text-gray-800">New Police Station</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newStation.name}
                onChange={(e) => setNewStation((f) => ({ ...f, name: e.target.value }))}
                placeholder="Station name (required)"
                required
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="tel"
                value={newStation.contactNumber}
                onChange={(e) => setNewStation((f) => ({ ...f, contactNumber: e.target.value }))}
                placeholder="Contact number"
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="email"
                value={newStation.email}
                onChange={(e) => setNewStation((f) => ({ ...f, email: e.target.value }))}
                placeholder="Email"
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={adding}
                className="px-5 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-colors"
              >
                {adding ? 'Adding…' : 'Add Station'}
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-5 py-1.5 border border-gray-200 text-gray-500 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ── Results count ── */}
        {!loading && (
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            {search
              ? `${filteredStations.length} result${filteredStations.length !== 1 ? 's' : ''}`
              : `${stations.length} stations`}
          </p>
        )}

        {/* ── Station grid ── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredStations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            No stations match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStations.map((station) => (
              <StationCard
                key={station._id}
                station={station}
                isPolice={isPolice}
                isEditing={editingId === station._id}
                editForm={editForm}
                setEditForm={setEditForm}
                onEdit={handleEditClick}
                onSave={handleSave}
                onCancel={() => setEditingId(null)}
                saving={saving}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Directory;

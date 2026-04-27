import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x  from 'leaflet/dist/images/marker-icon-2x.png';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadow  from 'leaflet/dist/images/marker-shadow.png';
import Navbar from '../components/Navbar';
import { missingAPI, reportAPI } from '../services/api';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadow,
});

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Clickable map pin picker
const LocationPicker = ({ onLocation }) => {
  useMapEvents({
    click: (e) => {
      onLocation([e.latlng.lng, e.latlng.lat]); // GeoJSON [lng, lat]
    },
  });
  return null;
};

// Programmatically fly the map when a search result is selected
const MapController = ({ flyTarget }) => {
  const map = useMap();
  useEffect(() => {
    if (flyTarget) {
      map.flyTo(flyTarget, 15, { duration: 1.2 });
    }
  }, [flyTarget, map]);
  return null;
};

const inputCls =
  'mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent';
const labelCls = 'text-xs font-medium text-gray-500';

const ReportMissing = () => {
  const [step,           setStep]           = useState(1);
  const [entityType,     setEntityType]     = useState('');
  const [nameOrModel,    setNameOrModel]    = useState('');
  const [lastSeenDate,   setLastSeenDate]   = useState('');
  const [descriptions,   setDescriptions]   = useState({});
  const [coordinates,    setCoordinates]    = useState(null); // [lng, lat]
  const [flyTarget,      setFlyTarget]      = useState(null); // [lat, lng] for map.flyTo
  const [searchQuery,    setSearchQuery]    = useState('');
  const [searchResults,  setSearchResults]  = useState([]);
  const [searching,      setSearching]      = useState(false);
  const searchTimer = useRef(null);
  const [images,         setImages]         = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [submitted,      setSubmitted]      = useState(false);

  const updateDesc = (key, val) => setDescriptions((d) => ({ ...d, [key]: val }));

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    setSearchResults([]);
    clearTimeout(searchTimer.current);
    if (!q.trim()) return;
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setSearchResults(data);
      } catch {
        // silently ignore network errors
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSelectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setCoordinates([lon, lat]);      // GeoJSON [lng, lat]
    setFlyTarget([lat, lon]);        // Leaflet [lat, lng]
    setSearchQuery(result.display_name);
    setSearchResults([]);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImage(true);
    try {
      const results = await Promise.all(files.map((f) => reportAPI.uploadImage(f)));
      setImages((prev) => [...prev, ...results.map((d) => d.imageUrl)]);
    } catch {
      // silently ignore
    } finally {
      setUploadingImage(false);
      e.target.value = ''; // allow re-selecting the same files
    }
  };

  const handleSubmit = async () => {
    if (!entityType || !nameOrModel || !lastSeenDate || !coordinates || submitting) return;
    setSubmitting(true);
    try {
      await missingAPI.create({
        entityType,
        nameOrModel,
        lastSeenDate,
        lastSeenLocation: { type: 'Point', coordinates },
        descriptions,
        images,
      });
      setSubmitted(true);
    } catch {
      // silently ignore
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Report Submitted</h2>
          <p className="text-sm text-gray-500">
            Your missing {entityType.toLowerCase()} report is now live on the community board.
          </p>
          <a
            href="/missing"
            className="inline-block px-6 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            View Missing Board
          </a>
        </div>
      </div>
    );
  }

  // ── Step indicator ──────────────────────────────────────────────────────────
  const StepIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mt-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex items-center gap-2 ${s < 3 ? 'flex-1' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
              step > s  ? 'bg-green-500 text-white' :
              step === s ? 'bg-red-500 text-white'  : 'bg-gray-200 text-gray-500'
            }`}>
              {step > s ? '✓' : s}
            </div>
            {s < 3 && (
              <div className={`flex-1 h-0.5 transition-colors ${step > s ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1.5 px-0.5">
        <span>Select Type</span>
        <span>Details</span>
        <span>Location & Submit</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 px-4 sm:px-6 max-w-xl mx-auto pb-12">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Report Missing</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Help the community locate a missing person or stolen vehicle.
          </p>
        </div>

        <StepIndicator />

        {/* ── STEP 1: Select type ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="font-semibold text-gray-800">What is missing?</h2>
            <div className="grid grid-cols-2 gap-4">
              {['Person', 'Vehicle'].map((type) => (
                <button
                  key={type}
                  onClick={() => setEntityType(type)}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                    entityType === type
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-200 hover:border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-4xl">{type === 'Person' ? '👤' : '🚗'}</span>
                  <span className="font-semibold text-sm">Missing {type}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!entityType}
              className="w-full py-2.5 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {/* ── STEP 2: Dynamic detail fields ──────────────────────────────── */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{entityType === 'Person' ? '👤' : '🚗'}</span>
              <h2 className="font-semibold text-gray-800">Missing {entityType} Details</h2>
            </div>

            {/* Name / Model */}
            <label className="block">
              <span className={labelCls}>{entityType === 'Person' ? 'Full Name *' : 'Make & Model *'}</span>
              <input
                type="text"
                value={nameOrModel}
                onChange={(e) => setNameOrModel(e.target.value)}
                placeholder={entityType === 'Person' ? 'e.g. Mohammed Rahim' : 'e.g. Toyota Corolla'}
                className={inputCls}
              />
            </label>

            {/* ── Person fields ── */}
            {entityType === 'Person' && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'age',    label: 'Age',         type: 'number', min: 0, max: 120 },
                    { key: 'height', label: 'Height (cm)', type: 'number' },
                    { key: 'weight', label: 'Weight (kg)', type: 'number' },
                  ].map(({ key, label, type, min, max }) => (
                    <label key={key} className="block">
                      <span className={labelCls}>{label}</span>
                      <input
                        type={type}
                        min={min}
                        max={max}
                        value={descriptions[key] || ''}
                        onChange={(e) => updateDesc(key, e.target.value)}
                        className={inputCls}
                      />
                    </label>
                  ))}
                </div>

                <label className="block">
                  <span className={labelCls}>Blood Group</span>
                  <select
                    value={descriptions.bloodGroup || ''}
                    onChange={(e) => updateDesc('bloodGroup', e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select…</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className={labelCls}>Last Worn Clothing</span>
                  <input
                    type="text"
                    value={descriptions.lastWornClothing || ''}
                    onChange={(e) => updateDesc('lastWornClothing', e.target.value)}
                    placeholder="e.g. Blue shirt, black trousers"
                    className={inputCls}
                  />
                </label>
              </>
            )}

            {/* ── Vehicle fields ── */}
            {entityType === 'Vehicle' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className={labelCls}>License Plate *</span>
                    <input
                      type="text"
                      value={descriptions.licensePlate || ''}
                      onChange={(e) => updateDesc('licensePlate', e.target.value.toUpperCase())}
                      placeholder="e.g. DHA-11-1234"
                      className={`${inputCls} uppercase font-mono tracking-wide`}
                    />
                  </label>
                  <label className="block">
                    <span className={labelCls}>Color</span>
                    <input
                      type="text"
                      value={descriptions.color || ''}
                      onChange={(e) => updateDesc('color', e.target.value)}
                      placeholder="e.g. White"
                      className={inputCls}
                    />
                  </label>
                </div>

                <label className="block">
                  <span className={labelCls}>Chassis Number</span>
                  <input
                    type="text"
                    value={descriptions.chassisNumber || ''}
                    onChange={(e) => updateDesc('chassisNumber', e.target.value.toUpperCase())}
                    placeholder="e.g. JT2AE09W3J0123456"
                    className={`${inputCls} uppercase font-mono`}
                  />
                </label>

                <label className="block">
                  <span className={labelCls}>Make / Full Model</span>
                  <input
                    type="text"
                    value={descriptions.makeModel || ''}
                    onChange={(e) => updateDesc('makeModel', e.target.value)}
                    placeholder="e.g. Toyota Corolla 2019"
                    className={inputCls}
                  />
                </label>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!nameOrModel.trim()}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Location, date, images, submit ─────────────────────── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="font-semibold text-gray-800">Last Seen Details</h2>

            {/* Date */}
            <label className="block">
              <span className={labelCls}>Last Seen Date *</span>
              <input
                type="date"
                value={lastSeenDate}
                onChange={(e) => setLastSeenDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={inputCls}
              />
            </label>

            {/* Map pin */}
            <div>
              <span className={labelCls}>Last Seen Location *</span>

              {/* Search box */}
              <div className="relative mt-1.5">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl bg-gray-50 px-3 py-2 focus-within:ring-2 focus-within:ring-red-400 focus-within:border-transparent">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search for a place…"
                    className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
                  />
                  {searching && (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  )}
                </div>

                {/* Dropdown results */}
                {searchResults.length > 0 && (
                  <ul className="absolute z-[1000] left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {searchResults.map((r) => (
                      <li key={r.place_id}>
                        <button
                          type="button"
                          onClick={() => handleSelectResult(r)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors border-b border-gray-50 last:border-0"
                        >
                          {r.display_name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Pin status */}
              {coordinates ? (
                <p className="text-xs text-green-600 mt-1.5 font-medium">
                  📍 Pin set at {coordinates[1].toFixed(5)}, {coordinates[0].toFixed(5)}
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">Search for a place or tap anywhere on the map to drop a pin</p>
              )}

              {/* Map */}
              <div className="mt-2 rounded-xl overflow-hidden border border-gray-200" style={{ height: '240px' }}>
                <MapContainer
                  center={[23.8103, 90.4125]}
                  zoom={10}
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <LocationPicker onLocation={(coords) => { setCoordinates(coords); setFlyTarget(null); }} />
                  <MapController flyTarget={flyTarget} />
                  {coordinates && <Marker position={[coordinates[1], coordinates[0]]} />}
                </MapContainer>
              </div>
            </div>

            {/* Image upload */}
            <div>
              <span className={labelCls}>Photos (optional)</span>
              <label className="mt-1.5 flex items-center gap-2 cursor-pointer w-fit">
                <div className={`flex items-center gap-2 px-4 py-2 border border-dashed rounded-xl transition-colors ${
                  uploadingImage
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-sm text-gray-500">
                    {uploadingImage ? 'Uploading…' : 'Upload Photos'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>

              {images.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {images.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 flex-shrink-0">
                      <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                      <button
                        onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!lastSeenDate || !coordinates || submitting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting…' : 'Submit Report'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReportMissing;

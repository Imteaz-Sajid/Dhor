import { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reportAPI } from '../services/api';
import { locationData, districts } from '../data/locations';

// ── Fix Leaflet default marker icons in Vite/Webpack ────────────────────────
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadow,
});

// ── Client-side keyword classifier (fallback when server is unavailable) ─────
const CRIME_KEYWORDS = {
  Extortion:  ['extort', 'blackmail', 'ransom', 'threaten', 'demand money'],
  Theft:      ['steal', 'stole', 'stolen', 'theft', 'pickpocket', 'shoplifting', 'burglar'],
  Robbery:    ['rob', 'robbed', 'robbery', 'snatch', 'mugged', 'mugger'],
  Harassment: ['harass', 'stalk', 'intimidate', 'bully', 'verbal abuse', 'catcall'],
  Assault:    ['assault', 'attack', 'beat', 'punch', 'hit', 'knife', 'stabbed', 'shot', 'weapon'],
};

const classifyLocally = (text) => {
  const lower = text.toLowerCase();
  for (const [type, words] of Object.entries(CRIME_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) return type;
  }
  return 'Other';
};

// ── Sub-components ───────────────────────────────────────────────────────────
const PinDropper = ({ onPinDrop }) => {
  useMapEvents({
    click(e) { onPinDrop(e.latlng); },
  });
  return null;
};

const MapFlyTo = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 15, { duration: 1 });
  }, [target, map]);
  return null;
};

const DEFAULT_CENTER = [23.8103, 90.4125];

const CreateReport = ({ onSuccess }) => {
  const [form, setForm] = useState({ title: '', description: '' });
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedThana, setSelectedThana] = useState('');
  const [selectedCrimeType, setSelectedCrimeType] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [pin, setPin] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);

  // Location search
  const [locQuery, setLocQuery] = useState('');
  const [locResults, setLocResults] = useState([]);
  const [locSearching, setLocSearching] = useState(false);
  const debounceRef = useRef(null);

  const [nearbyWarning, setNearbyWarning] = useState(null);
  const [checkingNearby, setCheckingNearby] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // ── handlers ────────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handlePinDrop = useCallback((latlng) => {
    setPin({ lat: latlng.lat, lng: latlng.lng });
  }, []);

  // ── Location search with debounce ─────────────────────────────────────────
  const handleLocInput = (e) => {
    const query = e.target.value;
    setLocQuery(query);
    setLocResults([]);
    clearTimeout(debounceRef.current);
    if (query.trim().length < 3) return;
    debounceRef.current = setTimeout(async () => {
      setLocSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&countrycodes=bd`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setLocResults(data);
      } catch {
        // ignore search errors
      } finally {
        setLocSearching(false);
      }
    }, 400);
  };

  const handleLocSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setPin({ lat, lng });
    setFlyTarget({ lat, lng });
    setLocQuery(result.display_name.split(',').slice(0, 2).join(','));
    setLocResults([]);
  };

  // ── Nearby check on description blur ───────────────────────────────
  const handleDescriptionBlur = async () => {
    const description = form.description.trim();
    if (!description || description.length < 15 || !pin) return;
    setCheckingNearby(true);
    setNearbyWarning(null);
    try {
      const result = await reportAPI.checkSimilar(description, [pin.lng, pin.lat]);
      if (result.count > 0) setNearbyWarning({ count: result.count, crimeType: result.crimeType });
    } catch {
      // non-critical
    } finally {
      setCheckingNearby(false);
    }
  };

  // ── Form submission ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!pin) {
      setError('Please set a crime location — search for a place or click the map.');
      return;
    }
    if (!selectedCrimeType) {
      setError('Please select a crime type.');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const uploadRes = await reportAPI.uploadImage(imageFile);
        imageUrl = uploadRes.imageUrl;
      }

      // Use user-selected crime type
      const crimeType = selectedCrimeType;

      await reportAPI.createReport({
        title: form.title,
        description: form.description,
        crimeType,
        imageUrl,
        coordinates: [pin.lng, pin.lat],
        district: selectedDistrict,
        thana: selectedThana,
      });

      setSubmitted(true);
      setForm({ title: '', description: '' });
      setSelectedDistrict('');
      setSelectedThana('');
      setSelectedCrimeType('');
      setImageFile(null);
      setImagePreview(null);
      setPin(null);
      setFlyTarget(null);
      setLocQuery('');
      setNearbyWarning(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Report Submitted!</h3>
        <p className="text-sm text-gray-500 mb-6">Your crime report has been received and is now pending review.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          File a Crime Report
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Search for the crime location or drop a pin on the map, then fill in the details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
        {/* ── Global error ── */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* ── Title ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cr-title">
            Report Title <span className="text-red-500">*</span>
          </label>
          <input
            id="cr-title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={150}
            placeholder="e.g. Bag snatching near bus stand"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* ── Description ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cr-desc">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="cr-desc"
            name="description"
            value={form.description}
            onChange={handleChange}
            onBlur={handleDescriptionBlur}
            required
            rows={4}
            maxLength={2000}
            placeholder="Describe what happened in detail…"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
          {checkingNearby && (
            <p className="text-xs text-indigo-500 mt-1 flex items-center gap-1">
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Checking nearby crime patterns…
            </p>
          )}
        </div>

        {/* ── District & Thana ── */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cr-district">
              District <span className="text-red-500">*</span>
            </label>
            <select
              id="cr-district"
              value={selectedDistrict}
              onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedThana(''); }}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cr-thana">
              Thana <span className="text-red-500">*</span>
            </label>
            <select
              id="cr-thana"
              value={selectedThana}
              onChange={(e) => setSelectedThana(e.target.value)}
              required
              disabled={!selectedDistrict}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select Thana</option>
              {selectedDistrict && locationData[selectedDistrict]?.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Crime Type ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cr-crime-type">
            Crime Type <span className="text-red-500">*</span>
          </label>
          <select
            id="cr-crime-type"
            value={selectedCrimeType}
            onChange={(e) => setSelectedCrimeType(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="">Select Crime Type</option>
            <option value="Extortion">Extortion</option>
            <option value="Theft">Theft</option>
            <option value="Robbery">Robbery</option>
            <option value="Harassment">Harassment</option>
            <option value="Assault">Assault</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* ── Nearby Warning Banner ── */}
        {nearbyWarning && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 text-amber-800 px-4 py-3 rounded-lg text-sm">
            <span className="text-lg leading-none mt-0.5">⚠️</span>
            <p>
              <span className="font-semibold">Alert:</span> Found{' '}
              <span className="font-bold">{nearbyWarning.count}</span> similar{' '}
              <span className="font-bold">{nearbyWarning.crimeType}</span> report
              {nearbyWarning.count > 1 ? 's' : ''} within 1 km of this location. Stay alert!
            </p>
          </div>
        )}

        {/* ── Location — search + map ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Crime Location <span className="text-red-500">*</span>
          </label>

          {/* Search input */}
          <div className="relative mb-2">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                value={locQuery}
                onChange={handleLocInput}
                placeholder="Search for a location in Bangladesh…"
                className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {locSearching && (
                <svg className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              )}
            </div>

            {/* Suggestions dropdown */}
            {locResults.length > 0 && (
              <ul className="absolute z-[1000] top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden text-sm">
                {locResults.map((r) => (
                  <li
                    key={r.place_id}
                    onClick={() => handleLocSelect(r)}
                    className="flex items-start gap-2 px-4 py-2.5 cursor-pointer hover:bg-indigo-50 border-b border-gray-100 last:border-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700 leading-snug">{r.display_name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-xs text-gray-400 mb-2">— or click anywhere on the map to drop a pin</p>

          {/* Map */}
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 280 }}>
            <MapContainer
              center={DEFAULT_CENTER}
              zoom={13}
              style={{ width: '100%', height: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <PinDropper onPinDrop={handlePinDrop} />
              <MapFlyTo target={flyTarget} />
              {pin && <Marker position={[pin.lat, pin.lng]} />}
            </MapContainer>
          </div>

          {pin ? (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Location set — {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">No location selected yet.</p>
          )}
        </div>

        {/* ── Image upload ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cr-image">
            Evidence Photo <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="cr-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
          {imagePreview && (
            <div className="mt-3 relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-28 w-auto rounded-lg border border-gray-200 object-cover shadow-sm"
              />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow hover:bg-red-600"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Submitting…
            </>
          ) : (
            'Submit Crime Report'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateReport;

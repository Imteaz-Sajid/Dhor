import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

/* ── colour scale (green → yellow → orange → red → dark-red) ── */
const GRADIENT = [
  [34, 197, 94],    // green  – 0 reports
  [250, 204, 21],   // yellow
  [249, 115, 22],   // orange
  [239, 68, 68],    // red
  [127, 29, 29],    // dark-red – highest
];

function lerpColor(a, b, t) {
  return a.map((c, i) => Math.round(c + (b[i] - c) * t));
}

function getColor(count, maxCount) {
  if (maxCount === 0 || count === 0) return 'rgba(34,197,94,0.55)';
  const t = Math.min(count / maxCount, 1);
  const segments = GRADIENT.length - 1;
  const seg = Math.min(Math.floor(t * segments), segments - 1);
  const localT = (t * segments) - seg;
  const [r, g, b] = lerpColor(GRADIENT[seg], GRADIENT[seg + 1], localT);
  return `rgb(${r},${g},${b})`;
}

/* ── floating info panel (top-right) ── */
function InfoPanel({ feature, count }) {
  if (!feature) return null;
  const name = feature.properties.ADM2_EN || 'Unknown';
  const division = feature.properties.ADM1_EN || '';
  const color = getColor(count, 1); // just for the dot
  return (
    <div className="choropleth-info-panel">
      <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 2 }}>
        {name}
      </div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>
        {division} Division
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 10px', borderRadius: 8,
        background: count > 0 ? '#fef2f2' : '#f0fdf4',
      }}>
        <span style={{
          width: 10, height: 10, borderRadius: '50%',
          background: count > 0 ? '#ef4444' : '#22c55e',
          display: 'inline-block', flexShrink: 0,
        }} />
        <span style={{ fontWeight: 700, fontSize: 18, color: '#0f172a' }}>
          {count}
        </span>
        <span style={{ fontSize: 13, color: '#64748b' }}>
          {count === 1 ? 'report' : 'reports'}
        </span>
      </div>
    </div>
  );
}

/* ── main component ── */
const ChoroplethMap = ({ districtCounts = [] }) => {
  const [geoData, setGeoData] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const geoJsonRef = useRef(null);

  // Build lookup { districtName (lowercase) → count }
  const countMap = {};
  districtCounts.forEach((d) => {
    countMap[d.district?.toLowerCase()] = d.count;
  });
  const maxCount = districtCounts.reduce((m, d) => Math.max(m, d.count), 0);
  const totalCrimes = districtCounts.reduce((s, d) => s + d.count, 0);

  // Load GeoJSON from public folder
  useEffect(() => {
    fetch('/bd-districts-geo.json')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error('Failed to load GeoJSON:', err));
  }, []);

  // Get count for a feature
  const getCount = useCallback((feature) => {
    const name = feature?.properties?.ADM2_EN?.toLowerCase();
    return countMap[name] || 0;
  }, [countMap]);

  // Style each district polygon
  const style = useCallback((feature) => {
    const count = getCount(feature);
    const isHovered = hoveredFeature?.properties?.ADM2_EN === feature.properties.ADM2_EN;
    return {
      fillColor: getColor(count, maxCount),
      fillOpacity: isHovered ? 0.85 : 0.6,
      color: isHovered ? '#1e293b' : '#ffffff',
      weight: isHovered ? 2.5 : 1,
      dashArray: isHovered ? '' : '1',
    };
  }, [maxCount, hoveredFeature, getCount]);

  // Event handlers for each feature
  const onEachFeature = useCallback((feature, layer) => {
    layer.on({
      mouseover: (e) => {
        setHoveredFeature(feature);
        const l = e.target;
        l.setStyle({
          fillOpacity: 0.85,
          color: '#1e293b',
          weight: 2.5,
          dashArray: '',
        });
        l.bringToFront();
      },
      mouseout: (e) => {
        setHoveredFeature(null);
        if (geoJsonRef.current) {
          geoJsonRef.current.resetStyle(e.target);
        }
      },
    });
  }, []);

  const hoveredCount = hoveredFeature ? getCount(hoveredFeature) : 0;

  return (
    <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              District Crime Map
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Hover over a district to view crime reports
              {totalCrimes > 0 && (
                <span className="ml-2 text-gray-500 font-medium">
                  • {totalCrimes} total
                </span>
              )}
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Low</span>
            <div className="flex h-3 rounded-full overflow-hidden" style={{ width: 90 }}>
              {GRADIENT.map((c, i) => (
                <div
                  key={i}
                  style={{ flex: 1, background: `rgb(${c[0]},${c[1]},${c[2]})` }}
                />
              ))}
            </div>
            <span>High</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ height: 560 }} className="relative">
        {!geoData ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <MapContainer
            center={[23.8, 90.3]}
            zoom={7}
            minZoom={6}
            maxZoom={12}
            style={{ width: '100%', height: '100%', background: '#f8fafc' }}
            zoomControl={true}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
              pane="shadowPane"
            />

            <GeoJSON
              ref={geoJsonRef}
              data={geoData}
              style={style}
              onEachFeature={onEachFeature}
            />
          </MapContainer>
        )}

        {/* Floating info panel */}
        <InfoPanel feature={hoveredFeature} count={hoveredCount} />
      </div>
    </div>
  );
};

export default ChoroplethMap;

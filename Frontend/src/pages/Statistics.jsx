import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import RoleBasedNavbar from '../components/RoleBasedNavbar';
import ChoroplethMap from '../components/ChoroplethMap';
import { statsAPI } from '../services/api';
import { locationData, districts } from '../data/locations';

const COLORS = ['#DC2626', '#EA580C', '#F59E0B', '#D97706', '#991B1B', '#7C2D12'];
const TIMEFRAMES = [
  { label: 'Last 7 Days', value: '7' },
  { label: 'Last 30 Days', value: '30' },
  { label: 'Last 90 Days', value: '90' },
  { label: 'All Time', value: '' },
];

const Statistics = () => {
  const [district, setDistrict] = useState('');
  const [days, setDays] = useState('');
  const [crimeTypes, setCrimeTypes] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [trend, setTrend] = useState([]);
  const [districtCounts, setDistrictCounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const params = {};
        if (district) params.district = district;
        if (days) params.days = days;
        const res = await statsAPI.getOverview(params);
        setCrimeTypes(res.data.crimeTypes);
        setHotspots(res.data.hotspots);
        setTrend(res.data.trend);
        setDistrictCounts(res.data.districtCounts || []);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [district, days]);

  const totalCrimes = crimeTypes.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleBasedNavbar />
      <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Crime Statistics</h1>
          <p className="text-gray-500 mt-1">Analyze crime patterns and hotspots from community reports.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {TIMEFRAMES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Choropleth Map — always visible */}
            <ChoroplethMap districtCounts={districtCounts} />

            {totalCrimes === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m6-10V5a2 2 0 012-2h2a2 2 0 012 2v4m6 10V11a2 2 0 00-2-2h-2a2 2 0 00-2 2v8" />
                </svg>
                <p className="text-lg font-medium">No chart data for the selected filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1: Crime Types Pie Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">Crime Type Distribution</h2>
                  <p className="text-sm text-gray-400 mb-4">{totalCrimes} total reports</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={crimeTypes}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        innerRadius={55}
                        paddingAngle={3}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {crimeTypes.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Card 2: Top 5 High-Risk Thanas Bar Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">Top 5 High-Risk Thanas</h2>
                  <p className="text-sm text-gray-400 mb-4">Most reported areas</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={hotspots} layout="vertical" margin={{ left: 10 }}>
                      <XAxis type="number" allowDecimals={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <YAxis
                        dataKey="thana"
                        type="category"
                        width={120}
                        tick={{ fill: '#374151', fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="count" name="Reports" radius={[0, 6, 6, 0]}>
                        {hotspots.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Card 3: Crime Trend Line Chart (full width) */}
                <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">Crime Trend Over Time</h2>
                  <p className="text-sm text-gray-400 mb-4">Monthly report volume</p>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={trend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Reports"
                        stroke="#DC2626"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#DC2626' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
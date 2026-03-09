import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { locationData, districts } from '../data/locations';
import { authAPI } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    nid: '',
    district: '',
    thana: '',
    role: 'user',
  });

  const navigate = useNavigate();
  const [thanas, setThanas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // If district is changed, update thanas list and reset thana selection
    if (name === 'district') {
      setFormData({
        ...formData,
        district: value,
        thana: '', // Reset thana when district changes
      });
      setThanas(locationData[value] || []);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.register(formData);
      console.log('Registration successful:', response);
      setSuccess(response.message || 'Registration successful! Redirecting to login...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => navigate('/'), 2000);

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        nid: '',
        district: '',
        thana: '',
        role: 'user',
      });
      setThanas([]);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="mb-8">
          <h1 className="text-center text-6xl font-bold text-indigo-700 mb-3" style={{ fontFamily: "'Irish Grover', cursive" }}>
            Dhor
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500 italic mb-6">
            "Crime dekhlei... Dhor!"
          </p>
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join the Community Safety Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Minimum 6 characters"
            />
          </div>

          {/* Phone Number Field */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="01XXXXXXXXX"
            />
          </div>

          {/* NID Number Field */}
          <div>
            <label
              htmlFor="nid"
              className="block text-sm font-medium text-gray-700"
            >
              NID Number
            </label>
            <input
              type="text"
              id="nid"
              name="nid"
              value={formData.nid}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your NID number"
            />
          </div>

          {/* District Dropdown */}
          <div>
            <label
              htmlFor="district"
              className="block text-sm font-medium text-gray-700"
            >
              District
            </label>
            <select
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          {/* Thana Dropdown (Cascading) */}
          <div>
            <label
              htmlFor="thana"
              className="block text-sm font-medium text-gray-700"
            >
              Thana/Upazila
            </label>
            <select
              id="thana"
              name="thana"
              value={formData.thana}
              onChange={handleChange}
              required
              disabled={!formData.district}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                !formData.district
                  ? 'bg-gray-100 cursor-not-allowed opacity-60'
                  : ''
              }`}
            >
              <option value="">
                {formData.district
                  ? 'Select Thana/Upazila'
                  : 'First select a district'}
              </option>
              {thanas.map((thana) => (
                <option key={thana} value={thana}>
                  {thana}
                </option>
              ))}
            </select>
          </div>

          {/* Role Selection */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Register As
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="user">User</option>
              <option value="police">Police</option>
            </select>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>

        {/* Additional Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="text-2xl font-bold text-indigo-700 cursor-pointer"
            style={{ fontFamily: "'Irish Grover', cursive" }}
            onClick={() => navigate('/home')}
          >
            Dhor
          </div>

          {/* Nav Icons */}
          <div className="flex items-center space-x-6">
            {/* Home */}
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `flex flex-col items-center text-xs transition-colors duration-200 ${
                  isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'
                }`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
              </svg>
              <span className="mt-0.5">Home</span>
            </NavLink>

            {/* Stats */}
            <NavLink
              to="/stats"
              className={({ isActive }) =>
                `flex flex-col items-center text-xs transition-colors duration-200 ${
                  isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'
                }`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="mt-0.5">Stats</span>
            </NavLink>

            {/* Profile */}
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-col items-center text-xs transition-colors duration-200 ${
                  isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'
                }`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="mt-0.5">Profile</span>
            </NavLink>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center text-xs text-gray-500 hover:text-red-500 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="mt-0.5">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

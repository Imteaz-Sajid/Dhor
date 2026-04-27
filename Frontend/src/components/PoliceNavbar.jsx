import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const PoliceNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-700 shadow-lg">
      <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between relative">

        {/* Logo */}
        <NavLink
          to="/police-feed"
          className="text-2xl font-bold text-slate-200"
          style={{ fontFamily: "'Irish Grover', cursive" }}
        >
          Dhor!
        </NavLink>

        {/* Centered Nav Icons */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
          {/* Home/Feed - Crime Heatmap */}
          <NavLink
            to="/police-feed"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-slate-700 text-blue-400 shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
              }`
            }
            title="Feed & Heatmap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
            </svg>
            <span className="text-[10px] font-medium mt-0.5 leading-none">Feed</span>
          </NavLink>

          {/* Crime Analytics Dashboard */}
          <NavLink
            to="/stats"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-slate-700 text-blue-400 shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
              }`
            }
            title="Crime Analytics"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-[10px] font-medium mt-0.5 leading-none">Stats</span>
          </NavLink>

          {/* SOS - Emergency Calls & Contacts */}
          <NavLink
            to="/directory"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-red-700 text-red-100 shadow-md'
                  : 'text-red-400 hover:bg-red-900 hover:text-red-300'
              }`
            }
            title="SOS - Emergency Calls"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-[10px] font-medium mt-0.5 leading-none">SOS</span>
          </NavLink>

          {/* Missing Persons & Stolen Vehicles */}
          <NavLink
            to="/missing"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-slate-700 text-blue-400 shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
              }`
            }
            title="Missing Persons"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6 6 6 0 00-6 6z" />
            </svg>
            <span className="text-[10px] font-medium mt-0.5 leading-none">Missing</span>
          </NavLink>

          {/* Officer Profile */}
          <NavLink
            to="/police-profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-slate-700 text-blue-400 shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
              }`
            }
            title="Officer Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-medium mt-0.5 leading-none">Profile</span>
          </NavLink>
        </div>

        {/* Right Side - Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 text-slate-100 hover:bg-slate-600 transition-colors text-sm font-medium"
          title="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default PoliceNavbar;

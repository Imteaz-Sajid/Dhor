{/* Centered Nav Icons */}
<div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
  {/* Home */}
  <NavLink
    to="/home"
    className={({ isActive }) =>
      `flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200 ${
        isActive
          ? 'bg-indigo-100 text-indigo-600 shadow-sm'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`
    }
    title="Home"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
    </svg>
    <span className="text-[11px] font-medium mt-0.5 leading-none">Home</span>
  </NavLink>

  {/* Stats */}
  <NavLink
    to="/stats"
    className={({ isActive }) =>
      `flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200 ${
        isActive
          ? 'bg-indigo-100 text-indigo-600 shadow-sm'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`
    }
    title="Stats"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
    <span className="text-[11px] font-medium mt-0.5 leading-none">Stats</span>
  </NavLink>

  {/* My Reports / Dashboard */}
  <NavLink
    to="/dashboard"
    className={({ isActive }) =>
      `flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200 ${
        isActive
          ? 'bg-indigo-100 text-indigo-600 shadow-sm'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`
    }
    title="My Reports"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <span className="text-[11px] font-medium mt-0.5 leading-none">Reports</span>
  </NavLink>

  {/* Emergency Directory */}
  <NavLink
    to="/directory"
    className={({ isActive }) =>
      `flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200 ${
        isActive
          ? 'bg-red-100 text-red-600 shadow-sm'
          : 'text-red-500 hover:bg-red-50 hover:text-red-600'
      }`
    }
    title="Emergency Police Directory"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
    <span className="text-[11px] font-medium mt-0.5 leading-none">SOS</span>
  </NavLink>

  {/* Missing Board */}
  <NavLink
    to="/missing"
    className={({ isActive }) =>
      `flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200 ${
        isActive
          ? 'bg-orange-100 text-orange-600 shadow-sm'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`
    }
    title="Missing Board"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <span className="text-[11px] font-medium mt-0.5 leading-none">Missing</span>
  </NavLink>

  {/* Notifications Bell */}
  {/* ... rest of the code stays the same ... */}
</div>
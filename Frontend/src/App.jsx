import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Statistics from './pages/Statistics'
import UserDashboard from './pages/UserDashboard'
import Directory from './pages/Directory'
import MissingBoard from './pages/MissingBoard'
import ReportMissing from './pages/ReportMissing'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/stats" element={<Statistics />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/directory" element={<Directory />} />
        <Route path="/missing" element={<MissingBoard />} />
        <Route path="/report-missing" element={<ReportMissing />} />
      </Routes>
    </Router>
  )
}

export default App
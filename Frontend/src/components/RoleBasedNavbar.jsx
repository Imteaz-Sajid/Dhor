import React from 'react';
import Navbar from './Navbar';
import PoliceNavbar from './PoliceNavbar';

/**
 * RoleBasedNavbar component that automatically renders the correct navbar based on user role
 * Checks localStorage for the user object and their role
 */
const RoleBasedNavbar = () => {
  const user = localStorage.getItem('user');
  let userRole = 'user'; // default

  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      userRole = parsedUser.role || 'user';
    } catch (err) {
      console.error('Failed to parse user from localStorage:', err);
    }
  }

  // Render appropriate navbar based on role
  if (userRole === 'police') {
    return <PoliceNavbar />;
  }

  return <Navbar />;
};

export default RoleBasedNavbar;

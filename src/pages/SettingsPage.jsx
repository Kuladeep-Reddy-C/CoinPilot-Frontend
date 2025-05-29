import React from 'react';
import { UserProfile } from '@clerk/clerk-react';
import Navbar from '../components/NavBar';
import { useTheme } from '../components/Theme';

const SettingsPage = () => {
  const { isDarkMode } = useTheme();

  // Theme classes
  const themeClasses = isDarkMode 
    ? 'bg-gray-900 text-white' 
    : 'bg-gray-100 text-gray-800';
  
  const cardClasses = isDarkMode 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-gray-200';

  return (
    <div className={`flex h-screen w-full transition-colors duration-200 ${themeClasses}`}>
      {/* Sidebar via Navbar Component */}
      <Navbar activePage="Settings" />

      {/* Main Content */}
      {/* <div className="flex-1 overflow-auto p-6"> */}
        <div className={`p-4 rounded-lg border ${cardClasses}`}>
          <h2 className="text-lg font-medium mb-4">Profile Settings</h2>
          <div className={`p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            {/* Clerk UserProfile Component for editing and updating profile */}
            <UserProfile />
          </div>
        </div>
      </div>
    // </div>
  );
};

export default SettingsPage;
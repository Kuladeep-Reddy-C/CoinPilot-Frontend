import React, { useState } from 'react';
import { Sun, Moon, Home, CreditCard, CheckSquare, Settings, LifeBuoy, LogOut, ReceiptText } from 'lucide-react';
import { SignOutButton, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './Theme';

const Navbar = ({ activePage }) => {
  const { user } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className={`w-16 sm:${isSidebarCollapsed ? 'w-16' : 'w-64'} flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} transition-all duration-300 border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
      <div className="flex items-center justify-center py-6">
        {!isSidebarCollapsed ? (
          <div className="flex items-center space-x-2">
            <div className="text-teal-500 font-bold text-2xl">CoinPilot</div>
          </div>
        ) : (
          <div className="text-teal-500 font-bold text-xl">e</div>
        )}
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="px-4 mb-6">
          <div className="flex items-center mb-6">
            {user && (
              <div onClick={() => navigate('/settings')} className="flex-shrink-0 cursor-pointer">
                <img 
                  src={user.imageUrl} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full"
                />
              </div>
            )}
            {!isSidebarCollapsed && (
              <div className="ml-3 hidden sm:block">
                <p className="text-sm font-medium">{user?.firstName || 'User'}</p>
              </div>
            )}
          </div>
          <button 
            onClick={toggleSidebar}
            className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-md ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'}`}
          >
            {isSidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="px-2 space-y-1">
          <button 
            onClick={() => navigate('/home')}
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start sm:justify-start'} w-full px-2 py-2 rounded-md ${activePage === 'Home' ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-300') + ' text-teal-500' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'} text-gray-400 font-medium`}
          >
            <Home className="flex-shrink-0 w-6 h-6" />
            {!isSidebarCollapsed && <span className="ml-3 hidden sm:block">Home</span>}
          </button>
          
          <button 
            onClick={() => navigate('/glance')}
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start sm:justify-start'} w-full px-2 py-2 rounded-md ${activePage === 'Glance' ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-300') + ' text-teal-500' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'} text-gray-400 font-medium `}
          >
            <ReceiptText className="flex-shrink-0 w-6 h-6" />
            {!isSidebarCollapsed && <span className="ml-3 hidden sm:block">Glance</span>}
          </button>

          <button 
            onClick={() => navigate('/expenses')}
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start sm:justify-start'} w-full px-2 py-2 rounded-md ${activePage === 'Expenses' ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-300') + ' text-teal-500' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'} text-gray-400 font-medium`}
          >
            <CreditCard className="flex-shrink-0 w-6 h-6" />
            {!isSidebarCollapsed && <span className="ml-3 hidden sm:block">Expenses</span>}
          </button>

          <button 
            onClick={() => navigate('/earnings')}
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start sm:justify-start'} w-full px-2 py-2 rounded-md ${activePage === 'Earnings' ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-300') + ' text-teal-500' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'} text-gray-400 font-medium`}
          >
            <CheckSquare className="flex-shrink-0 w-6 h-6" />
            {!isSidebarCollapsed && <span className="ml-3 hidden sm:block">Earnings</span>}
          </button>

          <button 
            onClick={() => navigate('/settings')}
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start sm:justify-start'} w-full px-2 py-2 rounded-md ${activePage === 'Settings' ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-300') + ' text-teal-500' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'} text-gray-400 font-medium`}
          >
            <Settings className="flex-shrink-0 w-6 h-6" />
            {!isSidebarCollapsed && <span className="ml-3 hidden sm:block">Settings</span>}
          </button>

          <button 
            onClick={() => navigate('/support')}
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start sm:justify-start'} w-full px-2 py-2 rounded-md ${activePage === 'Support' ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-300') + ' text-teal-500' : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'} text-gray-400 font-medium `}
          >
            <LifeBuoy className="flex-shrink-0 w-6 h-6" />
            {!isSidebarCollapsed && <span className="ml-3 hidden sm:block">Support</span>}
          </button>

          <SignOutButton signOutCallback={handleLogout}>
            <button
              className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start sm:justify-start'} w-full px-2 py-2 rounded-md ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'} text-gray-400 font-medium `}
            >
              <LogOut className="flex-shrink-0 w-6 h-6" />
              {!isSidebarCollapsed && <span className="ml-3 hidden sm:block">Logout</span>}
            </button>
          </SignOutButton>
        </nav>

        <div className="mt-auto px-4 pb-4">
          <button
            onClick={toggleTheme}
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start sm:justify-start'} w-full p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'}`}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-5 h-5 text-yellow-400" />
                {!isSidebarCollapsed && <span className="ml-3 hidden sm:block">Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-blue-600" />
                {!isSidebarCollapsed && <span className="ml-3 hidden sm:block">Dark Mode</span>}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
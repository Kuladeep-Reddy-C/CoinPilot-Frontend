import React, { useState } from 'react';
import { Sun, Moon, Home, CreditCard, CheckSquare, Settings, LifeBuoy, LogOut, ReceiptText, Menu, X } from 'lucide-react';
import { SignOutButton, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './Theme';

const Navbar = ({ activePage }) => {
  const { user } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    closeMobileMenu();
  };

  const navItems = [
    { name: 'Home', icon: Home, path: '/home' },
    { name: 'Glance', icon: ReceiptText, path: '/glance' },
    { name: 'Expenses', icon: CreditCard, path: '/expenses' },
    { name: 'Earnings', icon: CheckSquare, path: '/earnings' },
    { name: 'Settings', icon: Settings, path: '/settings' },
    { name: 'Support', icon: LifeBuoy, path: '/support' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className={`md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
        <div className="flex items-center space-x-3">
          {user && (
            <img 
              src={user.imageUrl} 
              alt="Profile" 
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="text-teal-500 font-bold text-xl">CoinPilot</div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'}`}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-blue-600" />
            )}
          </button>
          
          <button
            onClick={toggleMobileMenu}
            className={`p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'}`}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-400" />
            ) : (
              <Menu className="w-6 h-6 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className={`md:hidden fixed top-16 left-0 right-0 z-40 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} shadow-lg`}>
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center w-full px-3 py-2 rounded-md ${
                    activePage === item.name 
                      ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-300') + ' text-teal-500' 
                      : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'
                  } text-gray-400 font-medium`}
                >
                  <IconComponent className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </button>
              );
            })}
            
            <SignOutButton signOutCallback={handleLogout}>
              <button
                className={`flex items-center w-full px-3 py-2 rounded-md ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'} text-gray-400 font-medium`}
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span>Logout</span>
              </button>
            </SignOutButton>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden md:flex w-16 md:${isSidebarCollapsed ? 'w-16' : 'w-64'} flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} transition-all duration-300 border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
        <div className="flex items-center justify-center py-6">
          {!isSidebarCollapsed ? (
            <div className="flex items-center space-x-2">
              <div className="text-teal-500 font-bold text-2xl">CoinPilot</div>
            </div>
          ) : (
            <div className="text-teal-500 font-bold text-xl">C</div>
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
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-400">{user?.firstName || 'User'}</p>
                </div>
              )}
            </div>
            <button 
              onClick={toggleSidebar}
              className={`flex items-center justify-center w-8 h-8 rounded-md ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'}`}
            >
              {isSidebarCollapsed ? '→' : '←'}
            </button>
          </div>

          <nav className="px-2 space-y-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} w-full px-2 py-2 rounded-md ${
                    activePage === item.name 
                      ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-300') + ' text-teal-500' 
                      : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'
                  } text-gray-400 font-medium`}
                >
                  <IconComponent className="flex-shrink-0 w-6 h-6" />
                  {!isSidebarCollapsed && <span className="ml-3">{item.name}</span>}
                </button>
              );
            })}

            <SignOutButton signOutCallback={handleLogout}>
              <button
                className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} w-full px-2 py-2 rounded-md ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'} text-gray-400 font-medium`}
              >
                <LogOut className="flex-shrink-0 w-6 h-6" />
                {!isSidebarCollapsed && <span className="ml-3">Logout</span>}
              </button>
            </SignOutButton>
          </nav>

          <div className="mt-auto px-4 pb-4">
            <button
              onClick={toggleTheme}
              className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} w-full p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'}`}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-5 h-5 text-yellow-400" />
                  {!isSidebarCollapsed && <span className="ml-3">Light Mode</span>}
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5 text-blue-600" />
                  {!isSidebarCollapsed && <span className="ml-3">Dark Mode</span>}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
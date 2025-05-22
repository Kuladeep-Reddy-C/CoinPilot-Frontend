import React from 'react';
import { useTheme } from '../components/Theme';
import PieChartsComponent from '../components/PieChartComponent';
import Navbar from '../components/NavBar';
import TransactionsPage from '../components/TramsactionsPage';

const GlancePage = () => {
  const { isDarkMode } = useTheme();

  // Theme classes consistent with Expenses page
  const themeClasses = isDarkMode 
    ? 'bg-gray-900 text-white' 
    : 'bg-gray-100 text-gray-800';

  return (
    <div className={`flex h-screen w-full transition-colors duration-200 ${themeClasses}`}>
      {/* Sidebar via Navbar Component */}
      <Navbar activePage="Glance" />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">

          {/* Pie Chart Section */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6`}>
            <PieChartsComponent />
            <TransactionsPage />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlancePage;
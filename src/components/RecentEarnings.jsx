import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useTheme } from './Theme';

const RecentEarnings = ({ refreshFlag }) => {
  const url = import.meta.env.VITE_BACKEND_URL;
  const { getToken } = useAuth();
  const { isDarkMode } = useTheme();
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theme classes    
    
    const cardClasses = isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200';

  // Fetch earnings on mount and when refreshFlag changes
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const response = await fetch(`${url}/api/earning`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch earnings');
        }

        const data = await response.json();
        setEarnings(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [getToken, refreshFlag]);

  // Format amount with Euro symbol
  const formatAmount = (amount) => `€${amount.toFixed(2)}`;

  // Take the first 4 earnings
  const displayedEarnings = earnings.length > 4 ? earnings.slice(0, 4) : earnings;

  const newData = displayedEarnings.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  // Map categories to colors and initials (updated to match previous styling)
  const getCategoryStyle = (category) => {
    switch (category) {
      case 'Client Payment':
        return {
          initial: 'C',
          bgColor: isDarkMode ? 'bg-blue-900' : 'bg-blue-100',
          textColor: 'text-blue-500',
        };
      case 'Project Completion':
        return {
          initial: 'P',
          bgColor: isDarkMode ? 'bg-purple-900' : 'bg-purple-100',
          textColor: 'text-purple-500',
        };
      case 'Freelance Work':
        return {
          initial: 'F',
          bgColor: isDarkMode ? 'bg-green-900' : 'bg-green-100',
          textColor: 'text-green-500',
        };
      case 'Royalty Income':
        return {
          initial: 'R',
          bgColor: isDarkMode ? 'bg-red-900' : 'bg-red-100',
          textColor: 'text-red-500',
        };
      default:
        return {
          initial: category.charAt(0).toUpperCase(),
          bgColor: isDarkMode ? 'bg-gray-700' : 'bg-gray-100',
          textColor: 'text-gray-500',
        };
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${cardClasses}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Recent Earnings</h2>
      </div>
      {loading ? (
        <div className="text-center text-[#A3BFFA] py-4 animate-pulse">Loading...</div>
      ) : error ? (
        <div className="text-center text-[#E53E3E] py-4">{error}</div>
      ) : displayedEarnings.length === 0 ? (
        <div className="text-center text-[#A3BFFA] py-4">No earnings found.</div>
      ) : (
        <div className="space-y-3">
          {newData.map((earning) => {
            const { initial, bgColor, textColor } = getCategoryStyle(earning.category);
            return (
              <div
                key={earning._id}
                className={`flex justify-between items-center p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} hover:bg-[#3A4A4B] transition-colors duration-200`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bgColor} ${textColor}`}>
                    {initial}
                  </div>
                  <span className="ml-3">{earning.category}</span>
                </div>
                <div className="text-[#38A169] font-semibold">{formatAmount(earning.amount)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentEarnings;
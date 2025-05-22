import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useTheme } from './Theme';
import Loader from './Loading';

const ChartsComponentBar = ({refreshFlag}) => {
  const url = import.meta.env.VITE_BACKEND_URL;
  const { getToken } = useAuth();
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [earnings, setEarnings] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-based (1 = Jan, 12 = Dec)
  const [selectedWeek, setSelectedWeek] = useState(1); // Default to first week

  // Theme classes
  const cardClasses = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const inputClasses = isDarkMode
    ? 'bg-gray-700 text-white border-gray-600 focus:ring-teal-500'
    : 'bg-gray-100 text-gray-800 border-gray-300 focus:ring-teal-500';

  // Fetch earnings
  useEffect(() => {
    let isMounted = true;

    const fetchEarnings = async () => {
      try {
        setIsLoading(true);
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
        // console.log('Earnings data:', data);
        if (isMounted) {
          setEarnings(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    };

    fetchEarnings();
    return () => {
      isMounted = false;
    };
  }, [getToken, url, refreshFlag]);

  // Fetch expenses
  useEffect(() => {
    let isMounted = true;

    const fetchExpenses = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        const response = await fetch(`${url}/api/expense`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch expenses');
        }

        const data = await response.json();
        // console.log('Expenses data:', data);
        if (isMounted) {
          setExpenses(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    };

    fetchExpenses();
    return () => {
      isMounted = false;
    };
  }, [getToken, url,refreshFlag]);

  // Aggregate data by week for the selected month and year
  const aggregateByWeek = (data, year, month) => {
    const weeks = Array(5).fill(0); // Max 5 weeks
    
    if (!data || data.length === 0) return weeks;
    
    data.forEach((item) => {
      if (!item.date) return;
      
      const date = new Date(item.date);
      if (date.getFullYear() === year && date.getMonth() + 1 === month) {
        const week = Math.floor((date.getDate() - 1) / 7) + 1; // Week 1 to 5
        if (week >= 1 && week <= 5) {
          weeks[week - 1] += Number(item.amount) || 0;
        }
      }
    });
    // console.log(`Weekly aggregation for ${month}/${year}:`, weeks);
    return weeks;
  };

  // Aggregate data by day for the selected week, month, and year
  const aggregateByDay = (data, year, month, week) => {
    const days = Array(7).fill(0); // 7 days in a week
    
    if (!data || data.length === 0) return days;
    
    // Calculate the first day of the month
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const startDate = (week - 1) * 7 + 1; // Start date of the week
    
    data.forEach((item) => {
      if (!item.date) return;
      
      const date = new Date(item.date);
      if (date.getFullYear() === year && date.getMonth() + 1 === month) {
        const day = date.getDate();
        // Check if date falls within the week range
        if (day >= startDate && day < startDate + 7) {
          const dayIndex = day - startDate;
          if (dayIndex >= 0 && dayIndex < 7) {
            days[dayIndex] += Number(item.amount) || 0;
          }
        }
      }
    });
    // console.log(`Daily aggregation for week ${week}, ${month}/${year}:`, days);
    return days;
  };

  // Generate labels
  const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
  
  // Generate actual date labels for the selected week
  const generateDateLabels = () => {
    const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
    const startDate = (selectedWeek - 1) * 7 + 1;
    const dateLabels = [];
    
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(selectedYear, selectedMonth - 1, startDate + i);
      // Check if the date is still in the current month
      if (dayDate.getMonth() + 1 === selectedMonth) {
        dateLabels.push({
          date: dayDate.getDate(),
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayDate.getDay()]
        });
      } else {
        dateLabels.push(null); // This date is not in the current month
      }
    }
    
    return dateLabels;
  };
  
  const dateLabels = generateDateLabels();

  // Aggregate data
  const weeklyEarnings = aggregateByWeek(earnings, selectedYear, selectedMonth);
  const weeklyExpenses = aggregateByWeek(expenses, selectedYear, selectedMonth);
  const dailyEarnings = aggregateByDay(earnings, selectedYear, selectedMonth, selectedWeek);
  const dailyExpenses = aggregateByDay(expenses, selectedYear, selectedMonth, selectedWeek);

  // Calculate max amounts for normalization
  const maxWeeklyAmount = Math.max(...weeklyEarnings, ...weeklyExpenses, 1);
  const maxDailyAmount = Math.max(...dailyEarnings, ...dailyExpenses, 1);

  // Generate month and year options
  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];
  const yearOptions = Array.from({ length: 10 }, (_, i) => 2020 + i);

  // Calculate number of weeks in the selected month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const numWeeks = Math.ceil(daysInMonth / 7);

  return (
    <div className="p-3 sm:p-4 md:p-6 w-full">
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader isDarkMode={isDarkMode} />
        </div>
      ) : error ? (
        <div className={`text-center py-8 rounded-lg ${isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
          <div className="text-sm sm:text-base">{error}</div>
        </div>
      ) : (
        <div className={`p-3 sm:p-4 md:p-6 rounded-lg border ${cardClasses} w-full`}>
          {/* Header Section */}
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-start mb-6">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-medium mb-2">Financial Report</h2>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Track your earnings and expenses over time
              </p>
            </div>
            
            {/* Controls - Responsive Layout */}
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <label htmlFor="month-select" className={`block text-xs sm:text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Month
                </label>
                <select
                  id="month-select"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(Number(e.target.value));
                    setSelectedWeek(1);
                  }}
                  className={`w-full p-2 text-sm rounded-lg border ${inputClasses} focus:outline-none focus:ring-2 transition-all duration-200`}
                >
                  {monthOptions.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 sm:flex-none">
                <label htmlFor="year-select" className={`block text-xs sm:text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Year
                </label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(Number(e.target.value));
                    setSelectedWeek(1);
                  }}
                  className={`w-full p-2 text-sm rounded-lg border ${inputClasses} focus:outline-none focus:ring-2 transition-all duration-200`}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Charts Grid - Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Weekly Report */}
            <div className="order-1">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
                <h3 className={`text-sm sm:text-base font-medium mb-2 sm:mb-0 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Weekly Overview
                </h3>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {monthOptions[selectedMonth - 1].label} {selectedYear}
                </div>
              </div>
              
              <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} p-3 sm:p-4`}>
                {/* Legend */}
                <div className="flex justify-center gap-4 sm:gap-6 mb-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded mr-2"></div>
                    <span className="text-xs sm:text-sm">Earnings</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 rounded mr-2"></div>
                    <span className="text-xs sm:text-sm">Expenses</span>
                  </div>
                </div>

                {/* Chart Container */}
                <div className="h-40 sm:h-48 relative">
                  {weeklyEarnings.every(amount => amount === 0) && weeklyExpenses.every(amount => amount === 0) ? (
                    <div className={`flex flex-col items-center justify-center h-full ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div className="text-2xl sm:text-3xl mb-2">📊</div>
                      <div className="text-xs sm:text-sm text-center">
                        No data for {monthOptions[selectedMonth - 1].label} {selectedYear}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-end justify-around px-2">
                      {weekLabels.slice(0, numWeeks).map((week, index) => (
                        <div
                          key={week}
                          className="flex flex-col items-center flex-1 max-w-16 cursor-pointer group"
                          onClick={() => setSelectedWeek(index + 1)}
                        >
                          {/* Bars Container */}
                          <div className="flex items-end justify-center gap-1 h-32 sm:h-36 mb-2 relative">
                            {/* Earnings Bar */}
                            <div
                              className={`w-3 sm:w-4 transition-all duration-200 rounded-t ${
                                selectedWeek === index + 1 ? 'bg-blue-600' : 'bg-blue-500'
                              } ${selectedWeek === index + 1 ? 'shadow-lg' : ''}`}
                              style={{ 
                                height: weeklyEarnings[index] > 0 ? `${Math.max((weeklyEarnings[index] / maxWeeklyAmount) * 120, 4)}px` : '0px'
                              }}
                            ></div>
                            {/* Expenses Bar */}
                            <div
                              className={`w-3 sm:w-4 transition-all duration-200 rounded-t ${
                                selectedWeek === index + 1 ? 'bg-purple-600' : 'bg-purple-500'
                              } ${selectedWeek === index + 1 ? 'shadow-lg' : ''}`}
                              style={{ 
                                height: weeklyExpenses[index] > 0 ? `${Math.max((weeklyExpenses[index] / maxWeeklyAmount) * 120, 4)}px` : '0px'
                              }}
                            ></div>
                            
                            {/* Tooltip */}
                            <div className={`absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-black'} text-white text-xs rounded-lg p-2 pointer-events-none z-10 whitespace-nowrap`}>
                              <div className="font-medium">{week}</div>
                              <div>Earnings: €{weeklyEarnings[index].toFixed(2)}</div>
                              <div>Expenses: €{weeklyExpenses[index].toFixed(2)}</div>
                            </div>
                          </div>
                          
                          {/* Week Label */}
                          <div className={`text-xs text-center ${selectedWeek === index + 1 ? 'font-medium text-blue-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            W{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Daily Report */}
            <div className="order-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
                <h3 className={`text-sm sm:text-base font-medium mb-2 sm:mb-0 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Daily Breakdown
                </h3>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Week {selectedWeek}, {monthOptions[selectedMonth - 1].label} {selectedYear}
                </div>
              </div>
              
              <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} p-3 sm:p-4`}>
                {/* Legend */}
                <div className="flex justify-center gap-4 sm:gap-6 mb-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded mr-2"></div>
                    <span className="text-xs sm:text-sm">Earnings</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 rounded mr-2"></div>
                    <span className="text-xs sm:text-sm">Expenses</span>
                  </div>
                </div>

                {/* Chart Container */}
                <div className="h-40 sm:h-48 relative">
                  {dailyEarnings.every(amount => amount === 0) && dailyExpenses.every(amount => amount === 0) ? (
                    <div className={`flex flex-col items-center justify-center h-full ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div className="text-2xl sm:text-3xl mb-2">📈</div>
                      <div className="text-xs sm:text-sm text-center">
                        No data for Week {selectedWeek}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-end justify-around px-1">
                      {dateLabels.map((dateInfo, index) => {
                        if (!dateInfo) return <div key={index} className="flex-1"></div>;
                        return (
                          <div key={index} className="flex flex-col items-center flex-1 max-w-12 group">
                            {/* Bars Container */}
                            <div className="flex items-end justify-center gap-1 h-32 sm:h-36 mb-2 relative">
                              {/* Earnings Bar */}
                              <div
                                className="w-2 sm:w-3 bg-blue-500 rounded-t"
                                style={{ 
                                  height: dailyEarnings[index] > 0 ? `${Math.max((dailyEarnings[index] / maxDailyAmount) * 120, 2)}px` : '0px'
                                }}
                              ></div>
                              {/* Expenses Bar */}
                              <div
                                className="w-2 sm:w-3 bg-purple-500 rounded-t"
                                style={{ 
                                  height: dailyExpenses[index] > 0 ? `${Math.max((dailyExpenses[index] / maxDailyAmount) * 120, 2)}px` : '0px'
                                }}
                              ></div>
                              
                              {/* Tooltip */}
                              <div className={`absolute -top-20 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-black'} text-white text-xs rounded-lg p-2 pointer-events-none z-10 whitespace-nowrap`}>
                                <div className="font-medium">{dateInfo.day}, {dateInfo.date}</div>
                                <div>Earnings: €{dailyEarnings[index].toFixed(2)}</div>
                                <div>Expenses: €{dailyExpenses[index].toFixed(2)}</div>
                              </div>
                            </div>
                            
                            {/* Date Label */}
                            <div className={`text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {dateInfo.date}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default ChartsComponentBar;
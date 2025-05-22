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
    <div className="p-6">
      {isLoading ? (
        <Loader isDarkMode={isDarkMode} />
      ) : error ? (
        <div className="text-center text-[#E53E3E] py-10">{error}</div>
      ) : (
        <div className={`mt-6 p-4 rounded-lg border ${cardClasses}`}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <h2 className="text-lg font-medium mb-4 sm:mb-0">Financial Report</h2>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <div>
                <label htmlFor="month-select" className="block text-sm font-medium mb-1 text-[#A3BFFA]">
                  Select Month
                </label>
                <select
                  id="month-select"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(Number(e.target.value));
                    setSelectedWeek(1);
                  }}
                  className={`p-2 rounded-lg border ${inputClasses} focus:outline-none focus:ring-2 transition-all duration-200`}
                >
                  {monthOptions.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="year-select" className="block text-sm font-medium mb-1 text-[#A3BFFA]">
                  Select Year
                </label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(Number(e.target.value));
                    setSelectedWeek(1);
                  }}
                  className={`p-2 rounded-lg border ${inputClasses} focus:outline-none focus:ring-2 transition-all duration-200`}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly Report */}
            <div>
              <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-[#A3BFFA]' : 'text-gray-600'}`}>
                Weekly Earnings vs Expenses ({monthOptions[selectedMonth - 1].label} {selectedYear})
              </h3>
              <div className={`h-48 p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} relative`}>
                <div className="flex justify-center space-x-4 mb-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#3182CE] mr-1"></div>
                    <span className="text-xs">Earnings</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-purple-500 mr-1"></div>
                    <span className="text-xs">Expenses</span>
                  </div>
                </div>
                {weeklyEarnings.every(amount => amount === 0) && weeklyExpenses.every(amount => amount === 0) ? (
                  <div className="text-center text-[#A3BFFA] py-10">
                    No data for {monthOptions[selectedMonth - 1].label} {selectedYear}
                  </div>
                ) : (
                  <div className="flex h-32 items-end justify-around space-x-2">
                    {weekLabels.slice(0, numWeeks).map((week, index) => (
                      <div
                        key={week}
                        className="flex flex-row items-end justify-center gap-1 flex-1 cursor-pointer relative group"
                        onClick={() => setSelectedWeek(index + 1)}
                      >
                        <div
                          className={`w-4 ${selectedWeek === index + 1 ? 'bg-[#60A5FA]' : 'bg-[#3182CE]'} rounded-t`}
                          style={{ 
                            height: weeklyEarnings[index] > 0 ? `${(weeklyEarnings[index] / maxWeeklyAmount) * 100}px` : '0px'
                          }}
                        ></div>
                        <div
                          className={`w-4 ${selectedWeek === index + 1 ? 'bg-purple-600' : 'bg-purple-500'} rounded-t`}
                          style={{ 
                            height: weeklyExpenses[index] > 0 ? `${(weeklyExpenses[index] / maxWeeklyAmount) * 100}px` : '0px'
                          }}
                        ></div>
                        <div className="absolute bottom-0 text-center w-full mt-2">
                          <span className="text-xs">{week}</span>
                        </div>
                        <div className="absolute opacity-0 group-hover:opacity-100 bg-black text-white text-xs rounded p-1 -top-8 z-10">
                          Earnings: €{weeklyEarnings[index].toFixed(2)}<br />
                          Expenses: €{weeklyExpenses[index].toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Daily Report */}
            <div>
              <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-[#A3BFFA]' : 'text-gray-600'}`}>
                Daily Earnings vs Expenses (Week {selectedWeek}, {monthOptions[selectedMonth - 1].label} {selectedYear})
              </h3>
              <div className={`h-48 p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} relative`}>
                <div className="flex justify-center space-x-4 mb-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#3182CE] mr-1"></div>
                    <span className="text-xs">Earnings</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-purple-500 mr-1"></div>
                    <span className="text-xs">Expenses</span>
                  </div>
                </div>
                {dailyEarnings.every(amount => amount === 0) && dailyExpenses.every(amount => amount === 0) ? (
                  <div className="text-center text-[#A3BFFA] py-10">
                    No data for Week {selectedWeek}, {monthOptions[selectedMonth - 1].label} {selectedYear}
                  </div>
                ) : (
                  <div className="flex h-32 items-end justify-around space-x-2">
                    {dateLabels.map((dateInfo, index) => {
                      if (!dateInfo) return null;
                      return (
                        <div key={index} className="flex flex-row items-end justify-center gap-1 flex-1 relative group">
                          <div
                            className="w-4 bg-[#3182CE] rounded-t"
                            style={{ 
                              height: dailyEarnings[index] > 0 ? `${(dailyEarnings[index] / maxDailyAmount) * 100}px` : '0px'
                            }}
                          ></div>
                          <div
                            className="w-4 bg-purple-500 rounded-t"
                            style={{ 
                              height: dailyExpenses[index] > 0 ? `${(dailyExpenses[index] / maxDailyAmount) * 100}px` : '0px'
                            }}
                          ></div>
                          <div className="absolute bottom-0 text-center w-full mt-2">
                            <span className="text-xs">{dateInfo.date}</span>
                          </div>
                          <div className="absolute opacity-0 group-hover:opacity-100 bg-black text-white text-xs rounded p-1 -top-8 z-10">
                            <div>{dateInfo.day}, {dateInfo.date}</div>
                            Earnings: €{dailyEarnings[index].toFixed(2)}<br />
                            Expenses: €{dailyExpenses[index].toFixed(2)}
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
      )}
    </div>
  );
};

export default ChartsComponentBar;
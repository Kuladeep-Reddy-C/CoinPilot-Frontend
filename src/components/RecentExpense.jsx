import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useTheme } from './Theme';

const RecentExpenses = ({ refreshFlag }) => {
  const url = import.meta.env.VITE_BACKEND_URL;
  const { getToken } = useAuth();
  const { isDarkMode } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theme classes
  const cardClasses = isDarkMode 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-gray-200';

  // Fetch expenses on mount and when refreshFlag changes
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
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
        setExpenses(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [getToken, refreshFlag, url]);

  // Format amount with Euro symbol
  const formatAmount = (amount) => `€${amount.toFixed(2)}`;

  // Take the first 4 expenses
  const displayedExpenses = expenses.length > 4 ? expenses.slice(0, 4) : expenses;
  const newData = displayedExpenses.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  // Map categories to badge styles
    const getCategoryStyle = (category) => {
    switch (category) {
        case 'Food':
        return {
            bgColor: isDarkMode ? 'bg-orange-900' : 'bg-orange-100',
            textColor: isDarkMode ? 'text-orange-300' : 'text-orange-500',
        };
        case 'Transportation':
        return {
            bgColor: isDarkMode ? 'bg-blue-900' : 'bg-blue-100',
            textColor: isDarkMode ? 'text-blue-300' : 'text-blue-500',
        };
        case 'Healthcare':
        return {
            bgColor: isDarkMode ? 'bg-teal-900' : 'bg-teal-100',
            textColor: isDarkMode ? 'text-teal-300' : 'text-teal-500',
        };
        case 'Entertainment':
        return {
            bgColor: isDarkMode ? 'bg-purple-900' : 'bg-purple-100',
            textColor: isDarkMode ? 'text-purple-300' : 'text-purple-500',
        };
        case 'Education':
        return {
            bgColor: isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100',
            textColor: isDarkMode ? 'text-indigo-300' : 'text-indigo-500',
        };
        case 'Groceries':
        return {
            bgColor: isDarkMode ? 'bg-red-900' : 'bg-red-100',
            textColor: isDarkMode ? 'text-red-300' : 'text-red-500',
        };
        case 'Insurance':
        return {
            bgColor: isDarkMode ? 'bg-cyan-900' : 'bg-cyan-100',
            textColor: isDarkMode ? 'text-cyan-300' : 'text-cyan-500',
        };
        case 'Shopping':
        return {
            bgColor: isDarkMode ? 'bg-pink-900' : 'bg-pink-100',
            textColor: isDarkMode ? 'text-pink-300' : 'text-pink-500',
        };
        case 'Utilities':
        return {
            bgColor: isDarkMode ? 'bg-green-900' : 'bg-green-100',
            textColor: isDarkMode ? 'text-green-300' : 'text-green-500',
        };
        case 'Taxes':
        return {
            bgColor: isDarkMode ? 'bg-amber-900' : 'bg-amber-100',
            textColor: isDarkMode ? 'text-amber-300' : 'text-amber-500',
        };
        case 'Miscellaneous':
        return {
            bgColor: isDarkMode ? 'bg-gray-700' : 'bg-gray-100',
            textColor: isDarkMode ? 'text-gray-300' : 'text-gray-500',
        };
        default:
        return {
            bgColor: isDarkMode ? 'bg-gray-700' : 'bg-gray-100',
            textColor: isDarkMode ? 'text-gray-300' : 'text-gray-500',
        };
    }
    };

  return (
    <div className={`p-4 rounded-lg border ${cardClasses}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Recent Expenses</h2>
      </div>
      {loading ? (
        <div className="text-center text-[#A3BFFA] py-4 animate-pulse">Loading...</div>
      ) : error ? (
        <div className="text-center text-[#E53E3E] py-4">{error}</div>
      ) : displayedExpenses.length === 0 ? (
        <div className="text-center text-[#A3BFFA] py-4">No expenses found.</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className={`text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <th className="pb-2">Subject</th>
              <th className="pb-2">Category</th>
              <th className="pb-2">Payment Method</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {newData.map((expense) => {
              const { bgColor, textColor } = getCategoryStyle(expense.category);
              return (
                <tr key={expense._id}>
                  <td className="py-2">{expense.description}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${bgColor} ${textColor}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-2">{expense.paymentMethod}</td>
                  <td className="py-2 text-right text-[#E53E3E] font-semibold">
                    {formatAmount(expense.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RecentExpenses;
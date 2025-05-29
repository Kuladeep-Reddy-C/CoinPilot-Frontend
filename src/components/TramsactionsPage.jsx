import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useTheme } from './Theme';
import Loader from './Loading';
import { 
  Cake, 
  Truck, 
  Heart, 
  Film, 
  BookOpen, 
  ShoppingCart, 
  ShieldCheck, 
  ShoppingBag, 
  Lightbulb, 
  FileText, 
  MoreHorizontal,
  DollarSign
} from 'lucide-react';

const TransactionsPage = () => {
  const url = import.meta.env.VITE_BACKEND_URL;
  const { getToken } = useAuth();
  const { isDarkMode } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('date-desc');

  // Theme classes
  const themeClasses = isDarkMode 
    ? 'bg-gray-900 text-white' 
    : 'bg-gray-100 text-gray-800';
  
  const cardClasses = isDarkMode 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-gray-200';

  const inputClasses = isDarkMode
    ? 'bg-gray-700 text-white border-gray-600 focus:ring-teal-500'
    : 'bg-gray-100 text-gray-800 border-gray-300 focus:ring-teal-500';

  // Fetch earnings and expenses
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();

        // Fetch earnings
        const earningsResponse = await fetch(`${url}/api/earning`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!earningsResponse.ok) {
          const errorData = await earningsResponse.json();
          throw new Error(errorData.message || 'Failed to fetch earnings');
        }

        const earningsData = await earningsResponse.json();

        // Fetch expenses
        const expensesResponse = await fetch(`${url}/api/expense`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!expensesResponse.ok) {
          const errorData = await expensesResponse.json();
          throw new Error(errorData.message || 'Failed to fetch expenses');
        }

        const expensesData = await expensesResponse.json();

        // Combine earnings and expenses, adding a type field
        const combinedTransactions = [
          ...earningsData.map(item => ({ ...item, type: 'Earning' })),
          ...expensesData.map(item => ({ ...item, type: 'Expense' }))
        ];

        setTransactions(combinedTransactions);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getToken, url]);

  // Sort transactions
  useEffect(() => {
    const sortedTransactions = [...transactions].sort((a, b) => {
      if (sortOption === 'date-desc') {
        return new Date(b.date) - new Date(a.date); // Newest first
      } else {
        return new Date(a.date) - new Date(b.date); // Oldest first
      }
    });
    setFilteredTransactions(sortedTransactions);
  }, [transactions, sortOption]);

  // Format date (e.g., "2025-05-20")
  const formatDate = (dateString) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  // Format amount with Euro symbol
  const formatAmount = (amount, type) => {
    const formatted = `₹${amount.toFixed(2)}`;
    return type === 'Earning' ? `+${formatted}` : `-${formatted}`;
  };

  // Map categories to icons
  const getCategoryIcon = (category, type) => {
    if (type === 'Earning') {
      return <DollarSign className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />;
    }
    switch (category) {
      case 'Food':
        return <Cake className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />;
      case 'Transportation':
        return <Truck className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />;
      case 'Healthcare':
        return <Heart className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />;
      case 'Entertainment':
        return <Film className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />;
      case 'Education':
        return <BookOpen className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />;
      case 'Groceries':
        return <ShoppingCart className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />;
      case 'Insurance':
        return <ShieldCheck className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />;
      case 'Shopping':
        return <ShoppingBag className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />;
      case 'Utilities':
        return <Lightbulb className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />;
      case 'Taxes':
        return <FileText className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />;
      case 'Miscellaneous':
        return <MoreHorizontal className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />;
      default:
        return <MoreHorizontal className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />;
    }
  };

  return (
    <div className={`w-full transition-colors duration-200 ${themeClasses}`}>
      {/* Main Content */}
      {isLoading ? (
        <Loader isDarkMode={isDarkMode} />
      ) : (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header with Sort Option */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
              <h1 className="text-2xl font-semibold mb-4 sm:mb-0 text-[#A3BFFA]">
                All Transactions
              </h1>
              <div>
                <label htmlFor="sort-option" className="block text-sm font-medium mb-1 text-[#A3BFFA]">
                  Sort By
                </label>
                <select
                  id="sort-option"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className={`p-2 rounded-lg border ${inputClasses} focus:outline-none focus:ring-2 transition-all duration-200`}
                >
                  <option value="date-desc">Date (Newest First)</option>
                  <option value="date-asc">Date (Oldest First)</option>
                </select>
              </div>
            </div>

            {/* Transactions Table/Card Container */}
            {error ? (
              <div className="text-center text-[#E53E3E] py-10">{error}</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center text-[#A3BFFA] py-10">
                No transactions found.
              </div>
            ) : (
              <div className={`${cardClasses} rounded-lg shadow-lg overflow-hidden`}>
                {/* Table for Desktop */}
                <div className="hidden md:block">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="py-4 px-6 text-[#A3BFFA] font-medium">Type</th>
                        <th className="py-4 px-6 text-[#A3BFFA] font-medium">Category</th>
                        <th className="py-4 px-6 text-[#A3BFFA] font-medium">Description</th>
                        <th className="py-4 px-6 text-[#A3BFFA] font-medium">Amount</th>
                        <th className="py-4 px-6 text-[#A3BFFA] font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr
                          key={`${transaction.type}-${transaction._id}`}
                          className="border-b border-gray-700 last:border-b-0 hover:bg-[#3A4A4B] transition-colors duration-200"
                        >
                          <td className="py-4 px-6">{transaction.type}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              {getCategoryIcon(transaction.category, transaction.type)}
                              <span className="ml-2">{transaction.category}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">{transaction.description}</td>
                          <td className="py-4 px-6 font-semibold"
                            style={{ color: transaction.type === 'Earning' ? '#10B981' : '#E53E3E' }}
                          >
                            {formatAmount(transaction.amount, transaction.type)}
                          </td>
                          <td className="py-4 px-6">{formatDate(transaction.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Card Layout for Mobile */}
                <div className="block md:hidden">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={`${transaction.type}-${transaction._id}`}
                      className="border-b border-gray-700 last:border-b-0 p-4 transition-all duration-200 hover:bg-[#3A4A4B]"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          {getCategoryIcon(transaction.category, transaction.type)}
                          <span className="ml-2 font-medium">{transaction.category}</span>
                        </div>
                        <span
                          className="font-semibold"
                          style={{ color: transaction.type === 'Earning' ? '#10B981' : '#E53E3E' }}
                        >
                          {formatAmount(transaction.amount, transaction.type)}
                        </span>
                      </div>
                      <p className="text-sm mb-1">
                        <span className="text-[#A3BFFA]">Type:</span> {transaction.type}
                      </p>
                      <p className="text-sm mb-1">
                        <span className="text-[#A3BFFA]">Description:</span> {transaction.description}
                      </p>
                      <p className="text-sm">
                        <span className="text-[#A3BFFA]">Date:</span> {formatDate(transaction.date)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;  
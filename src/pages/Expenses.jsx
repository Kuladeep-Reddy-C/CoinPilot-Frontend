import React, { useState, useEffect } from 'react';
import { 
  Pencil, 
  Trash2, 
  Truck, 
  ShoppingCart, 
  Cake, 
  Heart, 
  Film, 
  BookOpen, 
  ShieldCheck, 
  ShoppingBag, 
  Lightbulb, 
  FileText, 
  MoreHorizontal,
  X 
} from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import Navbar from '../components/NavBar';
import { useTheme } from '../components/Theme';
import Loader from '../components/Loading';
import AlertMessage from '../components/card';

const Expenses = () => {
  const url = import.meta.env.VITE_BACKEND_URL;
  const { isDarkMode } = useTheme();
  const { getToken } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortOption, setSortOption] = useState('date-desc');
  const [showAlert, setShowAlert] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: '',
    category: '',
    paymentMethod: ''
  });
  const [currentExpenseId, setCurrentExpenseId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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

  const buttonClasses = isDarkMode
    ? 'bg-teal-600 hover:bg-teal-500'
    : 'bg-teal-500 hover:bg-teal-400';

  const modalClasses = isDarkMode
    ? 'bg-gray-800 border-gray-700 text-white'
    : 'bg-white border-gray-200 text-gray-800';

  const handleDelete = async (_id) => {
    try {
      const token = await getToken();
      const res = await fetch(`${url}/api/expense/${_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error('Failed to delete expense');
      }

      setExpenses(expenses.filter((expense) => expense._id !== _id));
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleEdit = (expense) => {
    setCurrentExpenseId(expense._id);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      date: new Date(expense.date).toISOString().split('T')[0],
      category: expense.category,
      paymentMethod: expense.paymentMethod
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentExpenseId(null);
    setFormData({
      description: '',
      amount: '',
      date: '',
      category: '',
      paymentMethod: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    setIsEditing(true);
    e.preventDefault();
    try {
      const token = await getToken();
      const payload = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
        category: formData.category,
        paymentMethod: formData.paymentMethod
      };

      const res = await fetch(`${url}/api/expense/${currentExpenseId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to update expense');
      }

      const updatedExpense = await res.json();
      console.log('Updated expense:', updatedExpense);
      setExpenses(expenses.map((exp) => 
        exp._id === currentExpenseId ? updatedExpense : exp
      ));
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      setTimeout(() => setIsEditing(false), 3000);
      closeModal();
    } catch (err) {
      console.error('Error updating expense:', err);
      setIsEditing(false);
    }
    
  };

  // Fetch expenses on mount
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
  }, [getToken, url]);

  // Apply filtering and sorting
  useEffect(() => {
    let updatedExpenses = [...expenses];

    if (filterCategory !== 'All') {
      updatedExpenses = updatedExpenses.filter(
        (expense) => expense.category === filterCategory
      );
    }

    updatedExpenses.sort((a, b) => {
      if (sortOption === 'date-desc') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortOption === 'date-asc') {
        return new Date(a.date) - new Date(b.date);
      } else if (sortOption === 'amount-desc') {
        return b.amount - a.amount;
      } else if (sortOption === 'amount-asc') {
        return a.amount - b.amount;
      } else if (sortOption === 'category-asc') {
        return a.category.localeCompare(b.category);
      } else if (sortOption === 'category-desc') {
        return b.category.localeCompare(a.category);
      }
      return 0;
    });

    setFilteredExpenses(updatedExpenses);
  }, [expenses, filterCategory, sortOption]);

  const formatDate = (dateString) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  const formatAmount = (amount) => `₹${amount.toFixed(2)}`;

  const categories = ['All', ...new Set(expenses.map((expense) => expense.category))];

  const getCategoryIcon = (category) => {
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
    <div className={`flex h-screen w-full transition-colors duration-200 ${themeClasses}`}>
      <Navbar activePage="Expenses" />

      <AlertMessage className={showAlert ? 'show' : ''}>
        {isEditing ? 'Expense updated successfully!' : 'An Expense Transaction has deleted successfully!'}
      </AlertMessage>

      {loading ? (
        <Loader isDarkMode={isDarkMode} />
      ) : (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
              <h1 className="text-2xl font-semibold mb-4 sm:mb-0">All Expenses</h1>
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                <div>
                  <label htmlFor="filter-category" className="block text-sm font-medium mb-1 text-[#A3BFFA]">
                    Filter by Category
                  </label>
                  <select
                    id="filter-category"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className={`p-2 rounded-lg border ${inputClasses} focus:outline-none focus:ring-2 transition-all duration-200`}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
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
                    <option value="amount-desc">Amount (High to Low)</option>
                    <option value="amount-asc">Amount (Low to High)</option>
                    <option value="category-asc">Category (A to Z)</option>
                    <option value="category-desc">Category (Z to A)</option>
                  </select>
                </div>
              </div>
            </div>

            {error ? (
              <div className="text-center text-[#E53E3E] py-10">{error}</div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center text-[#A3BFFA] py-10">
                {filterCategory === 'All' ? 'No expenses found.' : `No expenses found for category: ${filterCategory}`}
              </div>
            ) : (
              <div className={`${cardClasses} rounded-lg shadow-lg overflow-hidden`}>
                <div className="hidden md:block">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="py-4 px-6 text-[#A3BFFA] font-medium">Category</th>
                        <th className="py-4 px-6 text-[#A3BFFA] font-medium">Description</th>
                        <th className="py-4 px-6 text-[#A3BFFA] font-medium">Amount</th>
                        <th className="py-4 px-6 text-[#A3BFFA] font-medium">Payment Method</th>
                        <th className="py-4 px-6 text-[#A3BFFA] font-medium">Date</th>
                        <th className="py-4 px-6 text-[#A3BFFA] font-medium">Edit/Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((expense) => (
                        <tr
                          key={expense._id}
                          className="border-b border-gray-700 last:border-b-0 hover:bg-[#3A4A4B] transition-colors duration-200"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              {getCategoryIcon(expense.category)}
                              <span className="ml-2">{expense.category}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">{expense.description}</td>
                          <td className="py-4 px-6 text-[#E53E3E] font-semibold">
                            {formatAmount(expense.amount)}
                          </td>
                          <td className="py-4 px-6">{expense.paymentMethod}</td>
                          <td className="py-4 px-6">{formatDate(expense.date)}</td>
                          <td className="py-4 px-6">
                            <div className="flex">
                              <button 
                                onClick={() => handleEdit(expense)}
                                className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded mr-2 transition"
                              >
                                <Pencil className="w-5 h-5 mr-1" />
                              </button>
                              <button 
                                onClick={() => handleDelete(expense._id)}
                                className="flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded transition"
                              >
                                <Trash2 className="w-5 h-5 mr-1" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="block md:hidden">
                  {filteredExpenses.map((expense) => (
                    <div
                      key={expense._id}
                      className="border-b border-gray-700 last:border-b-0 p-4 transition-all duration-200 hover:bg-[#3A4A4B]"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          {getCategoryIcon(expense.category)}
                          <span className="ml-2 font-medium">{expense.category}</span>
                        </div>
                        <span className="text-[#E53E3E] font-semibold">
                          {formatAmount(expense.amount)}
                        </span>
                      </div>
                      <p className="text-sm mb-1">
                        <span className="text-[#A3BFFA]">Description:</span> {expense.description}
                      </p>
                      <p className="text-sm mb-1">
                        <span className="text-[#A3BFFA]">Payment Method:</span> {expense.paymentMethod}
                      </p>
                      <p className="text-sm mb-2">
                        <span className="text-[#A3BFFA]">Date:</span> {formatDate(expense.date)}
                      </p>
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEdit(expense)}
                          className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded transition"
                        >
                          <Pencil className="w-5 h-5 mr-1" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(expense._id)}
                          className="flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded transition"
                        >
                          <Trash2 className="w-5 h-5 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className={`relative p-6 rounded-lg border ${modalClasses} max-w-md w-full mx-4 shadow-xl transform transition-all duration-300 scale-100`}>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-[#3182CE]">
              Edit Expense
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full p-2 rounded-lg border ${inputClasses} focus:outline-none focus:ring-2 transition-all duration-200`}
                  placeholder="Enter description"
                  required
                />
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className={`w-full p-2 rounded-lg border ${inputClasses} focus:outline-none focus:ring-2 transition-all duration-200`}
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full p-2 rounded-lg border ${inputClasses} focus:outline-none focus:ring-2 transition-all duration-200`}
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full p-2 rounded-lg border ${inputClasses} focus:outline-none focus:ring-2 transition-all duration-200`}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Food">Food</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Education">Education</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Taxes">Taxes</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium mb-1">
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className={`w-full p-2 rounded-lg border ${inputClasses} focus:outline-none focus:ring-2 transition-all duration-200`}
                  required
                >
                  <option value="">Select a Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Wallet">Wallet (e.g., Paytm, PhonePe)</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'} text-white font-medium transition-all duration-200`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg ${buttonClasses} text-white font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#3182CE] focus:ring-opacity-50 flex items-center gap-2`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="w-5 h-5 animate-spin text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      <span className="tracking-widest animate-pulse">Updating</span>
                    </>
                  ) : (
                    'Update Expense'
                  )}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
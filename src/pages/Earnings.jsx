import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, XIcon } from '@heroicons/react/solid';
import { useAuth } from '@clerk/clerk-react';
import Navbar from '../components/NavBar';
import { useTheme } from '../components/Theme';
import Loader from '../components/Loading';
import AlertMessage from '../components/card';

const Earnings = () => {
  const url = import.meta.env.VITE_BACKEND_URL;
  const { isDarkMode } = useTheme();
  const { getToken } = useAuth();
  const [earnings, setEarnings] = useState([]);
  const [filteredEarnings, setFilteredEarnings] = useState([]);
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
    source: ''
  });
  const [currentEarningId, setCurrentEarningId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Theme classes
  const themeClasses = isDarkMode 
    ? 'bg-gray-900 text-white' 
    : 'bg-gray-100 text-gray-800';
  
  const cardClasses = isDarkMode 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-gray-200';

  const modalClasses = isDarkMode
    ? 'bg-gray-800 text-white border-gray-700'
    : 'bg-white text-gray-800 border-gray-200';

  const inputClasses = isDarkMode
    ? 'bg-gray-700 text-white border-gray-600 focus:ring-teal-500'
    : 'bg-gray-100 text-gray-800 border-gray-300 focus:ring-teal-500';

  const buttonClasses = isDarkMode
    ? 'bg-teal-600 hover:bg-teal-500'
    : 'bg-teal-500 hover:bg-teal-400';

  const handleDelete = async (_id) => {
    try {
      const token = await getToken();
      const res = await fetch(`${url}/api/earning/${_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error('Failed to delete earning');
      }

      setEarnings(earnings.filter((earning) => earning._id !== _id));
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleEdit = (earning) => {
    setCurrentEarningId(earning._id);
    setFormData({
      description: earning.description,
      amount: earning.amount.toString(),
      date: new Date(earning.date).toISOString().split('T')[0],
      category: earning.category,
      source: earning.source
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEarningId(null);
    setFormData({
      description: '',
      amount: '',
      date: '',
      category: '',
      source: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsEditing(true);
    try {
      const token = await getToken();
      const payload = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
        category: formData.category,
        source: formData.source
      };

      const res = await fetch(`${url}/api/earning/${currentEarningId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to update earning');
      }

      const updatedEarning = await res.json();
      console.log('Updated earning:', updatedEarning);
      setEarnings(earnings.map((earn) => 
        earn._id === currentEarningId ? updatedEarning : earn
      ));
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      setTimeout(() => setIsEditing(false), 4000);
      closeModal();
    } catch (err) {
      console.error('Error updating earning:', err);
    }
    setLoading(false);
    
  };

  // Fetch earnings on mount
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
  }, [getToken, url]);

  // Apply filtering and sorting
  useEffect(() => {
    let updatedEarnings = [...earnings];

    if (filterCategory !== 'All') {
      updatedEarnings = updatedEarnings.filter(
        (earning) => earning.category === filterCategory
      );
    }

    updatedEarnings.sort((a, b) => {
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

    setFilteredEarnings(updatedEarnings);
  }, [earnings, filterCategory, sortOption]);

  const formatDate = (dateString) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  const formatAmount = (amount) => `€${amount.toFixed(2)}`;

  const categories = ['All', ...new Set(earnings.map((earning) => earning.category))];

  return (
    <div className={`flex h-screen w-full transition-colors duration-200 ${themeClasses}`}>
      <Navbar activePage="Earnings" />

      <AlertMessage className={showAlert ? 'show' : ''}>
        {isEditing ? 'Earning updated successfully!' : 'An Earning Transaction has deleted successfully!'}
      </AlertMessage>

      {loading ? (
        <Loader isDarkMode={isDarkMode} />
      ) : (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
              <h1 className="text-2xl font-semibold mb-4 sm:mb-0">All Earnings</h1>
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
            ) : filteredEarnings.length === 0 ? (
              <div className="text-center text-[#A3BFFA] py-10">
                {filterCategory === 'All' ? 'No earnings found.' : `No earnings found for category: ${filterCategory}`}
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
                        <th className="py-4 px-6 text-[#A3BFFA] font-medium">Source</th>
                        <th className="py-4 px-6 text-[#A3BFFA] font-medium">Date</th>
                        <th className="py-4 px-6 text-[#A3BFFA] font-medium">Edit/Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEarnings.map((earning) => (
                        <tr
                          key={earning._id}
                          className="border-b border-gray-700 last:border-b-0 hover:bg-[#3A4A4B] transition-colors duration-200"
                        >
                          <td className="py-4 px-6">
                            <span
                              className={`inline-block w-6 h-6 rounded-full mr-2 align-middle ${
                                earning.category === 'Client Payment' ? 'bg-blue-600' :
                                earning.category === 'Project Completion' ? 'bg-purple-600' :
                                earning.category === 'Freelance Work' ? 'bg-green-600' :
                                earning.category === 'Royalty Income' ? 'bg-red-600' : 'bg-gray-600'
                              }`}
                            ></span>
                            <span>{earning.category}</span>
                          </td>
                          <td className="py-4 px-6">{earning.description}</td>
                          <td className="py-4 px-6 text-[#38A169] font-semibold">
                            {formatAmount(earning.amount)}
                          </td>
                          <td className="py-4 px-6">{earning.source}</td>
                          <td className="py-4 px-6">{formatDate(earning.date)}</td>
                          <td className="py-4 px-6">
                            <div className="flex">
                              <button 
                                onClick={() => handleEdit(earning)}
                                className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded mr-2 transition"
                              >
                                <PencilIcon className="w-5 h-5 mr-1" />
                              </button>
                              <button 
                                onClick={() => handleDelete(earning._id)}
                                className="flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded transition"
                              >
                                <TrashIcon className="w-5 h-5 mr-1" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="block md:hidden">
                  {filteredEarnings.map((earning) => (
                    <div
                      key={earning._id}
                      className="border-b border-gray-700 last:border-b-0 p-4 transition-all duration-200 hover:bg-[#3A4A4B]"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <span
                            className={`inline-block w-6 h-6 rounded-full mr-2 ${
                              earning.category === 'Client Payment' ? 'bg-blue-600' :
                              earning.category === 'Project Completion' ? 'bg-purple-600' :
                              earning.category === 'Freelance Work' ? 'bg-green-600' :
                              earning.category === 'Royalty Income' ? 'bg-red-600' : 'bg-gray-600'
                            }`}
                          ></span>
                          <span className="font-medium">{earning.category}</span>
                        </div>
                        <span className="text-[#38A169] font-semibold">
                          {formatAmount(earning.amount)}
                        </span>
                      </div>
                      <p className="text-sm mb-1">
                        <span className="text-[#A3BFFA]">Description:</span> {earning.description}
                      </p>
                      <p className="text-sm mb-1">
                        <span className="text-[#A3BFFA]">Source:</span> {earning.source}
                      </p>
                      <p className="text-sm mb-2">
                        <span className="text-[#A3BFFA]">Date:</span> {formatDate(earning.date)}
                      </p>
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEdit(earning)}
                          className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded transition"
                        >
                          <PencilIcon className="w-5 h-5 mr-1" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(earning._id)}
                          className="flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded transition"
                        >
                          <TrashIcon className="w-5 h-5 mr-1" />
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
              <XIcon className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-[#3182CE]">
              Edit Earning
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
                  Amount (€)
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
                  <option value="Client Payment">Client Payment</option>
                  <option value="Project Completion">Project Completion</option>
                  <option value="Freelance Work">Freelance Work</option>
                  <option value="Royalty Income">Royalty Income</option>
                  <option value="Salary">Salary</option>
                  <option value="Business">Business</option>
                  <option value="Freelancing">Freelancing</option>
                  <option value="Investments">Investments</option>
                  <option value="Interest Income">Interest Income</option>
                  <option value="Rental Income">Rental Income</option>
                  <option value="Royalties">Royalties</option>
                  <option value="Gifts">Gifts</option>
                  <option value="Refunds">Refunds</option>
                  <option value="Selling Items">Selling Items</option>
                  <option value="Bonus">Bonus</option>
                  <option value="Commission">Commission</option>
                  <option value="Dividends">Dividends</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="source" className="block text-sm font-medium mb-1">
                  Source
                </label>
                <input
                  type="text"
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className={`w-full p-2 rounded-lg border ${inputClasses} focus:outline-none focus:ring-2 transition-all duration-200`}
                  placeholder="Enter earning source"
                  required
                />
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
                    'Update Earning'
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

export default Earnings;
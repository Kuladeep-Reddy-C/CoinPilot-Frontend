import React, { useState } from 'react';
import { Plus, Download, X } from 'lucide-react';
import { useTheme } from '../components/Theme';
import Navbar from '../components/NavBar';
import { useAuth } from '@clerk/clerk-react';
import RecentEarnings from '../components/RecentEarnings';
import RecentExpenses from '../components/RecentExpense';
import ChartsComponentBar from '../components/ChartsComponent';
import DownloadPDFButton from '../components/DownlaodPDFButton';

export default function ExpenseTracker() {
  const url = import.meta.env.VITE_BACKEND_URL;
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();
  const { isDarkMode } = useTheme();

  // State for modal visibility and type (expense or earning)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'expense' or 'earning'
  const [refreshFlag, setRefreshFlag] = useState(false); // Initialize as boolean false

  // State for form data
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: '',
    category: '',
    source: '', // For earnings
  });

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

  // Handle opening the modal
  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setFormData({
      description: '',
      amount: '',
      date: '',
      category: '',
      source: '',
    });
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'expense') {
        await postExpense(formData);
      } else {
        await postEarning(formData);
      }
      closeModal();
      // Toggle refreshFlag to trigger re-fetch in RecentEarnings
      setRefreshFlag((prev) => !prev);
    } catch (error) {
      console.error("Submission error:", error);
      alert(`Failed to add ${modalType}: ${error.message}`);
    }
  };

  const postEarning = async (formData) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No token found");

      const requiredFields = ['description', 'amount', 'category', 'date', 'source'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Ensure date is in ISO format
      const earningData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
      };
      console.log("Sending formData:", earningData);

      const response = await fetch(`${url}/api/earning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(earningData),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Error response:", data);
        throw new Error(data.message || 'Failed to post earning');
      }

      console.log('Saved earning:', data);
      return data;
    } catch (error) {
      console.error("postEarning error:", error);
      throw error;
    }
  };

  const postExpense = async (formData) => {
    try {
      setIsLoading(true);
      const token = await getToken();
      if (!token) throw new Error("No token found");

      const requiredFields = ['description', 'amount', 'category', 'date', 'paymentMethod'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Ensure date is in ISO format
      const expenseData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
      };
      delete expenseData.source;
      console.log("Sending formData:", expenseData);

      const response = await fetch(`${url}/api/expense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(expenseData),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Error response:", data);
        throw new Error(data.message || 'Failed to post expense');
      }

      console.log('Saved expense:', data);
      setIsLoading(false);
      return data;
      
    } catch (error) {
      console.error("postExpense error:", error);
      setIsLoading(false);
      throw error;
    }
  };

  return (
    <div className={`flex h-screen w-full transition-colors duration-200 ${themeClasses}`}>
      {/* Sidebar */}
      <Navbar activePage="Home" />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Recent Expenses */}
          <RecentExpenses refreshFlag={refreshFlag} />

          {/* Recent Earnings */}
          <RecentEarnings refreshFlag={refreshFlag} />

        </div>

        {/* Quick Access */}
        <div className={`mt-6 p-4 rounded-lg border ${cardClasses}`}>
          <h2 className="text-lg font-medium mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => openModal('expense')}
              className={`flex items-center justify-center p-3 rounded-md ${isDarkMode ? 'bg-pink-900 hover:bg-pink-800' : 'bg-pink-100 hover:bg-pink-200'} transition-colors`}
            >
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white mr-2">
                <Plus className="w-5 h-5" />
              </div>
              <span className={`${isDarkMode ? 'text-pink-300' : 'text-pink-800'}`}>Add Expense</span>
            </button>

            <button
              onClick={() => openModal('earning')}
              className={`flex items-center justify-center p-3 rounded-md ${isDarkMode ? 'bg-green-900 hover:bg-green-800' : 'bg-green-100 hover:bg-green-200'} transition-colors`}
            >
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white mr-2">
                <Plus className="w-5 h-5" />
              </div>
              <span className={`${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>Add earnings</span>
            </button>

            <DownloadPDFButton isDarkMode={isDarkMode} />
          </div>
        </div>

        {/* Monthly Report */}
        <ChartsComponentBar refreshFlag={refreshFlag} />
        {/* <PieChartsComponent /> */}
      </div>

      {/* Modal for Adding Expense/Earning */}
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
              Add {modalType === 'expense' ? 'Expense' : 'Earning'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Description */}
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

              {/* Amount */}
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

              {/* Date */}
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

              {/* Category */}
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
                  {modalType === 'expense' ? (
                    <>
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
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </select>
              </div>

            {/* Payment Method */}
                {modalType === 'expense' && (
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
                   (
                    <>
                        <option value="Cash">Cash</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                        <option value="UPI">UPI</option>
                        <option value="Net Banking">Net Banking</option>
                        <option value="Wallet">Wallet (e.g., Paytm, PhonePe)</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                    </>
                  ) 
                </select>
              </div>
                )}


              {/* Earning-specific field */}
              {modalType === 'earning' && (
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
              )}

              {/* Submit and Cancel Buttons */}
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
                  disabled={isLoading}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${buttonClasses} text-white font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#3182CE] focus:ring-opacity-50 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {!isLoading ? (
                    `Add ${modalType === 'expense' ? 'Expense' : 'Earning'}`
                  ) : (
                    <>
                      <span className="loader w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                      Adding...
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
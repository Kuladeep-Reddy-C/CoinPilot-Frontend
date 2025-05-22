import React from 'react';
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Download, X } from 'lucide-react';

function DownloadPDFButton({ isDarkMode }) {
  const url_ = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  const { getToken } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const modalClasses = isDarkMode
    ? 'bg-gray-800 text-white border-gray-700'
    : 'bg-white text-gray-800 border-gray-200';

  const buttonClasses = isDarkMode
    ? 'bg-teal-600 hover:bg-teal-500'
    : 'bg-teal-500 hover:bg-teal-400';

  const handlePdfDownload = async (reportType) => {
    console.log("1check");
    console.log("checked");
    console.log("Report Type:", reportType);

    try {
      const token = await getToken();
      console.log("Token:", token);
      const response = await fetch(`${url_}/pdf/${reportType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download PDF');
      setIsModalOpen(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const reportOptions = [
    { value: 'earnings', label: 'Earnings' },
    { value: 'expenses', label: 'Expenses' },
    { value: 'all', label: 'All Transactions' },
  ];

  return (
    <div className="relative">
      <button
        onClick={openModal}
        className={`flex items-center justify-center px-6 py-3 rounded-md w-full ${
          isDarkMode ? 'bg-blue-900 hover:bg-blue-800' : 'bg-blue-100 hover:bg-blue-200'
        } transition-colors`}
      >
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
          <Download className="w-5 h-5" />
        </div>
        <span className={`${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
          Download Transactions
        </span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
          <div
            className={`relative p-6 rounded-lg border ${modalClasses} max-w-md w-full mx-4 shadow-xl transform transition-all duration-300 scale-100`}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-[#3182CE]">
              Select Report Type
            </h2>
            <div className="space-y-4">
              {reportOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePdfDownload(option.value)}
                  className={`w-full p-2 rounded-lg text-left ${buttonClasses} text-white font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#3182CE] focus:ring-opacity-50`}
                >
                  {option.label}
                </button>
              ))}
              <button
                type="button"
                onClick={closeModal}
                className={`w-full p-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'
                } text-white font-medium transition-all duration-200`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DownloadPDFButton;
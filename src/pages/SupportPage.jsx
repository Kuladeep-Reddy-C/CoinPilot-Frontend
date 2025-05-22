import React, { useState } from 'react';
import Navbar from '../components/NavBar';
import { useTheme } from '../components/Theme';
import { useUser, useAuth } from '@clerk/clerk-react';
import Loader from '../components/Loading';

const SupportPage = () => {
  const { isDarkMode } = useTheme();
  const {user} = useUser();
  const { getToken } = useAuth();
  const url = import.meta.env.VITE_BACKEND_URL;
  const [isLoading, setIsLoading] = useState(false);
      


  // Form state
  const [formData, setFormData] = useState({
    name: user.fullName,
    email: user.emailAddresses,
    subject: '',
    message: '',
  });

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
    try {
          setIsLoading(true);
          e.preventDefault();
          console.log('Support Request Submitted:', formData);

          const token = await getToken();
          const response = await fetch(`${url}/sendMail/support`, {
            method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              },
            body: JSON.stringify(formData)
          })

          const data = await response.json();
          if (!response.ok){
            console.log("Error");
          }
          console.log(data);
          setIsLoading(false);

          // Reset the form
          setFormData({
            name: user.fullName,
            email: user.emailAddresses,
            subject: '',
            message: '',
          });
          alert("Your Mail Has Reached Us \nWe shall respond in the least time Possible")
    } catch (error) {
        setIsLoading(false);
        alert("Internal Server Error")
    }
  };

  return (
    <div className={`flex h-screen w-full transition-colors duration-200 ${themeClasses}`}>
      {/* Sidebar via Navbar Component */}
      <Navbar activePage="Support" />

      {/* Main Content */}


      <div className="flex-1 overflow-auto p-6">
        <div className={`p-6 rounded-lg border ${cardClasses} max-w-2xl mx-auto`}>
          <h2 className="text-2xl font-semibold mb-6 text-teal-500">Support Request</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border ${inputClasses} focus:outline-none focus:ring-2 transition-all duration-200`}
                placeholder="Enter your name"
                required
                readOnly
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border ${inputClasses} focus:outline-none focus:ring-2 transition-all duration-200`}
                placeholder="Enter your email"
                required
                readOnly
              />
            </div>

            {/* Subject Field */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border ${inputClasses} focus:outline-none focus:ring-2 transition-all duration-200`}
                placeholder="Enter the subject"
                required
              />
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className={`w-full p-3 rounded-lg border ${inputClasses} focus:outline-none focus:ring-2 transition-all duration-200 resize-none`}
                placeholder="Describe your issue or question"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg ${buttonClasses} text-white font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 ${
                  isLoading ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
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
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
      
    </div>
  );
};

export default SupportPage;
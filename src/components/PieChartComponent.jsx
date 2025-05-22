import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTheme } from './Theme'; // Assuming you have a Theme context for dark/light mode
import { useAuth } from '@clerk/clerk-react';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartsComponent = () => {
    const url = import.meta.env.VITE_BACKEND_URL;
    const { getToken } = useAuth();
    const { isDarkMode } = useTheme();
    const [earnings, setEarnings] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expenseView, setExpenseView] = useState('category'); // Toggle between 'category' and 'payment'
    
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

    // Aggregate expenses by category
    const expenseCategories = [
        'Food', 'Transportation', 'Healthcare', 'Entertainment', 'Education',
        'Groceries', 'Insurance', 'Shopping', 'Utilities', 'Taxes', 'Miscellaneous'
    ];
    const expenseByCategory = expenseCategories.map(category => {
        return expenses
        .filter(exp => exp.category === category)
        .reduce((sum, exp) => sum + exp.amount, 0);
    });

    // Aggregate expenses by payment method
    const paymentMethods = [
        'Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking',
        'Wallet', 'Bank Transfer', 'Cheque'
    ];
    const expenseByPaymentMethod = paymentMethods.map(method => {
        return expenses
        .filter(exp => exp.paymentMethod === method)
        .reduce((sum, exp) => sum + exp.amount, 0);
    });

    // Aggregate earnings by category
    const earningCategories = [
        'Client Payment', 'Project Completion', 'Freelance Work', 'Royalty Income',
        'Salary', 'Business', 'Freelancing', 'Investments', 'Interest Income',
        'Rental Income', 'Royalties', 'Gifts', 'Refunds', 'Selling Items',
        'Bonus', 'Commission', 'Dividends', 'Other'
    ];
    const earningByCategory = earningCategories.map(category => {
        return earnings
        .filter(earn => earn.category === category)
        .reduce((sum, earn) => sum + earn.amount, 0);
    });

    // Enhanced color palette with better aesthetics
    const colors = [
        '#3366CC', '#DC3912', '#FF9900', '#109618', '#990099',
        '#0099C6', '#DD4477', '#66AA00', '#B82E2E', '#316395',
        '#994499', '#22AA99', '#AAAA11', '#6633CC', '#E67300',
        '#8B0707', '#329262', '#5574A6', '#3B3EAC'
    ];

    // Pie chart data with improved alpha for better visual contrast
    const expenseCategoryData = {
        labels: expenseCategories.filter((_, i) => expenseByCategory[i] > 0),
        datasets: [{
            data: expenseByCategory.filter(amount => amount > 0),
            backgroundColor: colors.slice(0, expenseCategories.length).map(color => `${color}E6`), // 90% opacity
            borderColor: isDarkMode ? '#2D3748' : '#FFFFFF',
            borderWidth: 2,
            hoverBackgroundColor: colors.slice(0, expenseCategories.length),
            hoverBorderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
            hoverBorderWidth: 3,
        }],
    };

    const expensePaymentData = {
        labels: paymentMethods.filter((_, i) => expenseByPaymentMethod[i] > 0),
        datasets: [{
            data: expenseByPaymentMethod.filter(amount => amount > 0),
            backgroundColor: colors.slice(0, paymentMethods.length).map(color => `${color}E6`),
            borderColor: isDarkMode ? '#2D3748' : '#FFFFFF',
            borderWidth: 2,
            hoverBackgroundColor: colors.slice(0, paymentMethods.length),
            hoverBorderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
            hoverBorderWidth: 3,
        }],
    };

    const earningCategoryData = {
        labels: earningCategories.filter((_, i) => earningByCategory[i] > 0),
        datasets: [{
            data: earningByCategory.filter(amount => amount > 0),
            backgroundColor: colors.slice(0, earningCategories.length).map(color => `${color}E6`),
            borderColor: isDarkMode ? '#2D3748' : '#FFFFFF',
            borderWidth: 2,
            hoverBackgroundColor: colors.slice(0, earningCategories.length),
            hoverBorderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
            hoverBorderWidth: 3,
        }],
    };

    // Enhanced chart options
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: isDarkMode ? '#E2E8F0' : '#2D3748',
                    font: { 
                        size: 12,
                        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
                        weight: 500
                    },
                    padding: 16,
                    usePointStyle: true,
                    pointStyle: 'circle'
                },
                title: {
                    display: true,
                    text: 'Categories',
                    color: isDarkMode ? '#E2E8F0' : '#1A202C',
                    font: {
                        weight: 'bold'
                    }
                }
            },
            tooltip: {
                backgroundColor: isDarkMode ? 'rgba(45, 55, 72, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                titleColor: isDarkMode ? '#E2E8F0' : '#1A202C',
                bodyColor: isDarkMode ? '#E2E8F0' : '#2D3748',
                bodyFont: {
                    size: 14
                },
                titleFont: {
                    size: 16,
                    weight: 'bold'
                },
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                boxPadding: 6,
                callbacks: {
                    label: function(context) {
                        const value = context.raw;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${context.label}: $${value} (${percentage}%)`;
                    }
                }
            },
            datalabels: {
                display: false
            }
        },
        cutout: '40%',
        animation: {
            animateScale: true,
            animateRotate: true,
            duration: 1000,
            easing: 'easeOutQuart'
        }
    };

    return (
        <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
            <h2 className="text-2xl font-bold mb-8 text-center">Financial Overview</h2>
            
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500"></div>
                </div>
            ) : error ? (
                <div className="text-red-500 text-center p-4 rounded bg-red-100">{error}</div>
            ) : (
                <>
                    {/* Summary Section */}
                    <div className="m-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-4 rounded-md text-center ${isDarkMode ? 'bg-gray-700' : 'bg-teal-50'}`}>
                            <h4 className="text-lg font-medium">Total Expenses</h4>
                            <p className="text-2xl font-bold text-red-500">
                                ${expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
                            </p>
                        </div>
                        <div className={`p-4 rounded-md text-center ${isDarkMode ? 'bg-gray-700' : 'bg-teal-50'}`}>
                            <h4 className="text-lg font-medium">Total Earnings</h4>
                            <p className="text-2xl font-bold text-green-500">
                                ${earnings.reduce((sum, earn) => sum + earn.amount, 0).toLocaleString()}
                            </p>
                        </div>
                        <div className={`p-4 rounded-md text-center ${isDarkMode ? 'bg-gray-700' : 'bg-teal-50'}`}>
                            <h4 className="text-lg font-medium">Net Balance</h4>
                            <p className={`text-2xl font-bold ${
                                earnings.reduce((sum, earn) => sum + earn.amount, 0) - 
                                expenses.reduce((sum, exp) => sum + exp.amount, 0) >= 0 
                                    ? 'text-green-500' : 'text-red-500'
                            }`}>
                                ${(
                                    earnings.reduce((sum, earn) => sum + earn.amount, 0) - 
                                    expenses.reduce((sum, exp) => sum + exp.amount, 0)
                                ).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Expenses Section */}
                    <div className="mb-12 border rounded-lg p-6 shadow-sm bg-opacity-50 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-30">
                        <h3 className="text-xl font-semibold mb-6 text-center">
                            Expense Distribution
                        </h3>
                        
                        <div className="flex justify-center mb-6">
                            <button
                                onClick={() => setExpenseView('category')}
                                className={`px-4 py-2 mr-2 rounded-md transition-all duration-300 ${
                                expenseView === 'category'
                                    ? 'bg-teal-500 text-white shadow-md transform scale-105'
                                    : isDarkMode
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                By Category
                            </button>
                            <button
                                onClick={() => setExpenseView('payment')}
                                className={`px-4 py-2 rounded-md transition-all duration-300 ${
                                expenseView === 'payment'
                                    ? 'bg-teal-500 text-white shadow-md transform scale-105'
                                    : isDarkMode
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                By Payment Method
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row justify-center items-center">
                            <div className="w-full md:w-2/3 h-80">
                                <Pie
                                    data={expenseView === 'category' ? expenseCategoryData : expensePaymentData}
                                    options={options}
                                />
                            </div>
                            <div className="w-full md:w-1/3 mt-4 md:mt-0">
                                <h4 className="font-medium text-center mb-2">
                                    {expenseView === 'category' ? 'Top Categories' : 'Top Payment Methods'}
                                </h4>
                                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    {expenseView === 'category' ? 
                                        expenseCategories
                                            .map((cat, i) => ({ name: cat, amount: expenseByCategory[i] }))
                                            .filter(item => item.amount > 0)
                                            .sort((a, b) => b.amount - a.amount)
                                            .slice(0, 5)
                                            .map((item, i) => (
                                                <div key={i} className="flex justify-between items-center mb-1">
                                                    <span className="text-sm">{item.name}</span>
                                                    <span className="font-semibold">${item.amount}</span>
                                                </div>
                                            ))
                                        :
                                        paymentMethods
                                            .map((method, i) => ({ name: method, amount: expenseByPaymentMethod[i] }))
                                            .filter(item => item.amount > 0)
                                            .sort((a, b) => b.amount - a.amount)
                                            .slice(0, 5)
                                            .map((item, i) => (
                                                <div key={i} className="flex justify-between items-center mb-1">
                                                    <span className="text-sm">{item.name}</span>
                                                    <span className="font-semibold">${item.amount}</span>
                                                </div>
                                            ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Earnings Section */}
                    <div className="mb-12 border rounded-lg p-6 shadow-sm bg-opacity-50 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-30">
                        <h3 className="text-xl font-semibold mb-6 text-center">Earnings by Category</h3>
                        
                        <div className="flex flex-col md:flex-row justify-center items-center">
                            <div className="w-full md:w-2/3 h-80">
                                <Pie data={earningCategoryData} options={options} />
                            </div>
                            <div className="w-full md:w-1/3 mt-4 md:mt-0">
                                <h4 className="font-medium text-center mb-2">Top Income Sources</h4>
                                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    {earningCategories
                                        .map((cat, i) => ({ name: cat, amount: earningByCategory[i] }))
                                        .filter(item => item.amount > 0)
                                        .sort((a, b) => b.amount - a.amount)
                                        .slice(0, 5)
                                        .map((item, i) => (
                                            <div key={i} className="flex justify-between items-center mb-1">
                                                <span className="text-sm">{item.name}</span>
                                                <span className="font-semibold">${item.amount}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>


                </>
            )}
        </div>
    );
};

export default PieChartsComponent;
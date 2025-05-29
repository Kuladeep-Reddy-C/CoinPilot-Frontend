# 💸 CoinPilot – Finance Tracker App (Frontend)

🌐 **Live Demo**: [https://coinpilot-frontend.onrender.com](https://coinpilot-frontend.onrender.com)

Welcome to **CoinPilot** – your personal finance tracker app, designed to help you stay in control of your earnings and expenses! This is the **frontend repository** for the application, built with modern web technologies and packed with features to visualize and manage your finances with ease. 📊📱

---

## 🚀 Features Overview

CoinPilot consists of **6 main pages** and a responsive design that adapts smoothly across screen sizes. Here's a breakdown:

### 🏠 1. Home
- Displays **4 recent earnings** and **4 recent expenses**.
- **Quick Access** panel to:
  - ➕ Add Expense
  - ➕ Add Earning
  - 📥 Download Transactions (earnings, expenses, or all).
- Two **Bar Charts** powered by Chart.js:
  - Monthly earnings vs expenses.
  - Weekly earnings vs expenses.

### 👁️ 2. Glance
- Overview of:
  - 💰 Lifetime Earnings
  - 💸 Lifetime Expenses
  - 🧾 Net Balance
- Two **Donut Charts**:
  - Expense Distribution:
    - By Payment Method
    - By Category
  - Earning Distribution by Category
- Full **transaction history** with sorting (Newest → Oldest, or vice versa).

### 💳 3. Expenses
- Displays **all lifetime expenses**.
- Sort options:
  - 🗓️ Date (Newest First / Oldest First)
  - 💵 Amount (Low to High / High to Low)
  - 🏷️ Category (A → Z / Z → A)
- **Filter by Category**
- **Edit/Delete options** with responsive toast notifications on update/delete.

### 💰 4. Earnings
- Displays **earnings** instead.
- All sorting, filtering, and edit/delete features are also available here.

### ⚙️ 5. Settings
- Powered by [Clerk](https://clerk.com) authentication.
- Displays the `<UserProfile>` component provided by Clerk for account management.

### 🛠️ 6. Support
- Users can send support requests via a form with:
  - Locked fields for Name & Email (auto-filled).
  - Fields for Subject and Description.
- Integrated with **Nodemailer** to send support emails directly.

### 🔓 7. Logout
- Logs out the current user securely using Clerk's auth methods.

---

## 🧭 Navigation

- Responsive **Navbar**:
  - On **larger screens**, it's a sidebar.
  - On **smaller screens**, it becomes a dropdown header menu.
  
---

## ⚡ Intelligent Transaction Downloads

When downloading transaction data:
- Users can choose to download:
  - Only Earnings
  - Only Expenses
  - All Transactions
- Uses **streaming approach** to push data directly to the client without buffering or storing on the server.
- Ensures **fast, efficient downloads**. 🚀

---

## 🛠️ Tech Stack

- **React**
- **Chart.js**
- **Clerk** (Authentication)
- **Nodemailer** (Support form email handling)
- **Responsive Design** (Sidebar ↔ Header based on screen size)
- **Theme Provider** ( Togggle between dark mode and light mode seamlessly)

---

## 📂 Folder Structure (Simplified)
/src
┣ /components
┣ /pages
┗ App.jsx


---

## 📧 Support

Have questions or feedback? Use the **Support** page inside the app to send a message directly via email!

---

## ✅ Future Plans (Coming Soon)
- Monthly Reports 📆
- Budgeting Tools 💼

---

## 🙌 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

Made with 💙 by Kuladeep Reddy C

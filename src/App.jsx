import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/home'
import Auth from './pages/Auth/Auth'
import ProtectedRoute from './pages/Auth/ProtectedRoute'
import SettingsPage from './pages/SettingsPage'
import SupportPage from './pages/SupportPage'
import Earnings from './pages/Earnings'
import Expenses from './pages/Expenses'
import GlancePage from './pages/Glance'

function App() {
  

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Auth />}></Route>

          {/* 🔒 Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/earnings" element={<Earnings />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/glance" element={<GlancePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

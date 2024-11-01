import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import OrderManagement from './pages/OrderManagement';
import CustomerSupport from './pages/CustomerSupport';
import LiveChat from './pages/LiveChat';

const CallCenterApp = () => {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/support" element={<CustomerSupport />} />
            <Route path="/chat" element={<LiveChat />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import DeliveryMap from './pages/DeliveryMap';
import OrderList from './pages/OrderList';
import Profile from './pages/Profile';
import Earnings from './pages/Earnings';

const DriverApp = () => {
  return (
    <BrowserRouter>
      <div className="h-screen bg-gray-50">
        <main className="pb-16">
          <Routes>
            <Route path="/" element={<DeliveryMap />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/earnings" element={<Earnings />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
};
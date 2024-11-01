import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const SmartOrderTracking = ({ orderId }) => {
  const [order, setOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const ws = new WebSocket(`ws://localhost:3000/tracking/${orderId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ORDER_UPDATE') {
        setOrder(data.order);
      } else if (data.type === 'DRIVER_LOCATION') {
        setDriverLocation(data.location);
        setEstimatedTime(data.estimatedTime);
      }
    };

    return () => ws.close();
  }, [orderId]);

  const getStatusStep = () => {
    const steps = ['confirmed', 'preparing', 'ready', 'delivering', 'delivered'];
    return steps.indexOf(order?.status) + 1;
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Order Progress */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Order Status</h2>
        <div className="relative">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -translate-y-1/2" />
          <div 
            className="absolute left-0 top-1/2 h-1 bg-blue-500 -translate-y-1/2 transition-all duration-500"
            style={{ width: `${(getStatusStep() / 5) * 100}%` }}
          />
          <div className="relative flex justify-between">
            {['Confirmed', 'Preparing', 'Ready', 'Delivering', 'Delivered'].map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: index < getStatusStep() ? 1.2 : 1,
                    backgroundColor: index < getStatusStep() ? '#3B82F6' : '#E5E7EB'
                  }}
                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-white mb-2"
                >
                  {index < getStatusStep() && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </motion.div>
                <span className="text-sm text-gray-600">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Map */}
      {driverLocation && (
        <div className="h-64 rounded-lg overflow-hidden mb-8">
          <MapContainer
            center={[driverLocation.lat, driverLocation.lng]}
            zoom={13}
            className="h-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[driverLocation.lat, driverLocation.lng]}>
              <Popup>
                Your delivery driver is here
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      {/* Estimated Time */}
      {estimatedTime && (
        <div className="text-center">
          <p className="text-lg">Estimated delivery time:</p>
          <p className="text-3xl font-bold text-blue-500">{estimatedTime} minutes</p>
        </div>
      )}
    </div>
  );
};
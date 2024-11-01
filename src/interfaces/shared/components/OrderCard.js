import React from 'react';
import { formatDistance } from 'date-fns';

const OrderCard = ({ order, onStatusChange, children }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      preparing: 'bg-blue-500',
      ready: 'bg-green-500',
      delivered: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold">Order #{order.id}</h3>
          <p className="text-sm text-gray-600">
            {formatDistance(new Date(order.createdAt), new Date(), { addSuffix: true })}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-white text-sm ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span>{item.quantity}x {item.name}</span>
            <span className="text-gray-600">${item.price}</span>
          </div>
        ))}
      </div>

      {children}

      <div className="flex justify-between items-center mt-4">
        <span className="font-bold">Total: ${order.totalAmount}</span>
        <div className="space-x-2">
          {onStatusChange && (
            <button
              onClick={() => onStatusChange(order.id, 'next')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Next Status
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { useOrderQueue } from './hooks/useOrderQueue';
import OrderCard from './components/OrderCard';
import OrderDetails from './components/OrderDetails';
import Timer from './components/Timer';

const KitchenDisplayApp = () => {
  const { orders, updateOrderStatus } = useOrderQueue();

  return (
    <div className="grid grid-cols-3 gap-4 h-screen bg-gray-900 p-4">
      {/* Pending Orders */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-white text-xl font-bold mb-4">Pending</h2>
        <div className="space-y-4">
          {orders.pending.map(order => (
            <OrderCard 
              key={order.id}
              order={order}
              onStatusChange={updateOrderStatus}
            />
          ))}
        </div>
      </div>

      {/* In Progress Orders */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-white text-xl font-bold mb-4">In Progress</h2>
        <div className="space-y-4">
          {orders.inProgress.map(order => (
            <OrderCard 
              key={order.id}
              order={order}
              onStatusChange={updateOrderStatus}
            >
              <Timer startTime={order.startTime} />
            </OrderCard>
          ))}
        </div>
      </div>

      {/* Completed Orders */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-white text-xl font-bold mb-4">Ready</h2>
        <div className="space-y-4">
          {orders.completed.map(order => (
            <OrderCard 
              key={order.id}
              order={order}
              onStatusChange={updateOrderStatus}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsDashboard = ({ data }) => {
  const revenueData = {
    labels: data.revenue.map(d => d.date),
    datasets: [{
      label: 'Daily Revenue',
      data: data.revenue.map(d => d.amount),
      borderColor: 'rgb(59, 130, 246)',
      tension: 0.1
    }]
  };

  const orderData = {
    labels: data.orders.map(d => d.status),
    datasets: [{
      label: 'Orders by Status',
      data: data.orders.map(d => d.count),
      backgroundColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)'
      ]
    }]
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
        <Line data={revenueData} options={{ maintainAspectRatio: false }} />
      </div>

      {/* Orders Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Order Distribution</h3>
        <Bar data={orderData} options={{ maintainAspectRatio: false }} />
      </div>

      {/* Key Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-gray-600">Total Orders</p>
            <p className="text-3xl font-bold text-blue-500">{data.totalOrders}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Average Order Value</p>
            <p className="text-3xl font-bold text-green-500">
              ${data.averageOrderValue}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Active Drivers</p>
            <p className="text-3xl font-bold text-yellow-500">
              {data.activeDrivers}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Customer Satisfaction</p>
            <p className="text-3xl font-bold text-purple-500">
              {data.customerSatisfaction}%
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {data.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${activity.type === 'order' ? 'bg-blue-500' : 'bg-green-500'}`} />
              <div>
                <p className="text-sm text-gray-600">{activity.timestamp}</p>
                <p className="font-medium">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
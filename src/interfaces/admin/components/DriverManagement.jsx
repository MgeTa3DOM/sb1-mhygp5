import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DriverManagement = ({ drivers, onAssignOrder, onUpdateStatus }) => {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredDrivers = drivers.filter(driver => 
    filterStatus === 'all' || driver.status === filterStatus
  );

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-500',
      delivering: 'bg-blue-500',
      offline: 'bg-gray-500',
      break: 'bg-yellow-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="flex h-full">
      {/* Drivers List */}
      <div className="w-1/3 bg-gray-50 p-4 border-r overflow-auto">
        <div className="mb-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Drivers</option>
            <option value="available">Available</option>
            <option value="delivering">Delivering</option>
            <option value="offline">Offline</option>
            <option value="break">On Break</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredDrivers.map(driver => (
            <div
              key={driver.id}
              onClick={() => setSelectedDriver(driver)}
              className={`p-4 bg-white rounded-lg shadow cursor-pointer ${
                selectedDriver?.id === driver.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <img
                  src={driver.avatar}
                  alt={driver.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{driver.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(driver.status)}`} />
                    <span className="text-sm text-gray-600">{driver.status}</span>
                  </div>
                </div>
              </div>
              {driver.currentOrder && (
                <div className="mt-2 text-sm text-gray-600">
                  Currently delivering order #{driver.currentOrder}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Map and Details */}
      <div className="flex-1 p-6">
        <div className="h-96 mb-6 rounded-lg overflow-hidden">
          <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            className="h-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {filteredDrivers.map(driver => (
              <Marker
                key={driver.id}
                position={[driver.location.lat, driver.location.lng]}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-semibold">{driver.name}</h3>
                    <p className="text-sm text-gray-600">{driver.status}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {selectedDriver && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Driver Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Total Deliveries</p>
                <p className="text-2xl font-bold">{selectedDriver.stats.totalDeliveries}</p>
              </div>
              <div>
                <p className="text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold">{selectedDriver.stats.averageRating}/5</p>
              </div>
              <div>
                <p className="text-gray-600">On-Time Rate</p>
                <p className="text-2xl font-bold">{selectedDriver.stats.onTimeRate}%</p>
              </div>
              <div>
                <p className="text-gray-600">Total Distance</p>
                <p className="text-2xl font-bold">{selectedDriver.stats.totalDistance}km</p>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Recent Activity</h3>
              <div className="space-y-2">
                {selectedDriver.recentActivity.map((activity, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {activity.timestamp}: {activity.description}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
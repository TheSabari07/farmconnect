import { useState } from 'react';

const OrderCard = ({ order, onStatusUpdate, canUpdateStatus }) => {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const statusOptions = ['PENDING', 'ACCEPTED', 'SHIPPED', 'DELIVERED'];

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    setUpdating(true);
    try {
      await onStatusUpdate(order.id, newStatus);
    } catch (error) {
      setSelectedStatus(order.status); // Revert on error
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Order #{order.id}
          </h3>
          <p className="text-lg text-gray-700 font-semibold">{order.productName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status]}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-xs text-gray-500 mb-1">Quantity</p>
          <p className="text-lg font-semibold text-gray-800">{order.quantity} units</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-xs text-gray-500 mb-1">Total Price</p>
          <p className="text-lg font-semibold text-green-600">${order.totalPrice.toFixed(2)}</p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Buyer:</span>
            <span className="font-semibold text-gray-800">{order.buyerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Farmer:</span>
            <span className="font-semibold text-gray-800">{order.farmerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Ordered:</span>
            <span className="text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          {order.updatedAt && order.updatedAt !== order.createdAt && (
            <div className="flex justify-between">
              <span className="text-gray-500">Updated:</span>
              <span className="text-gray-800">{new Date(order.updatedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {canUpdateStatus && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Update Status
          </label>
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            disabled={updating}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {updating && (
            <p className="text-sm text-gray-500 mt-2">Updating status...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderCard;

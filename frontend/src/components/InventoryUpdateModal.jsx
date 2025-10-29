import { useState } from 'react';
import api from '../api';

const InventoryUpdateModal = ({ inventory, onClose, onUpdate }) => {
  const [quantity, setQuantity] = useState(inventory.availableQuantity);
  const [reason, setReason] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (quantity < 0) {
      setError('Quantity cannot be negative');
      return;
    }

    setUpdating(true);
    setError('');

    try {
      const response = await api.put(`/inventory/update/${inventory.productId}`, {
        quantity: parseInt(quantity),
        reason: reason || undefined,
      });
      
      onUpdate(response.data);
      onClose();
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to update inventory. Please try again.');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const difference = quantity - inventory.availableQuantity;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Update Inventory</h2>
            <p className="text-gray-600 mt-1">{inventory.productName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Current Stock
            </label>
            <div className="bg-gray-100 px-4 py-3 rounded">
              <span className="text-2xl font-bold text-gray-800">
                {inventory.availableQuantity}
              </span>
              <span className="text-gray-600 ml-2">units</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              New Stock Quantity *
            </label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            {difference !== 0 && (
              <p className={`text-sm mt-1 ${difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {difference > 0 ? '+' : ''}{difference} units
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., New harvest, Damaged goods, etc."
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
              disabled={updating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryUpdateModal;

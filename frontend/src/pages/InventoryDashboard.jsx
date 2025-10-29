import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import InventoryList from '../components/InventoryList';

const InventoryDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Only farmers and admins can access inventory
    if (parsedUser.role !== 'FARMER' && parsedUser.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }

    fetchInventory();
  }, [navigate]);

  const fetchInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/inventory');
      setInventory(response.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view inventory');
      } else {
        setError('Failed to load inventory');
      }
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInventoryUpdate = (updatedInventory) => {
    // Update the inventory list with the new data
    setInventory(inventory.map(item => 
      item.productId === updatedInventory.productId ? updatedInventory : item
    ));
    setSuccess('Inventory updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleRefresh = () => {
    fetchInventory();
    setSuccess('Inventory refreshed!');
    setTimeout(() => setSuccess(''), 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const canUpdate = user.role === 'FARMER' || user.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-green-600">Farm Marketplace</h1>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-700 hover:text-green-600 transition duration-200"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/products')}
                className="text-gray-700 hover:text-green-600 transition duration-200"
              >
                Products
              </button>
              {user.role === 'FARMER' && (
                <button
                  onClick={() => navigate('/farmer-orders')}
                  className="text-gray-700 hover:text-green-600 transition duration-200"
                >
                  Orders
                </button>
              )}
              <button
                onClick={() => navigate('/inventory')}
                className="text-green-600 font-semibold"
              >
                Inventory
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                <span className="font-semibold">{user.name}</span>
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {user.role}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Inventory Management</h2>
              <p className="text-gray-600 mt-2">Monitor and manage product stock levels</p>
            </div>
            <button
              onClick={handleRefresh}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center gap-2"
            >
              <span>🔄</span>
              Refresh
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {/* Low Stock Alert */}
          {!loading && inventory.filter(i => i.availableQuantity < 10 && i.availableQuantity > 0).length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Low Stock Alert
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      {inventory.filter(i => i.availableQuantity < 10 && i.availableQuantity > 0).length} product(s) 
                      are running low on stock. Consider restocking soon.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Out of Stock Alert */}
          {!loading && inventory.filter(i => i.availableQuantity === 0).length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🚫</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Out of Stock Alert
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      {inventory.filter(i => i.availableQuantity === 0).length} product(s) 
                      are out of stock. Restock immediately to continue selling.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inventory List */}
          <InventoryList
            inventory={inventory}
            onUpdate={handleInventoryUpdate}
            canUpdate={canUpdate}
            loading={loading}
          />

          {/* Help Text */}
          {!loading && inventory.length > 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Inventory Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Red highlight</strong>: Products with less than 10 units in stock</li>
                <li>• <strong>Available Stock</strong>: Units ready for sale</li>
                <li>• <strong>Reserved</strong>: Units allocated to pending orders</li>
                <li>• <strong>Auto-update</strong>: Inventory decreases when orders are placed and increases when cancelled</li>
                {canUpdate && <li>• <strong>Manual Update</strong>: Click "Update Stock" to manually adjust inventory</li>}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InventoryDashboard;

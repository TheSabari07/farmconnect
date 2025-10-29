import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import OrderCard from '../components/OrderCard';

const FarmerOrders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
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
    setUser(parsedUser); // Set user first so page can render
    
    if (parsedUser.role !== 'FARMER') {
      navigate('/dashboard');
      return;
    }
    
    // Check if user object has id (new auth response format)
    if (!parsedUser.id) {
      setError('Please log out and log back in to view orders');
      setLoading(false);
      return;
    }
    
    fetchOrders(parsedUser.id);
  }, [navigate]);

  const fetchOrders = async (farmerId) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/orders/farmer/${farmerId}`);
      setOrders(response.data);
    } catch (err) {
      setError('Failed to load orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      setSuccess('Order status updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to update order status');
      }
      throw err; // Re-throw to let OrderCard handle the revert
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'PENDING').length,
      accepted: orders.filter(o => o.status === 'ACCEPTED').length,
      shipped: orders.filter(o => o.status === 'SHIPPED').length,
      delivered: orders.filter(o => o.status === 'DELIVERED').length,
    };
    return stats;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const stats = getOrderStats();

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
              <button
                onClick={() => navigate('/farmer-orders')}
                className="text-green-600 font-semibold"
              >
                Orders
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
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Order Management</h2>
            <p className="text-gray-600 mt-2">Manage orders for your products</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="mb-2">{error}</p>
              {error.includes('log out') && (
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition duration-200"
                >
                  Logout Now
                </button>
              )}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {/* Stats */}
          {!loading && orders.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg shadow">
                <p className="text-sm text-yellow-700 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow">
                <p className="text-sm text-blue-700 mb-1">Accepted</p>
                <p className="text-2xl font-bold text-blue-800">{stats.accepted}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg shadow">
                <p className="text-sm text-purple-700 mb-1">Shipped</p>
                <p className="text-2xl font-bold text-purple-800">{stats.shipped}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg shadow">
                <p className="text-sm text-green-700 mb-1">Delivered</p>
                <p className="text-2xl font-bold text-green-800">{stats.delivered}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-xl text-gray-600">Loading orders...</div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-xl text-gray-600 mb-4">No orders yet</p>
              <p className="text-gray-500 mb-6">Orders for your products will appear here</p>
              <button
                onClick={() => navigate('/products')}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition duration-200"
              >
                Manage Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                  canUpdateStatus={true}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FarmerOrders;

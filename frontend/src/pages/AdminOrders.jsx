import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import OrderCard from '../components/OrderCard';

const AdminOrders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }

    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (err) {
      setError('Failed to load orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders(); // Refresh orders
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update order status');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      await api.delete(`/orders/${orderId}`);
      fetchOrders(); // Refresh orders
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete order');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'PENDING').length,
      accepted: orders.filter(o => o.status === 'ACCEPTED').length,
      shipped: orders.filter(o => o.status === 'SHIPPED').length,
      delivered: orders.filter(o => o.status === 'DELIVERED').length,
      cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    };
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
                onClick={() => navigate('/admin-orders')}
                className="text-green-600 font-semibold"
              >
                All Orders
              </button>
              <button
                onClick={() => navigate('/inventory')}
                className="text-gray-700 hover:text-green-600 transition duration-200"
              >
                Inventory
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                <span className="font-semibold">{user.name}</span>
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
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
            <h2 className="text-3xl font-bold text-gray-800">All Orders (Admin)</h2>
            <p className="text-gray-600 mt-2">Manage all orders across the platform</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Stats */}
          {!loading && orders.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500 mb-1">Total</p>
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
              <div className="bg-red-50 p-4 rounded-lg shadow">
                <p className="text-sm text-red-700 mb-1">Cancelled</p>
                <p className="text-2xl font-bold text-red-800">{stats.cancelled}</p>
              </div>
            </div>
          )}

          {/* Filter */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {['ALL', 'PENDING', 'ACCEPTED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg transition duration-200 ${
                  filter === status
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-xl text-gray-600">Loading orders...</div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-xl text-gray-600 mb-4">No orders found</p>
              <p className="text-gray-500">
                {filter === 'ALL' ? 'No orders have been placed yet' : `No ${filter} orders`}
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <p className="text-gray-600">
                  {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    canUpdateStatus={true}
                    onCancel={handleDeleteOrder}
                    canCancel={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminOrders;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import TrackingTimeline from '../components/TrackingTimeline';

const BuyerTrackingPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.role !== 'BUYER') {
      navigate('/dashboard');
      return;
    }

    if (parsedUser.id) {
      fetchDeliveries(parsedUser.id);
    } else {
      setError('Unable to load deliveries. Please try logging out and back in.');
      setLoading(false);
    }
  }, [navigate]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!user || !user.id || !autoRefresh) return;

    const interval = setInterval(() => {
      fetchDeliveries(user.id, true); // Silent refresh
    }, 10000);

    return () => clearInterval(interval);
  }, [user, autoRefresh]);

  const fetchDeliveries = async (buyerId, silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const response = await api.get(`/delivery/tracking/${buyerId}`);
      setDeliveries(response.data);
      
      // Auto-select first delivery if none selected
      if (!selectedDelivery && response.data.length > 0) {
        setSelectedDelivery(response.data[0]);
      } else if (selectedDelivery) {
        // Update selected delivery with new data
        const updated = response.data.find(d => d.id === selectedDelivery.id);
        if (updated) setSelectedDelivery(updated);
      }
    } catch (err) {
      if (!silent) {
        setError('Failed to load deliveries');
        console.error('Error fetching deliveries:', err);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleRefresh = () => {
    if (user && user.id) {
      fetchDeliveries(user.id);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

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
                onClick={() => navigate('/orders')}
                className="text-gray-700 hover:text-green-600 transition duration-200"
              >
                My Orders
              </button>
              <button
                onClick={() => navigate('/tracking')}
                className="text-green-600 font-semibold"
              >
                Track Delivery
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
              <h2 className="text-3xl font-bold text-gray-800">Track Your Deliveries</h2>
              <p className="text-gray-600 mt-2">Real-time delivery status updates</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg transition duration-200 ${
                  autoRefresh
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {autoRefresh ? '🔄 Auto-Refresh ON' : '⏸️ Auto-Refresh OFF'}
              </button>
              <button
                onClick={handleRefresh}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
              >
                🔄 Refresh Now
              </button>
            </div>
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

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-xl text-gray-600">Loading deliveries...</div>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-xl text-gray-600 mb-4">No deliveries to track</p>
              <p className="text-gray-500 mb-6">
                Place an order and wait for it to be shipped to start tracking!
              </p>
              <button
                onClick={() => navigate('/products')}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition duration-200"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Delivery List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Your Deliveries ({deliveries.length})
                  </h3>
                  <div className="space-y-3">
                    {deliveries.map((delivery) => (
                      <button
                        key={delivery.id}
                        onClick={() => setSelectedDelivery(delivery)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition duration-200 ${
                          selectedDelivery?.id === delivery.id
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-gray-800">
                            {delivery.productName}
                          </p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                              delivery.deliveryStatus
                            )}`}
                          >
                            {delivery.deliveryStatus}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Order #{delivery.orderId}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          From: {delivery.farmerName}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tracking Details */}
              <div className="lg:col-span-2">
                {selectedDelivery ? (
                  <div className="space-y-6">
                    {/* Product Info */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">
                        {selectedDelivery.productName}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Order ID</p>
                          <p className="font-semibold text-gray-800">
                            #{selectedDelivery.orderId}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Farmer</p>
                          <p className="font-semibold text-gray-800">
                            {selectedDelivery.farmerName}
                          </p>
                        </div>
                        {selectedDelivery.trackingLocation && (
                          <div className="col-span-2">
                            <p className="text-sm text-gray-500">Current Location</p>
                            <p className="font-semibold text-gray-800">
                              📍 {selectedDelivery.trackingLocation}
                            </p>
                          </div>
                        )}
                        {selectedDelivery.deliveryNotes && (
                          <div className="col-span-2">
                            <p className="text-sm text-gray-500">Notes</p>
                            <p className="text-gray-700">{selectedDelivery.deliveryNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tracking Timeline */}
                    <TrackingTimeline
                      deliveryStatus={selectedDelivery.deliveryStatus}
                      estimatedDate={selectedDelivery.estimatedDeliveryDate}
                      actualDate={selectedDelivery.actualDeliveryDate}
                    />
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <p className="text-gray-600">Select a delivery to view tracking details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BuyerTrackingPage;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import TrackingTimeline from '../components/TrackingTimeline';

const FarmerDeliveryPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.role !== 'FARMER' && parsedUser.role !== 'ADMIN') {
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

  const fetchDeliveries = async (farmerId) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/delivery/farmer/${farmerId}`);
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
      setError('Failed to load deliveries');
      console.error('Error fetching deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus, location, notes) => {
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put(`/delivery/${orderId}/status`, {
        status: newStatus,
        trackingLocation: location || undefined,
        deliveryNotes: notes || undefined,
      });

      // Update deliveries list
      setDeliveries(
        deliveries.map((d) =>
          d.orderId === orderId ? response.data : d
        )
      );

      // Update selected delivery
      if (selectedDelivery?.orderId === orderId) {
        setSelectedDelivery(response.data);
      }

      setSuccess('Delivery status updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to update delivery status');
      }
    } finally {
      setUpdating(false);
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

  const getDeliveryStats = () => {
    return {
      total: deliveries.length,
      pending: deliveries.filter((d) => d.deliveryStatus === 'PENDING').length,
      inTransit: deliveries.filter((d) => d.deliveryStatus === 'IN_TRANSIT').length,
      delivered: deliveries.filter((d) => d.deliveryStatus === 'DELIVERED').length,
      failed: deliveries.filter((d) => d.deliveryStatus === 'FAILED').length,
    };
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const stats = getDeliveryStats();

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
                className="text-gray-700 hover:text-green-600 transition duration-200"
              >
                Orders
              </button>
              <button
                onClick={() => navigate('/farmer-delivery')}
                className="text-green-600 font-semibold"
              >
                Deliveries
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
              <h2 className="text-3xl font-bold text-gray-800">Delivery Management</h2>
              <p className="text-gray-600 mt-2">Update delivery status for your orders</p>
            </div>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
            >
              🔄 Refresh
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

          {/* Stats */}
          {!loading && deliveries.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg shadow">
                <p className="text-sm text-yellow-700 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow">
                <p className="text-sm text-blue-700 mb-1">In Transit</p>
                <p className="text-2xl font-bold text-blue-800">{stats.inTransit}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg shadow">
                <p className="text-sm text-green-700 mb-1">Delivered</p>
                <p className="text-2xl font-bold text-green-800">{stats.delivered}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg shadow">
                <p className="text-sm text-red-700 mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-800">{stats.failed}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-xl text-gray-600">Loading deliveries...</div>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-xl text-gray-600 mb-4">No deliveries yet</p>
              <p className="text-gray-500">
                Deliveries will appear here when orders are shipped
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Delivery List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Deliveries ({deliveries.length})
                  </h3>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
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
                          To: {delivery.buyerName}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Delivery Details & Update */}
              <div className="lg:col-span-2">
                {selectedDelivery ? (
                  <DeliveryUpdateForm
                    delivery={selectedDelivery}
                    onUpdate={handleStatusUpdate}
                    updating={updating}
                  />
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <p className="text-gray-600">Select a delivery to manage</p>
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

// Delivery Update Form Component
const DeliveryUpdateForm = ({ delivery, onUpdate, updating }) => {
  const [status, setStatus] = useState(delivery.deliveryStatus);
  const [location, setLocation] = useState(delivery.trackingLocation || '');
  const [notes, setNotes] = useState(delivery.deliveryNotes || '');

  const statusOptions = [
    { value: 'PENDING', label: 'Pending - Preparing for shipment' },
    { value: 'IN_TRANSIT', label: 'In Transit - On the way' },
    { value: 'DELIVERED', label: 'Delivered - Completed' },
    { value: 'FAILED', label: 'Failed - Delivery issue' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(delivery.orderId, status, location, notes);
  };

  const canUpdate = delivery.deliveryStatus !== 'DELIVERED' && delivery.deliveryStatus !== 'FAILED';

  return (
    <div className="space-y-6">
      {/* Product Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          {delivery.productName}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-semibold text-gray-800">#{delivery.orderId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Buyer</p>
            <p className="font-semibold text-gray-800">{delivery.buyerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estimated Delivery</p>
            <p className="font-semibold text-gray-800">
              {delivery.estimatedDeliveryDate
                ? new Date(delivery.estimatedDeliveryDate).toLocaleDateString()
                : 'Not set'}
            </p>
          </div>
          {delivery.actualDeliveryDate && (
            <div>
              <p className="text-sm text-gray-500">Delivered On</p>
              <p className="font-semibold text-green-600">
                {new Date(delivery.actualDeliveryDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tracking Timeline */}
      <TrackingTimeline
        deliveryStatus={delivery.deliveryStatus}
        estimatedDate={delivery.estimatedDeliveryDate}
        actualDate={delivery.actualDeliveryDate}
      />

      {/* Update Form */}
      {canUpdate && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Update Delivery Status</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Delivery Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Tracking Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Distribution Center - City A"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Delivery Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition duration-200 disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Update Delivery Status'}
            </button>
          </form>
        </div>
      )}

      {!canUpdate && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-600">
            This delivery has been {delivery.deliveryStatus.toLowerCase()} and cannot be updated.
          </p>
        </div>
      )}
    </div>
  );
};

export default FarmerDeliveryPage;

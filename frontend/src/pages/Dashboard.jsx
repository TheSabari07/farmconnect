import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/');
      return;
    }

    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
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
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-green-600">
                Farm Marketplace
              </h1>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-green-600 font-semibold"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/products')}
                className="text-gray-700 hover:text-green-600 transition duration-200"
              >
                Products
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, <span className="font-semibold">{user.name}</span>
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Dashboard
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  User Info
                </h3>
                <p className="text-gray-700">
                  <strong>Name:</strong> {user.name}
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="text-gray-700">
                  <strong>Role:</strong> {user.role}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Quick Stats
                </h3>
                <p className="text-gray-700">Coming soon...</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">
                  Recent Activity
                </h3>
                <p className="text-gray-700">No activity yet</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/products')}
                  className="bg-white border-2 border-green-600 hover:bg-green-50 text-green-600 font-semibold py-4 px-6 rounded-lg transition duration-200 text-left"
                >
                  <div className="text-lg mb-1">📦 Browse Products</div>
                  <div className="text-sm text-gray-600">
                    {user.role === 'FARMER' 
                      ? 'Manage your product listings' 
                      : 'View available farm products'}
                  </div>
                </button>
                <button
                  onClick={() => navigate(user.role === 'FARMER' ? '/farmer-orders' : '/orders')}
                  className="bg-white border-2 border-green-600 hover:bg-green-50 text-green-600 font-semibold py-4 px-6 rounded-lg transition duration-200 text-left"
                >
                  <div className="text-lg mb-1">🛒 Orders</div>
                  <div className="text-sm text-gray-600">
                    {user.role === 'FARMER' 
                      ? 'Manage orders for your products' 
                      : user.role === 'BUYER'
                      ? 'View your order history'
                      : 'View all orders'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

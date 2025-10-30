import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Package, ShoppingCart, Warehouse, Truck, TrendingUp, Users } from 'lucide-react';

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  const getQuickActions = () => {
    const actions = [
      {
        title: 'Browse Products',
        description: user.role === 'FARMER' ? 'Manage your product listings' : 'View available farm products',
        icon: Package,
        path: '/products',
        color: 'from-green-500 to-emerald-600',
      },
      {
        title: 'Orders',
        description: user.role === 'FARMER' ? 'Manage orders for your products' : user.role === 'BUYER' ? 'View your order history' : 'Manage all platform orders',
        icon: ShoppingCart,
        path: user.role === 'ADMIN' ? '/admin-orders' : user.role === 'FARMER' ? '/farmer-orders' : '/orders',
        color: 'from-blue-500 to-indigo-600',
      },
    ];

    if (user.role === 'FARMER' || user.role === 'ADMIN') {
      actions.push({
        title: 'Inventory',
        description: user.role === 'FARMER' ? 'Monitor and manage stock levels' : 'View all inventory',
        icon: Warehouse,
        path: '/inventory',
        color: 'from-purple-500 to-pink-600',
      });
      actions.push({
        title: 'Deliveries',
        description: user.role === 'FARMER' ? 'Manage delivery status for orders' : 'View all deliveries',
        icon: Truck,
        path: '/farmer-delivery',
        color: 'from-orange-500 to-red-600',
      });
    }

    if (user.role === 'BUYER') {
      actions.push({
        title: 'Track Delivery',
        description: 'Track your order deliveries in real-time',
        icon: Truck,
        path: '/tracking',
        color: 'from-orange-500 to-red-600',
      });
    }

    return actions;
  };

  return (
    <Layout user={user}>
      <div className="animate-in space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-green-100">Here's what's happening with your farm marketplace today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hover className="animate-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
                  <p className="text-sm text-gray-500 mt-1">Coming soon</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Package className="text-white" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover className="animate-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
                  <p className="text-sm text-gray-500 mt-1">Coming soon</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="text-white" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover className="animate-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {user.role === 'FARMER' ? 'Revenue' : user.role === 'BUYER' ? 'Total Spent' : 'Platform Users'}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
                  <p className="text-sm text-gray-500 mt-1">Coming soon</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  {user.role === 'ADMIN' ? <Users className="text-white" size={24} /> : <TrendingUp className="text-white" size={24} />}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="animate-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Navigate to key areas of your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getQuickActions().map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 border-2 border-gray-200 hover:border-green-300 rounded-xl p-6 text-left transition-all duration-300 hover:shadow-lg"
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-green-700 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* User Info */}
        <Card className="animate-in" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm font-medium text-gray-600 mb-1">Name</p>
                <p className="text-lg font-semibold text-gray-900">{user.name}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                <p className="text-lg font-semibold text-gray-900">{user.email}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                <p className="text-sm font-medium text-gray-600 mb-1">Role</p>
                <p className="text-lg font-semibold text-gray-900">{user.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;

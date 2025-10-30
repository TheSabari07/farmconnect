import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Warehouse, 
  Truck, 
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';
import Badge from './ui/Badge';

const Layout = ({ children, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getNavItems = () => {
    const baseItems = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Products', path: '/products', icon: Package },
    ];

    if (user?.role === 'BUYER') {
      return [
        ...baseItems,
        { name: 'My Orders', path: '/orders', icon: ShoppingCart },
        { name: 'Track Delivery', path: '/tracking', icon: Truck },
      ];
    }

    if (user?.role === 'FARMER') {
      return [
        ...baseItems,
        { name: 'Orders', path: '/farmer-orders', icon: ShoppingCart },
        { name: 'Inventory', path: '/inventory', icon: Warehouse },
        { name: 'Deliveries', path: '/farmer-delivery', icon: Truck },
      ];
    }

    if (user?.role === 'ADMIN') {
      return [
        ...baseItems,
        { name: 'All Orders', path: '/admin-orders', icon: ShoppingCart },
        { name: 'Inventory', path: '/inventory', icon: Warehouse },
        { name: 'Deliveries', path: '/farmer-delivery', icon: Truck },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const NavLink = ({ item, mobile = false }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <button
        onClick={() => {
          navigate(item.path);
          if (mobile) setSidebarOpen(false);
        }}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-green-100 text-green-700 font-medium shadow-sm' 
            : 'text-gray-700 hover:bg-gray-100'
          }
        `}
      >
        <Icon size={20} />
        <span>{item.name}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl font-bold text-green-600">FarmConnect</h1>
          </div>
          <Badge variant="primary">{user?.role}</Badge>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FarmConnect</h1>
              <p className="text-xs text-gray-500">Marketplace</p>
            </div>
          </div>

          {/* User Info */}
          <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <Badge variant="primary" className="mt-1">{user?.role}</Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* User Info */}
              <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <User className="text-white" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                    <Badge variant="primary" className="mt-1">{user?.role}</Badge>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink key={item.path} item={item} mobile />
                ))}
              </nav>

              {/* Logout Button */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

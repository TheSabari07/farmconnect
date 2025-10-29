import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import OrdersPage from './pages/OrdersPage';
import FarmerOrders from './pages/FarmerOrders';
import AdminOrders from './pages/AdminOrders';
import InventoryDashboard from './pages/InventoryDashboard';
import BuyerTrackingPage from './pages/BuyerTrackingPage';
import FarmerDeliveryPage from './pages/FarmerDeliveryPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/farmer-orders" element={<FarmerOrders />} />
        <Route path="/admin-orders" element={<AdminOrders />} />
        <Route path="/inventory" element={<InventoryDashboard />} />
        <Route path="/tracking" element={<BuyerTrackingPage />} />
        <Route path="/farmer-delivery" element={<FarmerDeliveryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';

const Products = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/');
      return;
    }

    setUser(JSON.parse(userData));
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData) => {
    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/products', productData);
      setProducts([response.data, ...products]);
      setShowForm(false);
      setSuccess('Product added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Only farmers can add products');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to add product. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProduct = async (productData) => {
    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put(`/products/${editingProduct.id}`, productData);
      setProducts(products.map((p) => (p.id === editingProduct.id ? response.data : p)));
      setEditingProduct(null);
      setShowForm(false);
      setSuccess('Product updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You can only update your own products');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to update product. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await api.delete(`/products/${productId}`);
      setProducts(products.filter((p) => p.id !== productId));
      setSuccess('Product deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You can only delete your own products');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to delete product. Please try again.');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
    setError('');
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setError('');
  };

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

  const isFarmer = user.role === 'FARMER';

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
                className="text-green-600 font-semibold"
              >
                Products
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

          {/* Add Product Button (Farmers Only) */}
          {isFarmer && !showForm && (
            <div className="mb-6">
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-200"
              >
                + Add New Product
              </button>
            </div>
          )}

          {/* Product Form */}
          {showForm && isFarmer && (
            <div className="mb-6">
              <ProductForm
                product={editingProduct}
                onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
                onCancel={handleCancelForm}
                loading={formLoading}
              />
            </div>
          )}

          {/* Product List */}
          <ProductList
            products={products}
            onEdit={handleEdit}
            onDelete={handleDeleteProduct}
            currentUserId={user.id}
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
};

export default Products;

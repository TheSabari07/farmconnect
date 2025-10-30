import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../api';
import Layout from '../components/Layout';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

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
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  const isFarmer = user.role === 'FARMER';

  return (
    <Layout user={user}>
      <div className="animate-in space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">
              {isFarmer ? 'Manage your product listings' : 'Browse available farm products'}
            </p>
          </div>
          {isFarmer && !showForm && (
            <Button
              onClick={() => setShowForm(true)}
              variant="primary"
              size="lg"
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              Add New Product
            </Button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <Alert variant="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Product Form */}
        {showForm && isFarmer && (
          <Card className="animate-in">
            <CardHeader>
              <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
              <CardDescription>
                {editingProduct ? 'Update your product details' : 'Fill in the details to list a new product'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductForm
                product={editingProduct}
                onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
                onCancel={handleCancelForm}
                loading={formLoading}
              />
            </CardContent>
          </Card>
        )}

        {/* Product List */}
        <ProductList
          products={products}
          onEdit={handleEdit}
          onDelete={handleDeleteProduct}
          currentUserId={user.id}
          userRole={user.role}
          loading={loading}
        />
      </div>
    </Layout>
  );
};

export default Products;

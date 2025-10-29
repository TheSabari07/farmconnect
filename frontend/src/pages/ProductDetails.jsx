import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
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
    fetchProduct();
  }, [id, navigate]);

  const fetchProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (err) {
      setError('Failed to load product details');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    if (quantity > product.quantity) {
      setError(`Only ${product.quantity} units available`);
      return;
    }

    setOrdering(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/orders', {
        productId: product.id,
        quantity: parseInt(quantity),
      });
      setSuccess('Order placed successfully!');
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 403) {
        setError('Only buyers can place orders');
      } else {
        setError('Failed to place order. Please try again.');
      }
    } finally {
      setOrdering(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Product not found</div>
      </div>
    );
  }

  const isBuyer = user?.role === 'BUYER';
  const totalPrice = (product.price * quantity).toFixed(2);

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
              {isBuyer && (
                <button
                  onClick={() => navigate('/orders')}
                  className="text-gray-700 hover:text-green-600 transition duration-200"
                >
                  My Orders
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                <span className="font-semibold">{user?.name}</span>
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {user?.role}
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
          <button
            onClick={() => navigate('/products')}
            className="mb-6 text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Products
          </button>

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

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              {/* Product Image Placeholder */}
              <div className="md:w-1/2 bg-gradient-to-br from-green-100 to-green-200 p-12 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4">🌾</div>
                  <p className="text-gray-600">Product Image</p>
                </div>
              </div>

              {/* Product Details */}
              <div className="md:w-1/2 p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h2>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-green-600">${product.price}</span>
                  <span className="text-gray-500 ml-2">per unit</span>
                </div>

                {product.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-600">{product.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-500 mb-1">Available Stock</p>
                    <p className="text-2xl font-bold text-gray-800">{product.quantity}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="text-lg font-semibold text-gray-800">{product.location}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Farmer</p>
                  <p className="text-lg font-semibold text-gray-800">{product.farmerName}</p>
                </div>

                {isBuyer && product.quantity > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Place Order</h3>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={product.quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div className="mb-6 bg-green-50 p-4 rounded">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-700">Total Price:</span>
                        <span className="text-2xl font-bold text-green-600">${totalPrice}</span>
                      </div>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={ordering || product.quantity === 0}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                    >
                      {ordering ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                )}

                {!isBuyer && (
                  <div className="border-t border-gray-200 pt-6">
                    <p className="text-gray-600 italic">Only buyers can place orders</p>
                  </div>
                )}

                {product.quantity === 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <p className="text-red-600 font-semibold">Out of Stock</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;

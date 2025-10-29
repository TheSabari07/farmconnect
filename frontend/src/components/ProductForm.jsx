import { useState, useEffect } from 'react';

const ProductForm = ({ product, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    location: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        quantity: product.quantity || '',
        location: product.location || '',
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'Valid price is required';
    }
    
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
    };

    onSubmit(submitData);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      quantity: '',
      location: '',
    });
    setErrors({});
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {product ? 'Edit Product' : 'Add New Product'}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Product Name *
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.name ? 'border-red-500' : ''
            }`}
            id="name"
            type="text"
            name="name"
            placeholder="e.g., Organic Tomatoes"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className="text-red-500 text-xs italic mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
            id="description"
            name="description"
            placeholder="Describe your product..."
            rows="3"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
              Price ($) *
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.price ? 'border-red-500' : ''
              }`}
              id="price"
              type="number"
              step="0.01"
              name="price"
              placeholder="0.00"
              value={formData.price}
              onChange={handleChange}
            />
            {errors.price && <p className="text-red-500 text-xs italic mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
              Quantity *
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.quantity ? 'border-red-500' : ''
              }`}
              id="quantity"
              type="number"
              name="quantity"
              placeholder="0"
              value={formData.quantity}
              onChange={handleChange}
            />
            {errors.quantity && <p className="text-red-500 text-xs italic mt-1">{errors.quantity}</p>}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
            Location *
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.location ? 'border-red-500' : ''
            }`}
            id="location"
            type="text"
            name="location"
            placeholder="e.g., California"
            value={formData.location}
            onChange={handleChange}
          />
          {errors.location && <p className="text-red-500 text-xs italic mt-1">{errors.location}</p>}
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
        >
          {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
        >
          {product ? 'Cancel' : 'Reset'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, onEdit, onDelete, isOwner, userRole }) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    onDelete(product.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-2">by {product.farmerName}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">${product.price}</p>
          <p className="text-sm text-gray-500">per unit</p>
        </div>
      </div>

      {product.description && (
        <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`p-3 rounded ${
          product.quantity === 0 
            ? 'bg-red-100 border border-red-300' 
            : product.quantity < 10 
            ? 'bg-yellow-100 border border-yellow-300' 
            : 'bg-gray-50'
        }`}>
          <p className="text-xs text-gray-500 mb-1">Available</p>
          <p className={`text-lg font-semibold ${
            product.quantity === 0 
              ? 'text-red-700' 
              : product.quantity < 10 
              ? 'text-yellow-700' 
              : 'text-gray-800'
          }`}>
            {product.quantity} units
            {product.quantity === 0 && <span className="text-xs ml-2">🚫 Out of Stock</span>}
            {product.quantity > 0 && product.quantity < 10 && <span className="text-xs ml-2">⚠️ Low Stock</span>}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-xs text-gray-500 mb-1">Location</p>
          <p className="text-lg font-semibold text-gray-800">{product.location}</p>
        </div>
      </div>

      <div className="text-xs text-gray-400 mb-4">
        <p>Listed: {new Date(product.createdAt).toLocaleDateString()}</p>
        {product.updatedAt && product.updatedAt !== product.createdAt && (
          <p>Updated: {new Date(product.updatedAt).toLocaleDateString()}</p>
        )}
      </div>

      {/* View Details button for buyers */}
      {userRole === 'BUYER' && !isOwner && (
        <div className="pt-4 border-t border-gray-200">
          {product.quantity === 0 ? (
            <button
              disabled
              className="w-full bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
            >
              Out of Stock
            </button>
          ) : (
            <button
              onClick={() => navigate(`/products/${product.id}`)}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition duration-200"
            >
              View Details & Order
            </button>
          )}
        </div>
      )}

      {isOwner && (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200"
          >
            Edit
          </button>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition duration-200"
            >
              Delete
            </button>
          ) : (
            <div className="flex-1 flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-700 hover:bg-red-800 text-white px-2 py-2 rounded text-sm"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-2 py-2 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductCard;

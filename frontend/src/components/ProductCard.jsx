import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';

const ProductCard = ({ product, onEdit, onDelete, isOwner, userRole }) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    onDelete(product.id);
    setShowDeleteConfirm(false);
  };

  const getStockBadge = () => {
    if (product.quantity === 0) {
      return <Badge variant="danger" className="flex items-center gap-1"><AlertCircle size={12} /> Out of Stock</Badge>;
    }
    if (product.quantity < 10) {
      return <Badge variant="warning" className="flex items-center gap-1"><AlertCircle size={12} /> Low Stock</Badge>;
    }
    return <Badge variant="success" className="flex items-center gap-1"><Package size={12} /> In Stock</Badge>;
  };

  return (
    <Card hover className="group animate-in">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-green-700 transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 mb-2">by {product.farmerName}</p>
            {getStockBadge()}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              ${product.price}
            </p>
            <p className="text-xs text-gray-500">per unit</p>
          </div>
        </div>

        {product.description && (
          <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{product.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`p-3 rounded-lg border transition-all ${
            product.quantity === 0 
              ? 'bg-red-50 border-red-200' 
              : product.quantity < 10 
              ? 'bg-yellow-50 border-yellow-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <Package size={14} className={
                product.quantity === 0 ? 'text-red-600' : 
                product.quantity < 10 ? 'text-yellow-600' : 'text-green-600'
              } />
              <p className="text-xs font-medium text-gray-600">Stock</p>
            </div>
            <p className={`text-lg font-bold ${
              product.quantity === 0 ? 'text-red-700' : 
              product.quantity < 10 ? 'text-yellow-700' : 'text-green-700'
            }`}>
              {product.quantity}
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} className="text-blue-600" />
              <p className="text-xs font-medium text-gray-600">Location</p>
            </div>
            <p className="text-sm font-semibold text-blue-700 truncate">{product.location}</p>
          </div>
        </div>

        <div className="text-xs text-gray-400 mb-4 flex items-center gap-3">
          <span>Listed {new Date(product.createdAt).toLocaleDateString()}</span>
          {product.updatedAt && product.updatedAt !== product.createdAt && (
            <span>• Updated {new Date(product.updatedAt).toLocaleDateString()}</span>
          )}
        </div>

        {/* View Details button for buyers */}
        {userRole === 'BUYER' && !isOwner && (
          <div className="pt-4 border-t border-gray-100">
            {product.quantity === 0 ? (
              <Button variant="secondary" size="md" className="w-full" disabled>
                Out of Stock
              </Button>
            ) : (
              <Button 
                variant="primary" 
                size="md" 
                className="w-full"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                View Details & Order
              </Button>
            )}
          </div>
        )}

        {isOwner && (
          <div className="flex gap-2 pt-4 border-t border-gray-100">
            {!showDeleteConfirm ? (
              <>
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                  onClick={() => onEdit(product)}
                >
                  <Edit2 size={16} className="mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  onClick={handleDelete}
                >
                  Confirm Delete
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;

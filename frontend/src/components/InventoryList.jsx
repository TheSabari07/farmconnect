import { useState } from 'react';
import InventoryUpdateModal from './InventoryUpdateModal';

const InventoryList = ({ inventory, onUpdate, canUpdate, loading }) => {
  const [selectedInventory, setSelectedInventory] = useState(null);

  const handleUpdateClick = (item) => {
    setSelectedInventory(item);
  };

  const handleModalClose = () => {
    setSelectedInventory(null);
  };

  const handleInventoryUpdate = (updatedInventory) => {
    onUpdate(updatedInventory);
    setSelectedInventory(null);
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: '🚫' };
    if (quantity < 10) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' };
    if (quantity < 50) return { label: 'In Stock', color: 'bg-blue-100 text-blue-800', icon: '📦' };
    return { label: 'Well Stocked', color: 'bg-green-100 text-green-800', icon: '✅' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-xl text-gray-600">Loading inventory...</div>
      </div>
    );
  }

  if (!inventory || inventory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-xl text-gray-600 mb-4">No inventory items found</p>
        <p className="text-gray-500">Add products to see inventory here</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reserved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                {canUpdate && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item) => {
                const status = getStockStatus(item.availableQuantity);
                return (
                  <tr 
                    key={item.id}
                    className={item.availableQuantity < 10 ? 'bg-red-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.productName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {item.productId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-2xl font-bold text-gray-900">
                        {item.availableQuantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg text-gray-600">
                        {item.reservedQuantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-semibold text-gray-800">
                        {item.totalQuantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.lastUpdated).toLocaleString()}
                    </td>
                    {canUpdate && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleUpdateClick(item)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200"
                        >
                          Update Stock
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">Total Products</p>
          <p className="text-2xl font-bold text-gray-800">{inventory.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <p className="text-sm text-green-700 mb-1">Well Stocked</p>
          <p className="text-2xl font-bold text-green-800">
            {inventory.filter(i => i.availableQuantity >= 50).length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <p className="text-sm text-yellow-700 mb-1">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-800">
            {inventory.filter(i => i.availableQuantity > 0 && i.availableQuantity < 10).length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <p className="text-sm text-red-700 mb-1">Out of Stock</p>
          <p className="text-2xl font-bold text-red-800">
            {inventory.filter(i => i.availableQuantity === 0).length}
          </p>
        </div>
      </div>

      {/* Update Modal */}
      {selectedInventory && (
        <InventoryUpdateModal
          inventory={selectedInventory}
          onClose={handleModalClose}
          onUpdate={handleInventoryUpdate}
        />
      )}
    </>
  );
};

export default InventoryList;

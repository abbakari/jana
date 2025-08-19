import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface CustomerItemCombination {
  customerName: string;
  customerCode: string;
  itemName: string;
  itemCode: string;
  category: string;
  brand: string;
}

interface AddCustomerItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (combination: CustomerItemCombination) => void;
}

const AddCustomerItemModal: React.FC<AddCustomerItemModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [formData, setFormData] = useState<CustomerItemCombination>({
    customerName: '',
    customerCode: '',
    itemName: '',
    itemCode: '',
    category: '',
    brand: ''
  });

  const [showSelectExisting, setShowSelectExisting] = useState({
    customer: false,
    item: false
  });

  const handleInputChange = (field: keyof CustomerItemCombination, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.customerName || !formData.itemName) {
      alert('Customer name and item name are required');
      return;
    }

    onAdd(formData);
    
    // Reset form
    setFormData({
      customerName: '',
      customerCode: '',
      itemName: '',
      itemCode: '',
      category: '',
      brand: ''
    });
    
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      customerName: '',
      customerCode: '',
      itemName: '',
      itemCode: '',
      category: '',
      brand: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Plus className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Add Customer-Item Combination</h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Error Message (simulated for demo) */}
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">Failed to load data: Failed to fetch</p>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Customer Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs text-gray-600">👤</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Customer</h3>
              </div>
              <button
                onClick={() => setShowSelectExisting(prev => ({ ...prev, customer: !prev.customer }))}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                Select Existing
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Customer name"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Customer code"
                  value={formData.customerCode}
                  onChange={(e) => handleInputChange('customerCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Item Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs text-gray-600">📦</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Item</h3>
              </div>
              <button
                onClick={() => setShowSelectExisting(prev => ({ ...prev, item: !prev.item }))}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                Select Existing
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Item name"
                  value={formData.itemName}
                  onChange={(e) => handleInputChange('itemName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Item code"
                  value={formData.itemCode}
                  onChange={(e) => handleInputChange('itemCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Combination
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerItemModal;

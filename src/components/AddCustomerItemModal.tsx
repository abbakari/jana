import React, { useState, useMemo } from 'react';
import { X, Plus, Search, Check } from 'lucide-react';

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

// Sample existing data from the application
const existingCustomers = [
  { name: 'Action Aid International (Tz)', code: 'AAI-TZ-001' },
  { name: 'ADVENT CONSTRUCTION LTD.', code: 'ACL-001' },
  { name: 'Global Trading Co.', code: 'GTC-002' },
  { name: 'East Africa Motors', code: 'EAM-003' },
  { name: 'Tanzania Auto Parts', code: 'TAP-004' }
];

const existingItems = [
  { 
    name: 'BF GOODRICH TYRE 235/85R16 120/116S TL AT/TA KO2 LRERWLGO', 
    code: 'BFG-235-85R16',
    category: 'Tyres',
    brand: 'BF Goodrich'
  },
  { 
    name: 'BF GOODRICH TYRE 265/65R17 120/117S TL AT/TA KO2 LRERWLGO', 
    code: 'BFG-265-65R17',
    category: 'Tyres',
    brand: 'BF Goodrich'
  },
  { 
    name: 'VALVE 0214 TR 414J FOR CAR TUBELESS TYRE', 
    code: 'VLV-0214-TR414J',
    category: 'Accessories',
    brand: 'Generic'
  },
  { 
    name: 'MICHELIN TYRE 265/65R17 112T TL LTX TRAIL', 
    code: 'MCH-265-65R17',
    category: 'Tyres',
    brand: 'Michelin'
  },
  { 
    name: 'WHEEL BALANCE ALLOYD RIMS', 
    code: 'WBL-ALLOY-001',
    category: 'TYRE SERVICE',
    brand: 'TYRE SERVICE'
  }
];

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

  const [searchTerms, setSearchTerms] = useState({
    customer: '',
    item: ''
  });

  // Filtered customers based on search
  const filteredCustomers = useMemo(() => {
    return existingCustomers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerms.customer.toLowerCase()) ||
      customer.code.toLowerCase().includes(searchTerms.customer.toLowerCase())
    );
  }, [searchTerms.customer]);

  // Filtered items based on search
  const filteredItems = useMemo(() => {
    return existingItems.filter(item =>
      item.name.toLowerCase().includes(searchTerms.item.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerms.item.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerms.item.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerms.item.toLowerCase())
    );
  }, [searchTerms.item]);

  const handleInputChange = (field: keyof CustomerItemCombination, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectCustomer = (customer: typeof existingCustomers[0]) => {
    setFormData(prev => ({
      ...prev,
      customerName: customer.name,
      customerCode: customer.code
    }));
    setShowSelectExisting(prev => ({ ...prev, customer: false }));
    setSearchTerms(prev => ({ ...prev, customer: '' }));
  };

  const handleSelectItem = (item: typeof existingItems[0]) => {
    setFormData(prev => ({
      ...prev,
      itemName: item.name,
      itemCode: item.code,
      category: item.category,
      brand: item.brand
    }));
    setShowSelectExisting(prev => ({ ...prev, item: false }));
    setSearchTerms(prev => ({ ...prev, item: '' }));
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
    setShowSelectExisting({ customer: false, item: false });
    setSearchTerms({ customer: '', item: '' });
    
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
    setShowSelectExisting({ customer: false, item: false });
    setSearchTerms({ customer: '', item: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto">
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
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors flex items-center gap-1"
              >
                <Search className="w-4 h-4" />
                Select Existing
              </button>
            </div>

            {/* Customer Search/Select Dropdown */}
            {showSelectExisting.customer && (
              <div className="border border-gray-300 rounded-md bg-gray-50 p-4">
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search customers by name or code..."
                      value={searchTerms.customer}
                      onChange={(e) => setSearchTerms(prev => ({ ...prev, customer: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectCustomer(customer)}
                        className="w-full text-left p-3 hover:bg-blue-50 border border-gray-200 rounded-md transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">Code: {customer.code}</div>
                        </div>
                        <Check className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No customers found matching "{searchTerms.customer}"
                    </div>
                  )}
                </div>
              </div>
            )}

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
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors flex items-center gap-1"
              >
                <Search className="w-4 h-4" />
                Select Existing
              </button>
            </div>

            {/* Item Search/Select Dropdown */}
            {showSelectExisting.item && (
              <div className="border border-gray-300 rounded-md bg-gray-50 p-4">
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search items by name, code, category, or brand..."
                      value={searchTerms.item}
                      onChange={(e) => setSearchTerms(prev => ({ ...prev, item: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectItem(item)}
                        className="w-full text-left p-3 hover:bg-blue-50 border border-gray-200 rounded-md transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 truncate">{item.name}</div>
                            <div className="text-sm text-gray-500 flex gap-4">
                              <span>Code: {item.code}</span>
                              <span>Category: {item.category}</span>
                              <span>Brand: {item.brand}</span>
                            </div>
                          </div>
                          <Check className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No items found matching "{searchTerms.item}"
                    </div>
                  )}
                </div>
              </div>
            )}

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

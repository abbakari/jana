import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Save, RotateCcw, Search, Filter } from 'lucide-react';
import { DiscountCalculator, DiscountRule } from '../utils/discountCalculations';
import { useAuth } from '../contexts/AuthContext';

interface AdminDiscountManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminDiscountManagement: React.FC<AdminDiscountManagementProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([]);
  const [editingRule, setEditingRule] = useState<DiscountRule | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // New rule form state
  const [newRule, setNewRule] = useState({
    category: '',
    brand: '',
    discountPercentage: 0
  });

  useEffect(() => {
    if (isOpen) {
      loadDiscountRules();
    }
  }, [isOpen]);

  const loadDiscountRules = () => {
    const rules = DiscountCalculator.getDiscountRules();
    setDiscountRules(rules);
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveRule = (rule: DiscountRule) => {
    if (!user?.name) {
      showNotification('Admin user required for this operation', 'error');
      return;
    }

    const success = DiscountCalculator.updateDiscountRule(
      rule.id, 
      {
        category: rule.category,
        brand: rule.brand,
        discountPercentage: rule.discountPercentage,
        isActive: rule.isActive
      },
      user.name
    );

    if (success) {
      loadDiscountRules();
      setEditingRule(null);
      showNotification(`Discount rule updated successfully`, 'success');
    } else {
      showNotification('Failed to update discount rule', 'error');
    }
  };

  const handleAddNewRule = () => {
    if (!user?.name) {
      showNotification('Admin user required for this operation', 'error');
      return;
    }

    if (!newRule.category || !newRule.brand || newRule.discountPercentage <= 0) {
      showNotification('Please fill all required fields with valid values', 'error');
      return;
    }

    const success = DiscountCalculator.addDiscountRule(
      newRule.category,
      newRule.brand,
      newRule.discountPercentage,
      user.name
    );

    if (success) {
      loadDiscountRules();
      setIsAddingNew(false);
      setNewRule({ category: '', brand: '', discountPercentage: 0 });
      showNotification('New discount rule added successfully', 'success');
    } else {
      showNotification('Failed to add new discount rule', 'error');
    }
  };

  const handleDeleteRule = (ruleId: string) => {
    if (!user?.name) {
      showNotification('Admin user required for this operation', 'error');
      return;
    }

    if (window.confirm('Are you sure you want to delete this discount rule?')) {
      const success = DiscountCalculator.deleteDiscountRule(ruleId, user.name);
      
      if (success) {
        loadDiscountRules();
        showNotification('Discount rule deleted successfully', 'success');
      } else {
        showNotification('Failed to delete discount rule', 'error');
      }
    }
  };

  const handleResetToDefaults = () => {
    if (!user?.name) {
      showNotification('Admin user required for this operation', 'error');
      return;
    }

    if (window.confirm('Are you sure you want to reset all discount rules to default values? This will overwrite any custom rules.')) {
      const success = DiscountCalculator.resetToDefaultRules(user.name);
      
      if (success) {
        loadDiscountRules();
        showNotification('Discount rules reset to default values', 'success');
      } else {
        showNotification('Failed to reset discount rules', 'error');
      }
    }
  };

  // Filter rules based on search and category filter
  const filteredRules = discountRules.filter(rule => {
    const matchesSearch = searchTerm === '' || 
      rule.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === '' || rule.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [...new Set(discountRules.map(rule => rule.category))].sort();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Admin Discount Management</h2>
              <p className="text-sm text-gray-600">Manage automatic discount calculation rules for all users</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mx-6 mt-4 p-3 rounded-lg ${
            notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search category or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddingNew(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Rule
              </button>
              <button
                onClick={handleResetToDefaults}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>
            </div>
          </div>

          {/* Add New Rule Form */}
          {isAddingNew && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-3">Add New Discount Rule</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Category</label>
                  <input
                    type="text"
                    value={newRule.category}
                    onChange={(e) => setNewRule({...newRule, category: e.target.value})}
                    className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., P4X4, TBR"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Brand</label>
                  <input
                    type="text"
                    value={newRule.brand}
                    onChange={(e) => setNewRule({...newRule, brand: e.target.value})}
                    className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., MICHELIN, BF GOODRICH"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Discount %</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={newRule.discountPercentage}
                    onChange={(e) => setNewRule({...newRule, discountPercentage: parseFloat(e.target.value) || 0})}
                    className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 22.77"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleAddNewRule}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingNew(false);
                      setNewRule({ category: '', brand: '', discountPercentage: 0 });
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount %</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {editingRule?.id === rule.id ? (
                        <input
                          type="text"
                          value={editingRule.category}
                          onChange={(e) => setEditingRule({...editingRule, category: e.target.value})}
                          className="w-full p-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{rule.category}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingRule?.id === rule.id ? (
                        <input
                          type="text"
                          value={editingRule.brand}
                          onChange={(e) => setEditingRule({...editingRule, brand: e.target.value})}
                          className="w-full p-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-gray-700">{rule.brand || '(Any)'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingRule?.id === rule.id ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={editingRule.discountPercentage * 100}
                          onChange={(e) => setEditingRule({
                            ...editingRule, 
                            discountPercentage: (parseFloat(e.target.value) || 0) / 100
                          })}
                          className="w-full p-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="font-bold text-blue-600">
                          {(rule.discountPercentage * 100).toFixed(2)}%
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingRule?.id === rule.id ? (
                        <select
                          value={editingRule.isActive ? 'active' : 'inactive'}
                          onChange={(e) => setEditingRule({
                            ...editingRule, 
                            isActive: e.target.value === 'active'
                          })}
                          className="p-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      ) : (
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          rule.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(rule.lastModified).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {rule.createdBy}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editingRule?.id === rule.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleSaveRule(editingRule)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Save changes"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingRule(null)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            title="Cancel editing"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditingRule(rule)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit rule"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRules.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No discount rules found matching the current filters.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Total Rules: {discountRules.length} | Filtered: {filteredRules.length} | 
              Active: {discountRules.filter(r => r.isActive).length}
            </div>
            <div className="text-xs text-gray-500">
              ⚠️ Changes apply to all users immediately. Discounts are calculated automatically based on item category and brand.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDiscountManagement;

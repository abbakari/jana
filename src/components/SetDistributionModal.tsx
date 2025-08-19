import React, { useState, useMemo } from 'react';
import { X, PieChart, Search, Calculator, Percent, Filter, ChevronDown, Calendar, TrendingUp, Info } from 'lucide-react';

interface MonthlyBudget {
  month: string;
  budgetValue: number;
  actualValue: number;
  rate: number;
  stock: number;
  git: number;
  discount: number;
}

interface SalesBudgetItem {
  id: number;
  selected: boolean;
  customer: string;
  item: string;
  category: string;
  brand: string;
  budget2026: number;
  monthlyData: MonthlyBudget[];
}

interface SetDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: SalesBudgetItem[];
  selectedCustomer: string;
  selectedCategory: string;
  selectedBrand: string;
  selectedItem: string;
  onApplyDistribution: (distributionData: { [itemId: number]: MonthlyBudget[] }) => void;
}

// Seasonal patterns and holiday information for intelligent distribution
const SEASONAL_DATA = {
  // Business activity multipliers (1.0 = normal, >1.0 = higher activity, <1.0 = lower activity)
  businessActivity: {
    'JAN': 0.85, // Post-holiday slowdown
    'FEB': 0.95, // Building up
    'MAR': 1.15, // Strong business quarter
    'APR': 1.20, // Peak business activity
    'MAY': 1.25, // Excellent weather, high activity
    'JUN': 1.10, // Good business month
    'JUL': 0.90, // Summer slowdown
    'AUG': 0.85, // Vacation period
    'SEP': 1.15, // Back to business
    'OCT': 1.20, // Strong autumn activity
    'NOV': 1.05, // Pre-holiday rush starts
    'DEC': 0.75  // Holiday season, business slowdown
  },
  
  // Holiday impact (lower values = more holidays/less business days)
  holidayImpact: {
    'JAN': 0.90, // New Year holidays
    'FEB': 1.00, // Normal
    'MAR': 1.00, // Normal
    'APR': 0.95, // Easter period
    'MAY': 0.90, // Labor Day and spring holidays
    'JUN': 1.00, // Normal
    'JUL': 0.85, // Summer holidays
    'AUG': 0.80, // Peak vacation time
    'SEP': 1.00, // Normal
    'OCT': 1.00, // Normal
    'NOV': 0.95, // Thanksgiving period
    'DEC': 0.70  // Christmas/New Year holidays
  },
  
  // Industry-specific patterns for different categories
  industryPatterns: {
    'Tyres': {
      'JAN': 0.90, // Winter tire change season ending
      'FEB': 0.85,
      'MAR': 1.10, // Spring tire change begins
      'APR': 1.25, // Peak spring tire season
      'MAY': 1.20,
      'JUN': 1.15,
      'JUL': 1.00,
      'AUG': 0.95,
      'SEP': 1.15, // Autumn tire change begins
      'OCT': 1.30, // Peak autumn tire season
      'NOV': 1.10,
      'DEC': 0.80
    },
    'Accessories': {
      'JAN': 0.80,
      'FEB': 0.90,
      'MAR': 1.15,
      'APR': 1.20,
      'MAY': 1.25,
      'JUN': 1.15,
      'JUL': 1.05,
      'AUG': 0.95,
      'SEP': 1.10,
      'OCT': 1.20,
      'NOV': 1.00,
      'DEC': 0.85
    },
    'TYRE SERVICE': {
      'JAN': 0.85,
      'FEB': 0.90,
      'MAR': 1.20,
      'APR': 1.30,
      'MAY': 1.25,
      'JUN': 1.10,
      'JUL': 1.00,
      'AUG': 0.90,
      'SEP': 1.15,
      'OCT': 1.25,
      'NOV': 1.05,
      'DEC': 0.80
    }
  }
};

const SetDistributionModal: React.FC<SetDistributionModalProps> = ({
  isOpen,
  onClose,
  items,
  selectedCustomer,
  selectedCategory,
  selectedBrand,
  selectedItem,
  onApplyDistribution
}) => {
  const [distributionType, setDistributionType] = useState<'equal' | 'percentage' | 'seasonal'>('seasonal');
  const [filterCustomer, setFilterCustomer] = useState(selectedCustomer || '');
  const [filterCategory, setFilterCategory] = useState(selectedCategory || '');
  const [filterBrand, setFilterBrand] = useState(selectedBrand || '');
  const [filterItem, setFilterItem] = useState(selectedItem || '');
  const [itemQuantity, setItemQuantity] = useState<number>(0);
  const [percentageValue, setPercentageValue] = useState<number>(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSeasonalInfo, setShowSeasonalInfo] = useState(false);

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  // Get unique values for dropdown filters
  const uniqueValues = useMemo(() => {
    const customers = Array.from(new Set(items.map(item => item.customer))).sort();
    const categories = Array.from(new Set(items.map(item => item.category))).sort();
    const brands = Array.from(new Set(items.map(item => item.brand))).sort();
    const itemNames = Array.from(new Set(items.map(item => item.item))).sort();

    return { customers, categories, brands, itemNames };
  }, [items]);

  // Get customer-specific combinations for the selected customer
  const customerCombinations = useMemo(() => {
    if (!filterCustomer) return [];

    const combinations = items
      .filter(item => item.customer === filterCustomer)
      .map(item => ({
        id: item.id,
        customer: item.customer,
        category: item.category,
        brand: item.brand,
        item: item.item,
        budget2026: item.budget2026,
        combination: `${item.category} - ${item.brand} - ${item.item}`
      }));

    return combinations;
  }, [items, filterCustomer]);

  // Filter items based on all selected criteria
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCustomer = !filterCustomer || item.customer === filterCustomer;
      const matchesCategory = !filterCategory || item.category === filterCategory;
      const matchesBrand = !filterBrand || item.brand === filterBrand;
      const matchesItem = !filterItem || item.item.toLowerCase().includes(filterItem.toLowerCase());
      
      return matchesCustomer && matchesCategory && matchesBrand && matchesItem;
    });
  }, [items, filterCustomer, filterCategory, filterBrand, filterItem]);

  // Calculate seasonal distribution factors for a given category
  const getSeasonalFactors = (category: string): number[] => {
    const businessFactors = Object.values(SEASONAL_DATA.businessActivity);
    const holidayFactors = Object.values(SEASONAL_DATA.holidayImpact);
    const industryFactors = Object.values(SEASONAL_DATA.industryPatterns[category as keyof typeof SEASONAL_DATA.industryPatterns] || SEASONAL_DATA.industryPatterns['Accessories']);

    // Combine all factors to create comprehensive seasonal multipliers
    const combinedFactors = businessFactors.map((business, index) => {
      const holiday = holidayFactors[index];
      const industry = industryFactors[index];
      return business * holiday * industry;
    });

    return combinedFactors;
  };

  // Smart seasonal distribution logic
  const distributeSeasonally = (quantity: number, category: string): number[] => {
    const seasonalFactors = getSeasonalFactors(category);
    const totalFactor = seasonalFactors.reduce((sum, factor) => sum + factor, 0);
    
    // Calculate ideal distribution based on seasonal factors
    const idealDistribution = seasonalFactors.map(factor => 
      Math.round((quantity * factor) / totalFactor)
    );

    // Adjust for rounding errors to ensure total equals the target quantity
    const currentTotal = idealDistribution.reduce((sum, value) => sum + value, 0);
    const difference = quantity - currentTotal;

    if (difference !== 0) {
      // Distribute the difference to months with highest seasonal factors
      const monthFactors = seasonalFactors.map((factor, index) => ({ factor, index }));
      monthFactors.sort((a, b) => b.factor - a.factor);

      let remainingDiff = Math.abs(difference);
      const direction = difference > 0 ? 1 : -1;

      for (let i = 0; i < monthFactors.length && remainingDiff > 0; i++) {
        const monthIndex = monthFactors[i].index;
        if (direction > 0 || idealDistribution[monthIndex] > 0) {
          idealDistribution[monthIndex] += direction;
          remainingDiff--;
        }
      }
    }

    return idealDistribution;
  };

  // Traditional equal distribution logic
  const distributeQuantityEqually = (quantity: number): number[] => {
    const baseAmount = Math.floor(quantity / 12);
    const remainder = quantity % 12;

    const distribution = new Array(12).fill(baseAmount);

    for (let i = 0; i < remainder && i < 12; i++) {
      distribution[i] += 1;
    }

    if (remainder > 12) {
      const extraRemainder = remainder - 12;
      for (let i = 0; i < extraRemainder; i++) {
        const monthIndex = 11 - i;
        distribution[monthIndex] += 1;
      }
    }

    return distribution;
  };

  const distributeByPercentage = (totalBudget: number, percentage: number): number[] => {
    const amountToDistribute = Math.round((totalBudget * percentage) / 100);
    return distributeQuantityEqually(amountToDistribute);
  };

  const handleApplyDistribution = () => {
    if (!filterCustomer) {
      alert('Please select a customer first');
      return;
    }

    if (distributionType !== 'seasonal' && !itemQuantity && !percentageValue) {
      alert('Please enter a quantity or percentage value');
      return;
    }

    if (filteredItems.length === 0) {
      alert('No items found with the selected criteria');
      return;
    }

    const distributionData: { [itemId: number]: MonthlyBudget[] } = {};

    filteredItems.forEach(item => {
      const newMonthlyData = [...item.monthlyData];
      let distribution: number[];

      if (distributionType === 'seasonal') {
        // Use seasonal distribution based on current budget or quantity
        const quantityToDistribute = itemQuantity > 0 ? itemQuantity : item.budget2026;
        distribution = distributeSeasonally(quantityToDistribute, item.category);
      } else if (distributionType === 'equal') {
        distribution = distributeQuantityEqually(itemQuantity);
      } else {
        distribution = distributeByPercentage(item.budget2026, percentageValue);
      }

      // Apply distribution to monthly data
      newMonthlyData.forEach((monthData, index) => {
        monthData.budgetValue = distribution[index];
      });

      distributionData[item.id] = newMonthlyData;
    });

    onApplyDistribution(distributionData);
    onClose();

    // Reset form
    setItemQuantity(0);
    setPercentageValue(0);
  };

  const clearAllFilters = () => {
    setFilterCustomer('');
    setFilterCategory('');
    setFilterBrand('');
    setFilterItem('');
  };

  // Preview seasonal distribution for the selected category
  const previewSeasonalDistribution = useMemo(() => {
    if (!filterCategory && filteredItems.length === 0) return null;
    
    const category = filterCategory || filteredItems[0]?.category || 'Accessories';
    const sampleQuantity = itemQuantity || 120; // Default preview quantity
    const distribution = distributeSeasonally(sampleQuantity, category);
    
    return distribution.map((value, index) => ({
      month: months[index],
      value,
      factor: getSeasonalFactors(category)[index]
    }));
  }, [filterCategory, filteredItems, itemQuantity, months]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PieChart className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Intelligent Seasonal Distribution</h2>
                <p className="text-sm text-gray-600">
                  {filteredItems.length > 0 
                    ? `${filteredItems.length} item(s) selected for smart distribution`
                    : 'Select customer and criteria to begin'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Filter Selection */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter Criteria
              </h3>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              >
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Customer Selection - Always visible */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer *
                </label>
                <select
                  value={filterCustomer}
                  onChange={(e) => {
                    setFilterCustomer(e.target.value);
                    setFilterCategory('');
                    setFilterBrand('');
                    setFilterItem('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select Customer</option>
                  {uniqueValues.customers.map(customer => (
                    <option key={customer} value={customer}>{customer}</option>
                  ))}
                </select>
              </div>

              {filterCustomer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Combinations ({customerCombinations.length})
                  </label>
                  <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded border max-h-20 overflow-y-auto">
                    {customerCombinations.map((combo, idx) => (
                      <div key={combo.id} className="text-xs">
                        {idx + 1}. {combo.combination} (Budget: {combo.budget2026})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-blue-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={!filterCustomer}
                  >
                    <option value="">All Categories</option>
                    {uniqueValues.categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <select
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={!filterCustomer}
                  >
                    <option value="">All Brands</option>
                    {uniqueValues.brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Search
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      value={filterItem}
                      onChange={(e) => setFilterItem(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Search items..."
                      disabled={!filterCustomer}
                    />
                  </div>
                </div>
              </div>
            )}

            {(filterCustomer || filterCategory || filterBrand || filterItem) && (
              <div className="flex justify-end pt-3">
                <button
                  onClick={clearAllFilters}
                  className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Selected Items Preview */}
          {filteredItems.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">
                Selected Items for Distribution ({filteredItems.length})
              </h3>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {filteredItems.map(item => (
                  <div key={item.id} className="text-sm text-green-700 bg-white p-2 rounded border">
                    <div className="font-medium">{item.customer}</div>
                    <div className="text-xs">{item.category} - {item.brand} - {item.item}</div>
                    <div className="text-xs text-gray-600">Current Budget 2026: {item.budget2026}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Distribution Type */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Distribution Strategy</h3>
            <div className="space-y-2">
              <label className="flex items-center p-3 border-2 border-green-200 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100">
                <input
                  type="radio"
                  name="distributionType"
                  value="seasonal"
                  checked={distributionType === 'seasonal'}
                  onChange={(e) => setDistributionType(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex items-center gap-2 flex-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium text-green-800">🌟 Smart Seasonal Distribution (Recommended)</div>
                    <div className="text-sm text-green-700">AI-powered distribution considering holidays, business patterns, and industry trends</div>
                  </div>
                  <button
                    onClick={() => setShowSeasonalInfo(!showSeasonalInfo)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="distributionType"
                  value="equal"
                  checked={distributionType === 'equal'}
                  onChange={(e) => setDistributionType(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Equal Distribution</div>
                    <div className="text-sm text-gray-600">Enter quantity to distribute equally</div>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="distributionType"
                  value="percentage"
                  checked={distributionType === 'percentage'}
                  onChange={(e) => setDistributionType(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-orange-600" />
                  <div>
                    <div className="font-medium">Percentage Distribution</div>
                    <div className="text-sm text-gray-600">Enter percentage of BUD 2026</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Seasonal Information Panel */}
          {showSeasonalInfo && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                How Smart Seasonal Distribution Works
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium text-blue-800 mb-2">🏢 Business Activity</div>
                  <div className="text-gray-700">
                    • Higher allocation to peak business months (Mar-May, Sep-Oct)<br/>
                    • Lower allocation during slow periods (Jul-Aug, Dec-Jan)
                  </div>
                </div>
                <div>
                  <div className="font-medium text-red-800 mb-2">🎄 Holiday Impact</div>
                  <div className="text-gray-700">
                    • Reduced allocation during holiday months<br/>
                    • Accounts for vacation periods and business closures
                  </div>
                </div>
                <div>
                  <div className="font-medium text-purple-800 mb-2">🏭 Industry Patterns</div>
                  <div className="text-gray-700">
                    • Tire categories: Peak in spring/autumn seasons<br/>
                    • Accessories: Steady with seasonal adjustments
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Seasonal Distribution Preview */}
          {distributionType === 'seasonal' && previewSeasonalDistribution && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-800 mb-3">📊 Seasonal Distribution Preview</h4>
              <div className="grid grid-cols-6 gap-2 text-xs">
                {previewSeasonalDistribution.map((monthData, index) => {
                  const isHighMonth = monthData.factor > 1.1;
                  const isLowMonth = monthData.factor < 0.9;
                  return (
                    <div key={index} className={`p-2 rounded text-center ${
                      isHighMonth ? 'bg-green-100 text-green-800' : 
                      isLowMonth ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="font-medium">{monthData.month}</div>
                      <div className="text-lg font-bold">{monthData.value}</div>
                      <div className="text-xs">({(monthData.factor * 100).toFixed(0)}%)</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center">
                Green: High activity months | Red: Low activity/holiday months | Gray: Normal months
              </div>
            </div>
          )}

          {/* Input Fields for non-seasonal distribution */}
          {distributionType === 'seasonal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Distribute (Optional)
              </label>
              <input
                type="number"
                value={itemQuantity || ''}
                onChange={(e) => setItemQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Leave empty to use current Budget 2026 values"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                If empty, system will use each item's current Budget 2026 value for seasonal distribution
              </p>
            </div>
          )}

          {distributionType === 'equal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Quantity
              </label>
              <input
                type="number"
                value={itemQuantity || ''}
                onChange={(e) => setItemQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter quantity (e.g. 13)"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                System will fill Jan→Dec first, then Dec→Nov→Jan if remainder
              </p>
            </div>
          )}

          {distributionType === 'percentage' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percentage of BUD 2026
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={percentageValue || ''}
                  onChange={(e) => setPercentageValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter percentage (e.g. 25)"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <Percent className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                System will calculate amount and distribute equally
              </p>
            </div>
          )}

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm">
              <div className="font-medium text-blue-800 mb-1">
                Distribution Summary
              </div>
              <div className="text-blue-700 space-y-1">
                <div>• Strategy: {
                  distributionType === 'seasonal' ? '🌟 Smart Seasonal Distribution' :
                  distributionType === 'equal' ? '📊 Equal Distribution' :
                  '📈 Percentage Distribution'
                }</div>
                <div>• Customer: {filterCustomer || 'Not selected'}</div>
                {filterCategory && <div>• Category: {filterCategory}</div>}
                {filterBrand && <div>• Brand: {filterBrand}</div>}
                {filterItem && <div>• Item Filter: "{filterItem}"</div>}
                <div>• Items to update: {filteredItems.length}</div>
                {distributionType === 'seasonal' && (
                  <div>• ✨ AI-optimized distribution based on business patterns, holidays, and industry trends</div>
                )}
                {distributionType === 'equal' && itemQuantity > 0 && (
                  <div>• {itemQuantity} items distributed across 12 months (Jan→Dec priority)</div>
                )}
                {distributionType === 'percentage' && percentageValue > 0 && (
                  <div>• {percentageValue}% of each item's BUD 2026 distributed equally</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyDistribution}
              disabled={
                !filterCustomer || 
                filteredItems.length === 0 || 
                (distributionType !== 'seasonal' && !itemQuantity && !percentageValue)
              }
              className="flex-1 bg-gradient-to-r from-purple-600 to-green-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Apply {distributionType === 'seasonal' ? 'Smart' : ''} Distribution to {filteredItems.length} Item(s)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetDistributionModal;

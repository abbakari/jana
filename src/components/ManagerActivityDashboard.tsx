import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Users, Activity, MessageCircle, Eye, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { ActivityLogger, ActivityLog, ActivityFilter } from '../utils/activityLogger';
import { useAuth } from '../contexts/AuthContext';

interface ManagerActivityDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManagerActivityDashboard: React.FC<ManagerActivityDashboardProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [summary, setSummary] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      loadActivities();
      loadSummary();
    }
  }, [isOpen]);

  useEffect(() => {
    applyFilters();
  }, [activities, searchTerm, selectedModule, selectedUser, selectedCategory, dateFilter]);

  const loadActivities = () => {
    // Get all salesman activities for managers
    const salesmanActivities = ActivityLogger.getActivitiesByRole('salesman', user?.role || 'manager');
    setActivities(salesmanActivities);
  };

  const loadSummary = () => {
    const activitySummary = ActivityLogger.getActivitySummary();
    setSummary(activitySummary);
  };

  const applyFilters = () => {
    let filtered = [...activities];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply module filter
    if (selectedModule) {
      filtered = filtered.filter(activity => activity.module === selectedModule);
    }

    // Apply user filter
    if (selectedUser) {
      filtered = filtered.filter(activity => activity.userName === selectedUser);
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(activity => activity.category === selectedCategory);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();

      switch (dateFilter) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(activity => new Date(activity.timestamp) >= cutoffDate);
    }

    setFilteredActivities(filtered);
  };

  const getUniqueUsers = () => {
    return [...new Set(activities.map(a => a.userName))].sort();
  };

  const getActionIcon = (module: string, category: string) => {
    if (module === 'sales_budget') return '💰';
    if (module === 'rolling_forecast') return '📊';
    if (module === 'communication') return '💬';
    if (category === 'submit') return '����';
    if (category === 'create') return '➕';
    if (category === 'update') return '✏️';
    if (category === 'delete') return '🗑️';
    return '📝';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Manager Activity Dashboard</h2>
              <p className="text-sm text-gray-600">Monitor all salesman activities and system interactions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="text-sm text-blue-600 font-medium">Total Activities</div>
                  <div className="text-xl font-bold text-blue-900">{summary.totalActivities || 0}</div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-green-600" />
                <div>
                  <div className="text-sm text-green-600 font-medium">Active Users</div>
                  <div className="text-xl font-bold text-green-900">
                    {Object.keys(summary.activitiesByUser || {}).length}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <div>
                  <div className="text-sm text-purple-600 font-medium">Sales Budget Activities</div>
                  <div className="text-xl font-bold text-purple-900">
                    {summary.activitiesByModule?.sales_budget || 0}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <div>
                  <div className="text-sm text-orange-600 font-medium">Recent (24h)</div>
                  <div className="text-xl font-bold text-orange-900">{summary.recentActivities || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Module Filter */}
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Modules</option>
              <option value="sales_budget">Sales Budget</option>
              <option value="rolling_forecast">Rolling Forecast</option>
              <option value="communication">Communication</option>
              <option value="stock_management">Stock Management</option>
            </select>

            {/* User Filter */}
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              {getUniqueUsers().map(userName => (
                <option key={userName} value={userName}>{userName}</option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="submit">Submit</option>
              <option value="message">Message</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="all">All Time</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={() => {
                loadActivities();
                loadSummary();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Activity List */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-3">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No activities found matching the current filters.
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">
                        {getActionIcon(activity.module, activity.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{activity.userName}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(activity.severity)}`}>
                            {activity.severity}
                          </span>
                          <span className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</span>
                        </div>
                        <div className="text-sm text-gray-800 mb-2">
                          <strong>{activity.action}</strong> on <em>{activity.entity}</em>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="bg-gray-100 px-2 py-1 rounded">{activity.module.replace('_', ' ')}</span>
                          <span className="bg-gray-100 px-2 py-1 rounded">{activity.category}</span>
                        </div>
                        {activity.details.changes && activity.details.changes.length > 0 && (
                          <div className="mt-2 text-xs text-gray-600">
                            <strong>Changes:</strong> {activity.details.changes.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // TODO: Implement detailed view
                          alert(`Activity Details:\n${JSON.stringify(activity.details, null, 2)}`);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Implement messaging
                          alert(`Send message to ${activity.userName}`);
                        }}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Send message"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredActivities.length} of {activities.length} activities
            </div>
            <div className="text-xs text-gray-500">
              🔄 Activities auto-refresh every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerActivityDashboard;

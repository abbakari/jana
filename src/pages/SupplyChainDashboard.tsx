import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Activity, 
  MessageCircle, 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  Filter, 
  Send, 
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { ActivityLogger, ActivityLog } from '../utils/activityLogger';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  fromUser: string;
  fromRole: string;
  toUser: string;
  toRole: string;
  subject: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedActivity?: string;
}

const SupplyChainDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [dateFilter, setDateFilter] = useState('week');
  const [activeTab, setActiveTab] = useState('activities');
  const [summary, setSummary] = useState<any>({});
  
  // Messaging state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
  const [messageForm, setMessageForm] = useState({
    toUser: '',
    toRole: '',
    subject: '',
    message: '',
    priority: 'medium' as Message['priority']
  });

  useEffect(() => {
    loadActivities();
    loadMessages();
    loadSummary();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activities, searchTerm, selectedModule, selectedUser, dateFilter]);

  const loadActivities = () => {
    // Supply chain can see all salesman and manager activities
    const allActivities = ActivityLogger.getActivitiesByRole('all', 'supply_chain');
    setActivities(allActivities);
  };

  const loadMessages = () => {
    // Load messages from localStorage
    try {
      const stored = localStorage.getItem('supply_chain_messages');
      const storedMessages = stored ? JSON.parse(stored) : [];
      setMessages(storedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const loadSummary = () => {
    const activitySummary = ActivityLogger.getActivitySummary();
    
    // Add supply chain specific metrics
    const recentActivities = ActivityLogger.getRecentActivities(24);
    const criticalActivities = activities.filter(a => a.severity === 'critical' || a.severity === 'high');
    
    setSummary({
      ...activitySummary,
      criticalActivities: criticalActivities.length,
      pendingActions: criticalActivities.filter(a => a.category === 'submit').length,
      unreadMessages: messages.filter(m => !m.read && m.toRole === 'supply_chain').length
    });
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

  const sendMessage = (message: Omit<Message, 'id' | 'timestamp' | 'read' | 'fromUser' | 'fromRole'>) => {
    if (!user) return;

    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromUser: user.name,
      fromRole: user.role,
      timestamp: new Date().toISOString(),
      read: false
    };

    const updatedMessages = [newMessage, ...messages];
    setMessages(updatedMessages);
    localStorage.setItem('supply_chain_messages', JSON.stringify(updatedMessages));

    // Log the communication activity
    ActivityLogger.logCommunicationActivity(
      user,
      `Sent message to ${message.toUser}`,
      `Message: ${message.subject}`,
      {
        recipients: [message.toUser],
        subject: message.subject,
        priority: message.priority
      }
    );

    setIsComposeOpen(false);
    setMessageForm({
      toUser: '',
      toRole: '',
      subject: '',
      message: '',
      priority: 'medium'
    });
  };

  const composeMessage = (activity?: ActivityLog) => {
    if (activity) {
      setMessageForm({
        toUser: activity.userName,
        toRole: activity.userRole,
        subject: `Re: ${activity.action}`,
        message: `Regarding your recent activity: ${activity.action} on ${activity.entity}\n\n`,
        priority: activity.severity === 'critical' ? 'urgent' : activity.severity === 'high' ? 'high' : 'medium'
      });
      setSelectedActivity(activity);
    } else {
      setMessageForm({
        toUser: '',
        toRole: '',
        subject: '',
        message: '',
        priority: 'medium'
      });
      setSelectedActivity(null);
    }
    setIsComposeOpen(true);
  };

  const getActionIcon = (module: string, category: string) => {
    if (module === 'sales_budget') return '💰';
    if (module === 'rolling_forecast') return '📊';
    if (module === 'communication') return '💬';
    if (category === 'submit') return '📤';
    if (category === 'create') return '➕';
    if (category === 'update') return '✏️';
    if (category === 'delete') return '🗑️';
    return '📝';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-300';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'medium': return 'text-blue-600 bg-blue-100 border-blue-300';
      case 'low': return 'text-gray-600 bg-gray-100 border-gray-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
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

  if (user?.role !== 'supply_chain') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">Only supply chain personnel can access this dashboard.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Supply Chain Dashboard</h1>
            <p className="text-gray-600">Monitor all activities from sales teams and managers</p>
          </div>
          <button
            onClick={() => composeMessage()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>New Message</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-blue-600" />
              <div>
                <div className="text-sm text-blue-600 font-medium">Total Activities</div>
                <div className="text-xl font-bold text-blue-900">{summary.totalActivities || 0}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <div className="text-sm text-red-600 font-medium">Critical Items</div>
                <div className="text-xl font-bold text-red-900">{summary.criticalActivities || 0}</div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-orange-600" />
              <div>
                <div className="text-sm text-orange-600 font-medium">Pending Actions</div>
                <div className="text-xl font-bold text-orange-900">{summary.pendingActions || 0}</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-green-600" />
              <div>
                <div className="text-sm text-green-600 font-medium">Unread Messages</div>
                <div className="text-xl font-bold text-green-900">{summary.unreadMessages || 0}</div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <div>
                <div className="text-sm text-purple-600 font-medium">Recent (24h)</div>
                <div className="text-xl font-bold text-purple-900">{summary.recentActivities || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('activities')}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'activities'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Activities Monitor
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors relative ${
              activeTab === 'messages'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Messages
            {summary.unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {summary.unreadMessages}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Analytics
          </button>
        </div>

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                  {[...new Set(activities.map(a => a.userName))].sort().map(userName => (
                    <option key={userName} value={userName}>{userName}</option>
                  ))}
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="space-y-3">
                  {filteredActivities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No activities found matching the current filters.
                    </div>
                  ) : (
                    filteredActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${getSeverityColor(activity.severity)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">
                              {getActionIcon(activity.module, activity.category)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">{activity.userName}</span>
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                  {activity.userRole}
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
                              onClick={() => composeMessage(activity)}
                              className="text-green-600 hover:text-green-800 transition-colors p-2 hover:bg-green-50 rounded"
                              title="Send message to user"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                alert(`Activity Details:\n${JSON.stringify(activity.details, null, 2)}`);
                              }}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No messages found. Start a conversation with the team!
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`border rounded-lg p-4 ${!message.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{message.fromUser}</span>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                          {message.fromRole}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                    </div>
                    <div className="font-medium text-gray-900 mb-2">{message.subject}</div>
                    <div className="text-sm text-gray-700">{message.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Activities by Module</h3>
                <div className="space-y-3">
                  {Object.entries(summary.activitiesByModule || {}).map(([module, count]) => (
                    <div key={module} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{module.replace('_', ' ')}</span>
                      <span className="font-bold text-gray-900">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Activities by User</h3>
                <div className="space-y-3">
                  {Object.entries(summary.activitiesByUser || {}).slice(0, 10).map(([user, count]) => (
                    <div key={user} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{user}</span>
                      <span className="font-bold text-gray-900">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compose Message Modal */}
        {isComposeOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Send Message</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To User</label>
                    <input
                      type="text"
                      value={messageForm.toUser}
                      onChange={(e) => setMessageForm({...messageForm, toUser: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={messageForm.subject}
                      onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Message subject"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={messageForm.priority}
                      onChange={(e) => setMessageForm({...messageForm, priority: e.target.value as Message['priority']})}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      value={messageForm.message}
                      onChange={(e) => setMessageForm({...messageForm, message: e.target.value})}
                      rows={4}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your message"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsComposeOpen(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => sendMessage(messageForm)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SupplyChainDashboard;

import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, X, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { ActivityLogger } from '../utils/activityLogger';
import { useAuth } from '../contexts/AuthContext';

export interface Message {
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
  replyTo?: string;
}

interface MessagingSystemProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledMessage?: {
    toUser?: string;
    toRole?: string;
    subject?: string;
    message?: string;
    priority?: Message['priority'];
    relatedActivity?: string;
  };
}

const MessagingSystem: React.FC<MessagingSystemProps> = ({
  isOpen,
  onClose,
  prefilledMessage
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState('inbox');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Compose form state
  const [messageForm, setMessageForm] = useState({
    toUser: '',
    toRole: '',
    subject: '',
    message: '',
    priority: 'medium' as Message['priority'],
    relatedActivity: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      if (prefilledMessage) {
        setMessageForm({
          toUser: prefilledMessage.toUser || '',
          toRole: prefilledMessage.toRole || '',
          subject: prefilledMessage.subject || '',
          message: prefilledMessage.message || '',
          priority: prefilledMessage.priority || 'medium',
          relatedActivity: prefilledMessage.relatedActivity || ''
        });
        setIsComposeOpen(true);
      }
    }
  }, [isOpen, prefilledMessage]);

  useEffect(() => {
    filterMessages();
  }, [messages, activeTab, searchTerm]);

  const loadMessages = () => {
    try {
      const stored = localStorage.getItem('system_messages');
      const allMessages: Message[] = stored ? JSON.parse(stored) : [];
      setMessages(allMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const filterMessages = () => {
    if (!user) return;

    let filtered = messages.filter(msg => {
      const isInvolved = msg.fromUser === user.name || msg.toUser === user.name || 
                        msg.fromRole === user.role || msg.toRole === user.role;
      return isInvolved;
    });

    // Apply tab filter
    if (activeTab === 'inbox') {
      filtered = filtered.filter(msg => msg.toUser === user.name || msg.toRole === user.role);
    } else if (activeTab === 'sent') {
      filtered = filtered.filter(msg => msg.fromUser === user.name);
    } else if (activeTab === 'unread') {
      filtered = filtered.filter(msg => !msg.read && (msg.toUser === user.name || msg.toRole === user.role));
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(msg =>
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.fromUser.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredMessages(filtered);
  };

  const sendMessage = () => {
    if (!user || !messageForm.toUser || !messageForm.subject || !messageForm.message) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromUser: user.name,
      fromRole: user.role,
      toUser: messageForm.toUser,
      toRole: messageForm.toRole,
      subject: messageForm.subject,
      message: messageForm.message,
      timestamp: new Date().toISOString(),
      read: false,
      priority: messageForm.priority,
      relatedActivity: messageForm.relatedActivity
    };

    const updatedMessages = [newMessage, ...messages];
    setMessages(updatedMessages);
    localStorage.setItem('system_messages', JSON.stringify(updatedMessages));

    // Log the communication activity
    ActivityLogger.logCommunicationActivity(
      user,
      `Sent message to ${messageForm.toUser}`,
      `Message: ${messageForm.subject}`,
      {
        recipients: [messageForm.toUser],
        subject: messageForm.subject,
        priority: messageForm.priority,
        relatedActivity: messageForm.relatedActivity
      }
    );

    // Reset form and close compose
    setMessageForm({
      toUser: '',
      toRole: '',
      subject: '',
      message: '',
      priority: 'medium',
      relatedActivity: ''
    });
    setIsComposeOpen(false);
  };

  const markAsRead = (messageId: string) => {
    const updatedMessages = messages.map(msg =>
      msg.id === messageId ? { ...msg, read: true } : msg
    );
    setMessages(updatedMessages);
    localStorage.setItem('system_messages', JSON.stringify(updatedMessages));
  };

  const replyToMessage = (originalMessage: Message) => {
    setMessageForm({
      toUser: originalMessage.fromUser,
      toRole: originalMessage.fromRole,
      subject: `Re: ${originalMessage.subject}`,
      message: `\n\n--- Original Message ---\nFrom: ${originalMessage.fromUser}\nSubject: ${originalMessage.subject}\nDate: ${new Date(originalMessage.timestamp).toLocaleString()}\n\n${originalMessage.message}`,
      priority: originalMessage.priority,
      relatedActivity: originalMessage.relatedActivity || ''
    });
    setSelectedMessage(null);
    setIsComposeOpen(true);
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <Clock className="w-4 h-4" />;
      case 'medium': return <MessageCircle className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) return date.toLocaleTimeString();
    if (diffDays < 7) return date.toLocaleDateString();
    return date.toLocaleDateString();
  };

  const getUnreadCount = () => {
    if (!user) return 0;
    return messages.filter(msg => 
      !msg.read && (msg.toUser === user.name || msg.toRole === user.role)
    ).length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Messages</h2>
              <p className="text-sm text-gray-600">Communication center for all team members</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsComposeOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Compose
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`py-2 px-4 font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'inbox'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Inbox
              {getUnreadCount() > 0 && activeTab === 'inbox' && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {getUnreadCount()}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-2 px-4 font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'sent'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sent
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`py-2 px-4 font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'unread'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Unread
              {getUnreadCount() > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {getUnreadCount()}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-auto p-6">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No messages found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                    !message.read && (message.toUser === user?.name || message.toRole === user?.role)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200'
                  }`}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.read && (message.toUser === user?.name || message.toRole === user?.role)) {
                      markAsRead(message.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {activeTab === 'sent' ? `To: ${message.toUser}` : `From: ${message.fromUser}`}
                        </span>
                        <div className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${getPriorityColor(message.priority)}`}>
                          {getPriorityIcon(message.priority)}
                          <span>{message.priority}</span>
                        </div>
                        {!message.read && (message.toUser === user?.name || message.toRole === user?.role) && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <div className="font-medium text-gray-800 mb-1">{message.subject}</div>
                      <div className="text-sm text-gray-600 line-clamp-2">{message.message}</div>
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${getPriorityColor(selectedMessage.priority)}`}>
                        {getPriorityIcon(selectedMessage.priority)}
                        <span>{selectedMessage.priority}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedMessage.subject}</h3>
                    <div className="text-sm text-gray-600 mb-4">
                      <div>From: <strong>{selectedMessage.fromUser}</strong> ({selectedMessage.fromRole})</div>
                      <div>To: <strong>{selectedMessage.toUser}</strong> ({selectedMessage.toRole})</div>
                      <div>Date: {new Date(selectedMessage.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="whitespace-pre-wrap text-gray-800">{selectedMessage.message}</div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => replyToMessage(selectedMessage)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compose Modal */}
        {isComposeOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Compose Message</h3>
                  <button
                    onClick={() => setIsComposeOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
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
                      onClick={sendMessage}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
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
    </div>
  );
};

export default MessagingSystem;

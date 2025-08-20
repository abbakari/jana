export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: 'salesman' | 'manager' | 'admin' | 'supply_chain';
  action: string;
  module: 'sales_budget' | 'rolling_forecast' | 'stock_management' | 'discount_management' | 'git_management' | 'communication';
  entity: string; // customer-item combination or specific entity
  details: {
    before?: any;
    after?: any;
    changes?: string[];
    metadata?: any;
  };
  timestamp: string;
  category: 'create' | 'update' | 'delete' | 'view' | 'submit' | 'approve' | 'message' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isVisible: boolean;
  relatedUsers?: string[]; // Users who should be notified
}

export interface ActivityFilter {
  userId?: string;
  userRole?: string;
  module?: string;
  category?: string;
  severity?: string;
  dateFrom?: string;
  dateTo?: string;
  entity?: string;
}

export class ActivityLogger {
  private static STORAGE_KEY = 'system_activity_logs';
  private static MAX_LOGS = 10000; // Keep last 10k logs

  // Log activity
  static logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): string {
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullActivity: ActivityLog = {
      ...activity,
      id: activityId,
      timestamp: new Date().toISOString(),
    };

    try {
      const existingLogs = this.getAllActivities();
      const updatedLogs = [fullActivity, ...existingLogs];

      // Keep only the most recent logs
      if (updatedLogs.length > this.MAX_LOGS) {
        updatedLogs.splice(this.MAX_LOGS);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedLogs));
      
      console.log(`Activity logged: ${activity.action} by ${activity.userName} on ${activity.module}`);
      return activityId;
    } catch (error) {
      console.error('Error logging activity:', error);
      return '';
    }
  }

  // Get all activities
  static getAllActivities(): ActivityLog[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting activities:', error);
      return [];
    }
  }

  // Get filtered activities
  static getActivities(filter: ActivityFilter = {}): ActivityLog[] {
    const allActivities = this.getAllActivities();
    
    return allActivities.filter(activity => {
      if (filter.userId && activity.userId !== filter.userId) return false;
      if (filter.userRole && activity.userRole !== filter.userRole) return false;
      if (filter.module && activity.module !== filter.module) return false;
      if (filter.category && activity.category !== filter.category) return false;
      if (filter.severity && activity.severity !== filter.severity) return false;
      if (filter.entity && !activity.entity.toLowerCase().includes(filter.entity.toLowerCase())) return false;
      
      if (filter.dateFrom) {
        const activityDate = new Date(activity.timestamp);
        const fromDate = new Date(filter.dateFrom);
        if (activityDate < fromDate) return false;
      }
      
      if (filter.dateTo) {
        const activityDate = new Date(activity.timestamp);
        const toDate = new Date(filter.dateTo);
        if (activityDate > toDate) return false;
      }
      
      return activity.isVisible;
    });
  }

  // Get activities by user role (for managers to see salesman activities)
  static getActivitiesByRole(targetRole: string, viewerRole: string): ActivityLog[] {
    const allActivities = this.getAllActivities();

    return allActivities.filter(activity => {
      // Managers can see salesman activities
      if (viewerRole === 'manager' && targetRole === 'salesman') {
        return activity.userRole === 'salesman' && activity.isVisible;
      }

      // Supply chain can see manager and salesman activities
      if (viewerRole === 'supply_chain') {
        if (targetRole === 'all') {
          // Supply chain can see all activities from salesman and manager
          return (activity.userRole === 'salesman' || activity.userRole === 'manager') && activity.isVisible;
        }
        return (activity.userRole === 'salesman' || activity.userRole === 'manager') && activity.isVisible;
      }

      // Admin can see everything
      if (viewerRole === 'admin') {
        return activity.isVisible;
      }

      return false;
    });
  }

  // Get recent activities (last 24 hours)
  static getRecentActivities(hours: number = 24): ActivityLog[] {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);
    
    return this.getActivities({
      dateFrom: cutoffTime.toISOString()
    });
  }

  // Get activities for specific entity (customer-item combination)
  static getEntityActivities(entity: string): ActivityLog[] {
    return this.getActivities({ entity });
  }

  // Get summary statistics
  static getActivitySummary(): {
    totalActivities: number;
    activitiesByModule: {[module: string]: number};
    activitiesByUser: {[user: string]: number};
    activitiesByCategory: {[category: string]: number};
    recentActivities: number;
  } {
    const allActivities = this.getAllActivities();
    const recentActivities = this.getRecentActivities();
    
    const summary = {
      totalActivities: allActivities.length,
      activitiesByModule: {} as {[module: string]: number},
      activitiesByUser: {} as {[user: string]: number},
      activitiesByCategory: {} as {[category: string]: number},
      recentActivities: recentActivities.length
    };

    allActivities.forEach(activity => {
      // Count by module
      summary.activitiesByModule[activity.module] = 
        (summary.activitiesByModule[activity.module] || 0) + 1;
      
      // Count by user
      summary.activitiesByUser[activity.userName] = 
        (summary.activitiesByUser[activity.userName] || 0) + 1;
      
      // Count by category
      summary.activitiesByCategory[activity.category] = 
        (summary.activitiesByCategory[activity.category] || 0) + 1;
    });

    return summary;
  }

  // Delete old activities (cleanup)
  static cleanupOldActivities(daysToKeep: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const allActivities = this.getAllActivities();
    const filteredActivities = allActivities.filter(activity => 
      new Date(activity.timestamp) > cutoffDate
    );
    
    const removedCount = allActivities.length - filteredActivities.length;
    
    if (removedCount > 0) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredActivities));
      console.log(`Cleaned up ${removedCount} old activities`);
    }
    
    return removedCount;
  }

  // Helper methods for common activity types
  static logSalesBudgetActivity(
    user: {name: string, role: string}, 
    action: string, 
    entity: string, 
    details: any,
    category: ActivityLog['category'] = 'update'
  ) {
    return this.logActivity({
      userId: user.name,
      userName: user.name,
      userRole: user.role as any,
      action,
      module: 'sales_budget',
      entity,
      details,
      category,
      severity: category === 'submit' ? 'high' : 'medium',
      isVisible: true,
      relatedUsers: user.role === 'salesman' ? ['manager', 'supply_chain'] : ['supply_chain']
    });
  }

  static logRollingForecastActivity(
    user: {name: string, role: string}, 
    action: string, 
    entity: string, 
    details: any,
    category: ActivityLog['category'] = 'update'
  ) {
    return this.logActivity({
      userId: user.name,
      userName: user.name,
      userRole: user.role as any,
      action,
      module: 'rolling_forecast',
      entity,
      details,
      category,
      severity: category === 'submit' ? 'high' : 'medium',
      isVisible: true,
      relatedUsers: user.role === 'salesman' ? ['manager', 'supply_chain'] : ['supply_chain']
    });
  }

  static logDiscountActivity(
    user: {name: string, role: string}, 
    action: string, 
    entity: string, 
    details: any
  ) {
    return this.logActivity({
      userId: user.name,
      userName: user.name,
      userRole: user.role as any,
      action,
      module: 'discount_management',
      entity,
      details,
      category: 'update',
      severity: 'high',
      isVisible: true,
      relatedUsers: ['manager', 'salesman', 'supply_chain']
    });
  }

  static logCommunicationActivity(
    user: {name: string, role: string}, 
    action: string, 
    entity: string, 
    details: any
  ) {
    return this.logActivity({
      userId: user.name,
      userName: user.name,
      userRole: user.role as any,
      action,
      module: 'communication',
      entity,
      details,
      category: 'message',
      severity: 'medium',
      isVisible: true,
      relatedUsers: details.recipients || []
    });
  }
}

// Export for backward compatibility
export const logActivity = ActivityLogger.logActivity;
export const getActivities = ActivityLogger.getActivities;
export const getActivitiesByRole = ActivityLogger.getActivitiesByRole;

import { ActivityLogger } from './activityLogger';

export const initializeSampleActivities = (): boolean => {
  const existingActivities = ActivityLogger.getAllActivities();
  
  // Only initialize if no activities exist
  if (existingActivities.length > 0) {
    return false;
  }

  // Sample activities to demonstrate the system
  const sampleActivities = [
    {
      userId: 'john_salesman',
      userName: 'John Salesman',
      userRole: 'salesman' as const,
      action: 'Updated monthly budget distribution',
      module: 'sales_budget' as const,
      entity: 'Action Aid International (Tz) - BF GOODRICH TYRE 235/85R16',
      details: {
        changes: ['Monthly budget values updated', 'Total units: 1200', 'Net value: $408,000'],
        before: { budgetValue2026: 0 },
        after: { budgetValue2026: 408000 },
        metadata: { totalUnits: 1200, totalDiscount: 92000 }
      },
      category: 'update' as const,
      severity: 'medium' as const,
      isVisible: true,
      relatedUsers: ['manager', 'supply_chain']
    },
    {
      userId: 'jane_salesman',
      userName: 'Jane Salesman',
      userRole: 'salesman' as const,
      action: 'Applied seasonal growth distribution',
      module: 'sales_budget' as const,
      entity: 'ADVENT CONSTRUCTION LTD. - MICHELIN TYRE 265/65R17',
      details: {
        changes: ['Seasonal growth distribution applied'],
        metadata: { 
          strategy: 'Large Item Strategy',
          totalBudget: 800,
          itemValue: 240000,
          isLargeItem: true
        }
      },
      category: 'update' as const,
      severity: 'medium' as const,
      isVisible: true,
      relatedUsers: ['manager', 'supply_chain']
    },
    {
      userId: 'mike_salesman',
      userName: 'Mike Salesman',
      userRole: 'salesman' as const,
      action: 'Submitted 3 budget(s) for approval',
      module: 'sales_budget' as const,
      entity: 'Multiple items (3 budgets)',
      details: {
        changes: ['Submitted 3 budgets for approval'],
        metadata: { 
          workflowId: 'WF1234',
          budgetCount: 3,
          totalValue: 875000
        }
      },
      category: 'submit' as const,
      severity: 'high' as const,
      isVisible: true,
      relatedUsers: ['manager', 'supply_chain']
    },
    {
      userId: 'sarah_salesman',
      userName: 'Sarah Salesman',
      userRole: 'salesman' as const,
      action: 'Updated monthly forecast data',
      module: 'rolling_forecast' as const,
      entity: 'Action Aid International (Tz) - BF GOODRICH TYRE 265/65R17',
      details: {
        changes: ['Monthly forecast values updated for MAR'],
        before: { forecastValue: 0 },
        after: { forecastValue: 15 },
        metadata: { month: 'MAR', newTotal: 65 }
      },
      category: 'update' as const,
      severity: 'medium' as const,
      isVisible: true,
      relatedUsers: ['manager', 'supply_chain']
    },
    {
      userId: 'tom_salesman',
      userName: 'Tom Salesman',
      userRole: 'salesman' as const,
      action: 'Added new item to sales budget',
      module: 'sales_budget' as const,
      entity: 'New Customer - CONTINENTAL TYRE 275/70R22.5',
      details: {
        changes: ['New item created'],
        metadata: { 
          category: 'Tyres', 
          brand: 'Continental', 
          rate: 450, 
          stock: 25 
        }
      },
      category: 'create' as const,
      severity: 'medium' as const,
      isVisible: true,
      relatedUsers: ['manager', 'supply_chain']
    },
    {
      userId: 'anna_salesman',
      userName: 'Anna Salesman',
      userRole: 'salesman' as const,
      action: 'Submitted 2 forecast(s) for approval',
      module: 'rolling_forecast' as const,
      entity: 'Multiple items (2 forecasts)',
      details: {
        changes: ['Submitted 2 forecasts for approval'],
        metadata: { 
          workflowId: 'RF5678',
          forecastCount: 2,
          totalForecastUnits: 180
        }
      },
      category: 'submit' as const,
      severity: 'high' as const,
      isVisible: true,
      relatedUsers: ['manager', 'supply_chain']
    },
    {
      userId: 'bob_manager',
      userName: 'Bob Manager',
      userRole: 'manager' as const,
      action: 'Approved sales budget submission',
      module: 'sales_budget' as const,
      entity: 'John Salesman - 3 budget items',
      details: {
        changes: ['Budget approved and sent to supply chain'],
        metadata: { 
          approvalId: 'APP001',
          approvedItems: 3,
          totalValue: 875000
        }
      },
      category: 'approve' as const,
      severity: 'high' as const,
      isVisible: true,
      relatedUsers: ['supply_chain']
    }
  ];

  // Log each sample activity with timestamps spread over the last few days
  sampleActivities.forEach((activity, index) => {
    const daysAgo = Math.floor(index / 2); // Spread activities over multiple days
    const hoursAgo = (index % 2) * 6; // Some activities same day, different times
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(timestamp.getHours() - hoursAgo);

    const activityWithTimestamp = {
      ...activity,
      timestamp: timestamp.toISOString()
    };

    // Use the low-level method to avoid current timestamp override
    const activityId = `sample_${Date.now()}_${index}`;
    const fullActivity = {
      ...activityWithTimestamp,
      id: activityId
    };

    const existingLogs = ActivityLogger.getAllActivities();
    const updatedLogs = [fullActivity, ...existingLogs];
    localStorage.setItem('system_activity_logs', JSON.stringify(updatedLogs));
  });

  console.log('Sample activities initialized for testing the activity monitoring system');
  return true;
};

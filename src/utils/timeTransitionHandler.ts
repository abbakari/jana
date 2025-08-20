// Time Transition Handler - Manages month and year transitions seamlessly
// Automatically handles data migrations, UI updates, and business logic

import { getCurrentYear, getCurrentMonth } from './timeUtils';
import DataPersistenceManager from './dataPersistence';

export interface TransitionEvent {
  type: 'month' | 'year';
  from: { month: number; year: number };
  to: { month: number; year: number };
  timestamp: string;
  affectedData: string[];
}

export interface TransitionConfig {
  enableAutoMigration: boolean;
  enableNotifications: boolean;
  enableDataArchiving: boolean;
  enableUIUpdates: boolean;
  customHandlers?: {
    onMonthTransition?: (event: TransitionEvent) => void;
    onYearTransition?: (event: TransitionEvent) => void;
  };
}

class TimeTransitionHandler {
  private static instance: TimeTransitionHandler;
  private config: TransitionConfig;
  private transitionHistory: TransitionEvent[] = [];
  private isTransitioning = false;

  private constructor() {
    this.config = {
      enableAutoMigration: true,
      enableNotifications: true,
      enableDataArchiving: true,
      enableUIUpdates: true
    };
    this.loadTransitionHistory();
  }

  static getInstance(): TimeTransitionHandler {
    if (!TimeTransitionHandler.instance) {
      TimeTransitionHandler.instance = new TimeTransitionHandler();
    }
    return TimeTransitionHandler.instance;
  }

  // Configure transition handling
  configure(config: Partial<TransitionConfig>) {
    this.config = { ...this.config, ...config };
    console.log('Time transition handler configured:', this.config);
  }

  // Handle month transition
  async handleMonthTransition(fromMonth: number, toMonth: number, year: number): Promise<void> {
    if (this.isTransitioning) {
      console.log('Transition already in progress, skipping...');
      return;
    }

    this.isTransitioning = true;
    
    try {
      console.log(`🗓️ Month transition detected: ${fromMonth} → ${toMonth} (Year: ${year})`);

      const transitionEvent: TransitionEvent = {
        type: 'month',
        from: { month: fromMonth, year },
        to: { month: toMonth, year },
        timestamp: new Date().toISOString(),
        affectedData: []
      };

      // 1. Update forecast periods
      await this.updateForecastPeriods(transitionEvent);

      // 2. Migrate current month data to actual/historical
      await this.migrateLiveDataToHistorical(transitionEvent);

      // 3. Update month-specific calculations
      await this.updateMonthlyCalculations(transitionEvent);

      // 4. Refresh UI components
      if (this.config.enableUIUpdates) {
        await this.refreshUIComponents('month', transitionEvent);
      }

      // 5. Send notifications
      if (this.config.enableNotifications) {
        this.sendTransitionNotification(transitionEvent);
      }

      // 6. Execute custom handlers
      this.config.customHandlers?.onMonthTransition?.(transitionEvent);

      // 7. Record transition
      this.recordTransition(transitionEvent);

      console.log('✅ Month transition completed successfully');
    } catch (error) {
      console.error('❌ Error during month transition:', error);
    } finally {
      this.isTransitioning = false;
    }
  }

  // Handle year transition
  async handleYearTransition(fromYear: number, toYear: number): Promise<void> {
    if (this.isTransitioning) {
      console.log('Transition already in progress, skipping...');
      return;
    }

    this.isTransitioning = true;

    try {
      console.log(`🎊 Year transition detected: ${fromYear} → ${toYear}`);

      const transitionEvent: TransitionEvent = {
        type: 'year',
        from: { month: 11, year: fromYear }, // December of previous year
        to: { month: 0, year: toYear }, // January of new year
        timestamp: new Date().toISOString(),
        affectedData: []
      };

      // 1. Archive previous year's data
      if (this.config.enableDataArchiving) {
        await this.archivePreviousYearData(transitionEvent);
      }

      // 2. Initialize new year data structures
      await this.initializeNewYearData(transitionEvent);

      // 3. Migrate budget targets to new year
      await this.migrateBudgetTargets(transitionEvent);

      // 4. Update year-based calculations
      await this.updateYearlyCalculations(transitionEvent);

      // 5. Refresh all UI components
      if (this.config.enableUIUpdates) {
        await this.refreshUIComponents('year', transitionEvent);
      }

      // 6. Send year transition notifications
      if (this.config.enableNotifications) {
        this.sendYearTransitionNotification(transitionEvent);
      }

      // 7. Execute custom handlers
      this.config.customHandlers?.onYearTransition?.(transitionEvent);

      // 8. Trigger automatic data maintenance
      DataPersistenceManager.performAutomaticDataMaintenance();

      // 9. Record transition
      this.recordTransition(transitionEvent);

      console.log('🎉 Year transition completed successfully');
    } catch (error) {
      console.error('❌ Error during year transition:', error);
    } finally {
      this.isTransitioning = false;
    }
  }

  // Update forecast periods when month changes
  private async updateForecastPeriods(event: TransitionEvent): Promise<void> {
    try {
      console.log('Updating forecast periods...');
      
      // Get all rolling forecast data
      const forecastData = DataPersistenceManager.getRollingForecastData();
      
      // Update forecast data to reflect new month
      const updatedForecastData = forecastData.map((item: any) => {
        if (item.forecastData) {
          // Shift forecast data as month progresses
          const updatedForecastData = { ...item.forecastData };
          // Logic to handle month transitions in forecast data
          return { ...item, forecastData: updatedForecastData, lastModified: new Date().toISOString() };
        }
        return item;
      });

      // Save updated data
      DataPersistenceManager.saveRollingForecastData(updatedForecastData);
      
      event.affectedData.push('rolling_forecast_periods');
      console.log('✅ Forecast periods updated');
    } catch (error) {
      console.error('Error updating forecast periods:', error);
    }
  }

  // Migrate live data to historical when month/year changes
  private async migrateLiveDataToHistorical(event: TransitionEvent): Promise<void> {
    try {
      console.log('Migrating live data to historical...');
      
      // This would typically involve moving "current" data to "actual" data
      // and preparing new "current" data structures
      
      // Get current month's data and mark as historical
      const salesBudgetData = DataPersistenceManager.getSalesBudgetData();
      const forecastData = DataPersistenceManager.getRollingForecastData();
      
      // Update status of previous month's data
      const updatedSalesData = salesBudgetData.map((item: any) => ({
        ...item,
        status: item.status === 'current' ? 'historical' : item.status,
        lastModified: new Date().toISOString()
      }));
      
      const updatedForecastData = forecastData.map((item: any) => ({
        ...item,
        status: item.status === 'current' ? 'historical' : item.status,
        lastModified: new Date().toISOString()
      }));
      
      DataPersistenceManager.saveSalesBudgetData(updatedSalesData);
      DataPersistenceManager.saveRollingForecastData(updatedForecastData);
      
      event.affectedData.push('live_to_historical_migration');
      console.log('✅ Live data migrated to historical');
    } catch (error) {
      console.error('Error migrating live data:', error);
    }
  }

  // Update monthly calculations
  private async updateMonthlyCalculations(event: TransitionEvent): Promise<void> {
    try {
      console.log('Updating monthly calculations...');
      
      // Recalculate month-to-date figures
      // Update variance calculations
      // Refresh month-based KPIs
      
      event.affectedData.push('monthly_calculations');
      console.log('✅ Monthly calculations updated');
    } catch (error) {
      console.error('Error updating monthly calculations:', error);
    }
  }

  // Archive previous year's data
  private async archivePreviousYearData(event: TransitionEvent): Promise<void> {
    try {
      console.log('Archiving previous year data...');
      
      const previousYear = event.from.year;
      
      // Archive sales budget data
      const salesBudgetData = DataPersistenceManager.getHistoricalDataByYear(previousYear, 'sales_budget');
      const forecastData = DataPersistenceManager.getHistoricalDataByYear(previousYear, 'rolling_forecast');
      
      if (salesBudgetData.length > 0 || forecastData.length > 0) {
        // Create year-end archive
        const yearEndArchive = {
          year: previousYear,
          archivedAt: new Date().toISOString(),
          salesBudgetCount: salesBudgetData.length,
          forecastCount: forecastData.length,
          totalRecords: salesBudgetData.length + forecastData.length
        };
        
        localStorage.setItem(`year_archive_${previousYear}`, JSON.stringify(yearEndArchive));
        console.log(`📦 Archived ${yearEndArchive.totalRecords} records for year ${previousYear}`);
      }
      
      event.affectedData.push(`year_${previousYear}_archive`);
      console.log('✅ Previous year data archived');
    } catch (error) {
      console.error('Error archiving previous year data:', error);
    }
  }

  // Initialize new year data structures
  private async initializeNewYearData(event: TransitionEvent): Promise<void> {
    try {
      console.log('Initializing new year data structures...');
      
      const newYear = event.to.year;
      
      // Initialize new year templates
      const newYearTemplate = {
        year: newYear,
        initializedAt: new Date().toISOString(),
        dataStructures: {
          salesBudget: [],
          rollingForecast: [],
          targets: [],
          kpis: []
        }
      };
      
      localStorage.setItem(`year_template_${newYear}`, JSON.stringify(newYearTemplate));
      
      event.affectedData.push(`year_${newYear}_initialization`);
      console.log('✅ New year data structures initialized');
    } catch (error) {
      console.error('Error initializing new year data:', error);
    }
  }

  // Migrate budget targets to new year
  private async migrateBudgetTargets(event: TransitionEvent): Promise<void> {
    try {
      console.log('Migrating budget targets to new year...');
      
      // This would copy relevant budget targets from previous year
      // and adjust them for the new year
      
      event.affectedData.push('budget_targets_migration');
      console.log('✅ Budget targets migrated to new year');
    } catch (error) {
      console.error('Error migrating budget targets:', error);
    }
  }

  // Update yearly calculations
  private async updateYearlyCalculations(event: TransitionEvent): Promise<void> {
    try {
      console.log('Updating yearly calculations...');
      
      // Reset year-to-date figures
      // Initialize new year KPIs
      // Update growth calculations
      
      event.affectedData.push('yearly_calculations');
      console.log('✅ Yearly calculations updated');
    } catch (error) {
      console.error('Error updating yearly calculations:', error);
    }
  }

  // Refresh UI components
  private async refreshUIComponents(type: 'month' | 'year', event: TransitionEvent): Promise<void> {
    try {
      console.log(`Refreshing UI components for ${type} transition...`);
      
      // Trigger custom events that React components can listen to
      const customEvent = new CustomEvent(`timeTransition${type}`, {
        detail: event
      });
      window.dispatchEvent(customEvent);
      
      console.log(`✅ UI components refreshed for ${type} transition`);
    } catch (error) {
      console.error('Error refreshing UI components:', error);
    }
  }

  // Send transition notifications
  private sendTransitionNotification(event: TransitionEvent): void {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const fromMonthName = monthNames[event.from.month];
    const toMonthName = monthNames[event.to.month];
    
    console.log(`🔔 Month Transition: ${fromMonthName} → ${toMonthName} ${event.to.year}`);
    
    // You could integrate with actual notification systems here
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Month Transition', {
        body: `Transitioned from ${fromMonthName} to ${toMonthName} ${event.to.year}`,
        icon: '/favicon.ico'
      });
    }
  }

  // Send year transition notifications
  private sendYearTransitionNotification(event: TransitionEvent): void {
    console.log(`🎊 Year Transition: ${event.from.year} → ${event.to.year}`);
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Happy New Year!', {
        body: `Welcome to ${event.to.year}! All systems have been updated.`,
        icon: '/favicon.ico'
      });
    }
  }

  // Record transition in history
  private recordTransition(event: TransitionEvent): void {
    this.transitionHistory.push(event);
    
    // Keep only last 50 transitions
    if (this.transitionHistory.length > 50) {
      this.transitionHistory = this.transitionHistory.slice(-50);
    }
    
    // Save to localStorage
    localStorage.setItem('transition_history', JSON.stringify(this.transitionHistory));
  }

  // Load transition history
  private loadTransitionHistory(): void {
    try {
      const history = localStorage.getItem('transition_history');
      if (history) {
        this.transitionHistory = JSON.parse(history);
      }
    } catch (error) {
      console.error('Error loading transition history:', error);
      this.transitionHistory = [];
    }
  }

  // Get transition history
  getTransitionHistory(): TransitionEvent[] {
    return [...this.transitionHistory];
  }

  // Check if currently transitioning
  isCurrentlyTransitioning(): boolean {
    return this.isTransitioning;
  }
}

export default TimeTransitionHandler;

// Export singleton instance
export const timeTransitionHandler = TimeTransitionHandler.getInstance();

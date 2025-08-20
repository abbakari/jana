// React hook for automatic time synchronization
// Provides real-time updates across all components

import { useState, useEffect, useCallback } from 'react';
import {
  subscribeToTimeUpdates,
  onMonthTransition,
  onYearTransition,
  getDynamicTimeInfo,
  getCurrentYear,
  getCurrentMonth,
  getShortMonthNames,
  startTimeUpdates,
  stopTimeUpdates
} from '../utils/timeUtils';

export interface TimeState {
  currentTime: Date;
  currentYear: number;
  currentMonth: number;
  currentMonthName: string;
  timeInfo: ReturnType<typeof getDynamicTimeInfo>;
  lastUpdated: number;
}

export interface TimeSyncOptions {
  enableAutoRefresh?: boolean;
  refreshInterval?: number; // in minutes
  onMonthChange?: () => void;
  onYearChange?: () => void;
  onTimeUpdate?: (timeState: TimeState) => void;
}

export const useTimeSync = (options: TimeSyncOptions = {}) => {
  const {
    enableAutoRefresh = true,
    refreshInterval = 1,
    onMonthChange,
    onYearChange,
    onTimeUpdate
  } = options;

  // Time state
  const [timeState, setTimeState] = useState<TimeState>(() => ({
    currentTime: new Date(),
    currentYear: getCurrentYear(),
    currentMonth: getCurrentMonth(),
    currentMonthName: getShortMonthNames()[getCurrentMonth()],
    timeInfo: getDynamicTimeInfo(),
    lastUpdated: Date.now()
  }));

  // Force refresh function
  const forceRefresh = useCallback(() => {
    const newTimeState: TimeState = {
      currentTime: new Date(),
      currentYear: getCurrentYear(),
      currentMonth: getCurrentMonth(),
      currentMonthName: getShortMonthNames()[getCurrentMonth()],
      timeInfo: getDynamicTimeInfo(),
      lastUpdated: Date.now()
    };
    
    setTimeState(newTimeState);
    onTimeUpdate?.(newTimeState);
  }, [onTimeUpdate]);

  // Set up time observers
  useEffect(() => {
    if (!enableAutoRefresh) return;

    let unsubscribeTime: (() => void) | undefined;
    let unsubscribeMonth: (() => void) | undefined;
    let unsubscribeYear: (() => void) | undefined;

    // Subscribe to time updates
    unsubscribeTime = subscribeToTimeUpdates((currentTime) => {
      const newTimeState: TimeState = {
        currentTime,
        currentYear: getCurrentYear(),
        currentMonth: getCurrentMonth(),
        currentMonthName: getShortMonthNames()[getCurrentMonth()],
        timeInfo: getDynamicTimeInfo(),
        lastUpdated: Date.now()
      };
      
      setTimeState(newTimeState);
      onTimeUpdate?.(newTimeState);
    });

    // Subscribe to month transitions
    if (onMonthChange) {
      unsubscribeMonth = onMonthTransition(() => {
        console.log('Month transition detected in component');
        onMonthChange();
        forceRefresh();
      });
    }

    // Subscribe to year transitions
    if (onYearChange) {
      unsubscribeYear = onYearTransition(() => {
        console.log('Year transition detected in component');
        onYearChange();
        forceRefresh();
      });
    }

    // Start the global time system
    startTimeUpdates();

    return () => {
      unsubscribeTime?.();
      unsubscribeMonth?.();
      unsubscribeYear?.();
    };
  }, [enableAutoRefresh, onMonthChange, onYearChange, onTimeUpdate, forceRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't stop time updates here as other components might be using them
      // The time system will auto-stop when no more observers exist
    };
  }, []);

  return {
    timeState,
    forceRefresh,
    // Convenience accessors
    currentTime: timeState.currentTime,
    currentYear: timeState.currentYear,
    currentMonth: timeState.currentMonth,
    currentMonthName: timeState.currentMonthName,
    timeInfo: timeState.timeInfo,
    lastUpdated: timeState.lastUpdated,
    
    // Utility functions
    isCurrentYear: (year: number) => year === timeState.currentYear,
    isCurrentMonth: (month: number) => month === timeState.currentMonth,
    isDataFresh: (timestamp: number, maxAgeMinutes: number = 60) => {
      const ageInMinutes = (timeState.lastUpdated - timestamp) / (1000 * 60);
      return ageInMinutes <= maxAgeMinutes;
    }
  };
};

// Specialized hooks for specific use cases
export const useMonthSync = (onMonthChange?: () => void) => {
  return useTimeSync({
    enableAutoRefresh: true,
    onMonthChange
  });
};

export const useYearSync = (onYearChange?: () => void) => {
  return useTimeSync({
    enableAutoRefresh: true,
    onYearChange
  });
};

export const useFullTimeSync = (
  onMonthChange?: () => void,
  onYearChange?: () => void,
  onTimeUpdate?: (timeState: TimeState) => void
) => {
  return useTimeSync({
    enableAutoRefresh: true,
    onMonthChange,
    onYearChange,
    onTimeUpdate
  });
};

// Hook for components that need precise time tracking
export const usePreciseTimeSync = () => {
  const [preciseTime, setPreciseTime] = useState(new Date());

  useEffect(() => {
    // Update every second for precise time tracking
    const interval = setInterval(() => {
      setPreciseTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return preciseTime;
};

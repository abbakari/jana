// Dynamic Time System with real-time updates and observers
// Automatically updates months, dates, years based on current time across all components

// Time update observers for real-time synchronization
type TimeUpdateCallback = (currentTime: Date) => void;
let timeObservers: TimeUpdateCallback[] = [];
let timeUpdateInterval: NodeJS.Timeout | null = null;

// Core time functions with dynamic updating
export const getCurrentDate = () => new Date();

export const getCurrentMonth = () => getCurrentDate().getMonth(); // 0-11

export const getCurrentYear = () => getCurrentDate().getFullYear();

export const getMonthNames = () => [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const getShortMonthNames = () => [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

export const isCurrentOrPastMonth = (monthIndex: number, year?: number) => {
  const currentDate = getCurrentDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  if (year && year < currentYear) return true;
  if (year && year > currentYear) return false;
  
  return monthIndex <= currentMonth;
};

export const isFutureMonth = (monthIndex: number, year?: number) => {
  return !isCurrentOrPastMonth(monthIndex, year);
};

export const getRemainingMonthsInYear = () => {
  const currentMonth = getCurrentMonth();
  return 11 - currentMonth; // 0-based month, so 11 is December
};

export const getMonthsFromCurrent = (includeCurrent = false) => {
  const currentMonth = getCurrentMonth();
  const startMonth = includeCurrent ? currentMonth : currentMonth + 1;
  
  return getShortMonthNames().slice(startMonth);
};

export const getFutureMonthsForYear = (year: number) => {
  const currentYear = getCurrentYear();
  const currentMonth = getCurrentMonth();
  
  if (year > currentYear) {
    // Future year - all months are available
    return getShortMonthNames().map((month, index) => ({ month, index, editable: true }));
  } else if (year === currentYear) {
    // Current year - only future months are editable
    return getShortMonthNames().map((month, index) => ({
      month,
      index,
      editable: index > currentMonth
    }));
  } else {
    // Past year - no months are editable
    return getShortMonthNames().map((month, index) => ({ month, index, editable: false }));
  }
};

export const formatDateForDisplay = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTimeForDisplay = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateTimeForDisplay = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return `${formatDateForDisplay(dateObj)} at ${formatTimeForDisplay(dateObj)}`;
};

export const getTimeAgo = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = getCurrentDate();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  
  return formatDateForDisplay(dateObj);
};

export const getCurrentQuarter = () => {
  const month = getCurrentMonth();
  return Math.floor(month / 3) + 1; // Q1, Q2, Q3, Q4
};

export const getQuarterMonths = (quarter: number) => {
  const startMonth = (quarter - 1) * 3;
  return getShortMonthNames().slice(startMonth, startMonth + 3);
};

export const isWorkingHour = () => {
  const hour = getCurrentDate().getHours();
  return hour >= 8 && hour <= 18; // 8 AM to 6 PM
};

export const getBusinessDaysUntil = (targetDate: Date) => {
  const current = getCurrentDate();
  let count = 0;
  const date = new Date(current);

  while (date < targetDate) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      count++;
    }
  }

  return count;
};

// Historical year management functions
export const getHistoricalYears = (startYear: number = 2021) => {
  const currentYear = getCurrentYear();
  const years = [];

  for (let year = startYear; year <= currentYear + 2; year++) {
    years.push(year);
  }

  return years;
};

export const getAvailableYears = () => {
  return getHistoricalYears().map(year => ({
    value: year.toString(),
    label: year.toString(),
    isCurrent: year === getCurrentYear(),
    isPast: year < getCurrentYear(),
    isFuture: year > getCurrentYear()
  }));
};

export const getDefaultYearSelections = () => {
  const currentYear = getCurrentYear();
  return {
    pastYear: (currentYear - 1).toString(),
    currentYear: currentYear.toString(),
    futureYear: (currentYear + 1).toString()
  };
};

export const isHistoricalYear = (year: number) => {
  return year < getCurrentYear();
};

export const isFutureYear = (year: number) => {
  return year > getCurrentYear();
};

export const getYearStatus = (year: number) => {
  const currentYear = getCurrentYear();
  if (year < currentYear) return 'historical';
  if (year === currentYear) return 'current';
  return 'future';
};

export const getYearRange = (startYear?: number, endYear?: number) => {
  const defaultStart = startYear || 2021;
  const defaultEnd = endYear || getCurrentYear() + 2;

  return {
    start: defaultStart,
    end: defaultEnd,
    years: getHistoricalYears(defaultStart).filter(year => year <= defaultEnd),
    total: defaultEnd - defaultStart + 1
  };
};

export const formatYearForDisplay = (year: number | string) => {
  const yearNum = typeof year === 'string' ? parseInt(year) : year;
  const status = getYearStatus(yearNum);
  const currentYear = getCurrentYear();

  switch (status) {
    case 'historical':
      return `${yearNum} (Historical)`;
    case 'current':
      return `${yearNum} (Current)`;
    case 'future':
      return `${yearNum} (Forecast)`;
    default:
      return yearNum.toString();
  }
};

export const getMonthsForYear = (year: number) => {
  const currentYear = getCurrentYear();
  const currentMonth = getCurrentMonth();

  return getShortMonthNames().map((month, index) => {
    let status = 'editable';
    let hasData = false;

    if (year < currentYear) {
      status = 'historical';
      hasData = true; // Assume historical data exists
    } else if (year === currentYear) {
      if (index <= currentMonth) {
        status = 'current';
        hasData = true;
      } else {
        status = 'future';
        hasData = false;
      }
    } else {
      status = 'forecast';
      hasData = false;
    }

    return {
      month,
      index,
      status,
      hasData,
      editable: status === 'future' || status === 'forecast',
      fullName: getMonthNames()[index]
    };
  });
};

// Dynamic Time Observer System for Real-time Updates
export const subscribeToTimeUpdates = (callback: TimeUpdateCallback): (() => void) => {
  timeObservers.push(callback);

  // Start the time update interval if not already running
  if (!timeUpdateInterval) {
    startTimeUpdates();
  }

  // Return unsubscribe function
  return () => {
    timeObservers = timeObservers.filter(observer => observer !== callback);

    // Stop interval if no more observers
    if (timeObservers.length === 0 && timeUpdateInterval) {
      clearInterval(timeUpdateInterval);
      timeUpdateInterval = null;
    }
  };
};

export const startTimeUpdates = () => {
  if (timeUpdateInterval) return; // Already running

  // Update every minute to catch month/year transitions
  timeUpdateInterval = setInterval(() => {
    const currentTime = getCurrentDate();

    // Notify all observers of time update
    timeObservers.forEach(callback => {
      try {
        callback(currentTime);
      } catch (error) {
        console.error('Error in time update callback:', error);
      }
    });

    // Check for month transition
    if (hasMonthChanged()) {
      console.log('Month transition detected, triggering refresh');
      notifyMonthTransition();
    }

    // Check for year transition
    if (hasYearChanged()) {
      console.log('Year transition detected, triggering refresh');
      notifyYearTransition();
    }
  }, 60000); // Check every minute

  console.log('Dynamic time system started - updating every minute');
};

export const stopTimeUpdates = () => {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval);
    timeUpdateInterval = null;
    console.log('Dynamic time system stopped');
  }
};

// Month and Year transition detection
let lastCheckedMonth = getCurrentMonth();
let lastCheckedYear = getCurrentYear();

export const hasMonthChanged = (): boolean => {
  const currentMonth = getCurrentMonth();
  if (currentMonth !== lastCheckedMonth) {
    lastCheckedMonth = currentMonth;
    return true;
  }
  return false;
};

export const hasYearChanged = (): boolean => {
  const currentYear = getCurrentYear();
  if (currentYear !== lastCheckedYear) {
    lastCheckedYear = currentYear;
    return true;
  }
  return false;
};

// Event system for major time transitions
type TransitionCallback = () => void;
let monthTransitionCallbacks: TransitionCallback[] = [];
let yearTransitionCallbacks: TransitionCallback[] = [];

export const onMonthTransition = (callback: TransitionCallback): (() => void) => {
  monthTransitionCallbacks.push(callback);
  return () => {
    monthTransitionCallbacks = monthTransitionCallbacks.filter(cb => cb !== callback);
  };
};

export const onYearTransition = (callback: TransitionCallback): (() => void) => {
  yearTransitionCallbacks.push(callback);
  return () => {
    yearTransitionCallbacks = yearTransitionCallbacks.filter(cb => cb !== callback);
  };
};

const notifyMonthTransition = async () => {
  monthTransitionCallbacks.forEach(callback => {
    try {
      callback();
    } catch (error) {
      console.error('Error in month transition callback:', error);
    }
  });

  // Trigger comprehensive transition handling
  try {
    const { timeTransitionHandler } = await import('./timeTransitionHandler');
    const currentMonth = getCurrentMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentYear = getCurrentYear();

    await timeTransitionHandler.handleMonthTransition(previousMonth, currentMonth, currentYear);
  } catch (error) {
    console.error('Error in comprehensive month transition handling:', error);
  }
};

const notifyYearTransition = async () => {
  yearTransitionCallbacks.forEach(callback => {
    try {
      callback();
    } catch (error) {
      console.error('Error in year transition callback:', error);
    }
  });

  // Trigger comprehensive transition handling
  try {
    const { timeTransitionHandler } = await import('./timeTransitionHandler');
    const currentYear = getCurrentYear();
    const previousYear = currentYear - 1;

    await timeTransitionHandler.handleYearTransition(previousYear, currentYear);
  } catch (error) {
    console.error('Error in comprehensive year transition handling:', error);
  }
};

// Dynamic time-based calculations that auto-update
export const getDynamicTimeInfo = () => {
  const now = getCurrentDate();
  return {
    timestamp: now.getTime(),
    currentMonth: getCurrentMonth(),
    currentYear: getCurrentYear(),
    currentQuarter: getCurrentQuarter(),
    isWorkingHour: isWorkingHour(),
    dayOfWeek: now.getDay(),
    dayOfMonth: now.getDate(),
    weekOfYear: Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
    isLeapYear: new Date(now.getFullYear(), 1, 29).getMonth() === 1,
    remainingDaysInMonth: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate(),
    remainingDaysInYear: Math.ceil((new Date(now.getFullYear() + 1, 0, 1).getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
  };
};

// Auto-updating year selections
export const getAutoUpdatingYearSelections = () => {
  const currentYear = getCurrentYear();
  return {
    historical: getHistoricalYears().filter(year => year < currentYear),
    current: currentYear,
    future: [currentYear + 1, currentYear + 2],
    all: getHistoricalYears(),
    defaultSelections: getDefaultYearSelections()
  };
};

// Time-based data validation
export const isDataStillValid = (dataTimestamp: string, maxAgeMinutes: number = 60): boolean => {
  const dataTime = new Date(dataTimestamp).getTime();
  const currentTime = getCurrentDate().getTime();
  const ageInMinutes = (currentTime - dataTime) / (1000 * 60);
  return ageInMinutes <= maxAgeMinutes;
};

// Smart cache invalidation based on time
export const shouldRefreshData = (lastRefresh: string, forceRefreshOnNewDay: boolean = true): boolean => {
  const lastRefreshDate = new Date(lastRefresh);
  const currentDate = getCurrentDate();

  // Force refresh if it's a new day
  if (forceRefreshOnNewDay &&
      (lastRefreshDate.getDate() !== currentDate.getDate() ||
       lastRefreshDate.getMonth() !== currentDate.getMonth() ||
       lastRefreshDate.getFullYear() !== currentDate.getFullYear())) {
    return true;
  }

  // Force refresh if it's been more than 30 minutes
  return !isDataStillValid(lastRefresh, 30);
};

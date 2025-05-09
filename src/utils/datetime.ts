
// Format a date in ISO format (YYYY-MM-DD)
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Format a date for display
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
}

// Format a datetime for display
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
}

// Format time for display
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString();
}

// Get date range options for filtering
export function getDateRangeOptions() {
  const now = new Date();
  
  // Today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Last 7 days
  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 7);
  
  // Last 30 days
  const last30Days = new Date(today);
  last30Days.setDate(last30Days.getDate() - 30);
  
  // This month
  const thisMonth = new Date(today);
  thisMonth.setDate(1);
  
  // Last month
  const lastMonth = new Date(thisMonth);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  return [
    { label: 'Today', start: formatDateISO(today), end: formatDateISO(now) },
    { label: 'Yesterday', start: formatDateISO(yesterday), end: formatDateISO(today) },
    { label: 'Last 7 days', start: formatDateISO(last7Days), end: formatDateISO(now) },
    { label: 'Last 30 days', start: formatDateISO(last30Days), end: formatDateISO(now) },
    { label: 'This month', start: formatDateISO(thisMonth), end: formatDateISO(now) },
    { label: 'Last month', start: formatDateISO(lastMonth), end: formatDateISO(thisMonth) },
  ];
}

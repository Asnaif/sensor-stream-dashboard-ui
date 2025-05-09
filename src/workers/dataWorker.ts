
// This file would be loaded as a Web Worker to handle data processing off the main thread
// For this demo, we're just defining the functions that would be in the worker

// Function to downsample time series data for better chart rendering
export function downsampleData(data: any[], targetPoints: number) {
  if (data.length <= targetPoints) return data;
  
  const skipFactor = Math.ceil(data.length / targetPoints);
  return data.filter((_, i) => i % skipFactor === 0);
}

// Calculate basic statistics from sensor data
export function calculateStatistics(data: any[], field: string) {
  if (!data.length) return { min: 0, max: 0, avg: 0 };
  
  const values = data.map(d => d[field]).filter(v => !isNaN(v));
  
  if (!values.length) return { min: 0, max: 0, avg: 0 };
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  
  return {
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
    avg: Number(avg.toFixed(2))
  };
}

// Detect anomalies in sensor data (simplified)
export function detectAnomalies(data: any[], field: string, stdDevThreshold = 2) {
  if (data.length < 10) return [];
  
  const values = data.map(d => d[field]);
  
  // Calculate mean and standard deviation
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  const stdDev = Math.sqrt(avgSquareDiff);
  
  // Find anomalies (values that deviate significantly from the mean)
  const anomalies = data.filter((d, i) => {
    const deviation = Math.abs(d[field] - mean);
    return deviation > stdDevThreshold * stdDev;
  });
  
  return anomalies;
}

// Generate CSV content from sensor data
export function generateCSV(data: any[]) {
  if (!data.length) return '';
  
  // Get headers from first data object
  const headers = Object.keys(data[0]).filter(
    key => !key.startsWith('_') && key !== 'id'
  );
  
  const headerRow = headers.join(',');
  
  // Format each data row
  const rows = data.map(item => {
    return headers.map(header => {
      // Format timestamps specially
      if (header === 'timestamp' && item[header]) {
        if (typeof item[header] === 'string') {
          return `"${new Date(item[header]).toLocaleString()}"`;
        }
        return `"${item[header].toLocaleString()}"`;
      }
      
      // Handle null values and ensure proper CSV formatting
      if (item[header] === null || item[header] === undefined) return '';
      if (typeof item[header] === 'string') return `"${item[header].replace(/"/g, '""')}"`;
      return item[header];
    }).join(',');
  });
  
  // Combine header and rows
  return [headerRow, ...rows].join('\n');
}

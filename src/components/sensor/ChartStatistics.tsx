
import React from "react";

/**
 * Component to display min, max, and average statistics
 * @param {Object} props
 * @param {Object} props.stats - Statistics object with min, max, and avg values
 * @param {number} props.stats.min - Minimum value
 * @param {number} props.stats.max - Maximum value
 * @param {number} props.stats.avg - Average value
 * @param {string} props.unit - Unit of measurement (°C, %, etc.)
 */
const ChartStatistics = ({ stats, unit }) => {
  // Check if stats are valid numbers
  const validMin = !isNaN(stats.min) && isFinite(stats.min);
  const validMax = !isNaN(stats.max) && isFinite(stats.max);
  const validAvg = !isNaN(stats.avg) && isFinite(stats.avg);

  // Format the values safely
  const formatValue = (value, isValid) => {
    return isValid ? value.toFixed(1) : 'N/A';
  };

  return (
    <div className="flex gap-3 text-xs text-gray-500">
      <div>
        Min: <span className="font-medium">{formatValue(stats.min, validMin)} {unit}</span>
      </div>
      <div>
        Avg: <span className="font-medium">{formatValue(stats.avg, validAvg)} {unit}</span>
      </div>
      <div>
        Max: <span className="font-medium">{formatValue(stats.max, validMax)} {unit}</span>
      </div>
    </div>
  );
};

export default ChartStatistics;

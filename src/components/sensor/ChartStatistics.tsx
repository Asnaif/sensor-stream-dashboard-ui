
// interface ChartStatisticsProps {
//   stats: { min: number; max: number; avg: number };
//   unit: string;
// }

// const ChartStatistics = ({ stats, unit }: ChartStatisticsProps) => {
//   return (
//     <div className="flex space-x-4 text-xs text-muted-foreground">
//       <div>
//         <span className="font-semibold">Min:</span> {stats.min.toFixed(1)} {unit}
//       </div>
//       <div>
//         <span className="font-semibold">Avg:</span> {stats.avg.toFixed(1)} {unit}
//       </div>
//       <div>
//         <span className="font-semibold">Max:</span> {stats.max.toFixed(1)} {unit}
//       </div>
//     </div>
//   );
// };

// export default ChartStatistics;

// ChartStatistics.jsx
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
  return (
    <div className="flex gap-3 text-xs text-gray-500">
      <div>
        Min: <span className="font-medium">{stats.min.toFixed(1)} {unit}</span>
      </div>
      <div>
        Avg: <span className="font-medium">{stats.avg.toFixed(1)} {unit}</span>
      </div>
      <div>
        Max: <span className="font-medium">{stats.max.toFixed(1)} {unit}</span>
      </div>
    </div>
  );
};

export default ChartStatistics;

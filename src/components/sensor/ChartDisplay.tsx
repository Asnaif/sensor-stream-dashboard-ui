
// import { useRef } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   ReferenceLine
// } from "recharts";
// import { formatDateTime } from "@/utils/datetime";

// interface ChartDisplayProps {
//   chartData: any[];
//   dataKey: string;
//   color: string;
//   title: string;
//   unit: string;
//   stats: { min: number; max: number; avg: number };
//   threshold?: { min: number; max: number };
// }

// const ChartDisplay = ({
//   chartData,
//   dataKey,
//   color,
//   title,
//   unit,
//   stats,
//   threshold
// }: ChartDisplayProps) => {
//   const chartRef = useRef(null);

//   if (chartData.length === 0) {
//     return (
//       <div className="flex h-full items-center justify-center">
//         <p className="text-muted-foreground">No data available</p>
//       </div>
//     );
//   }

//   return (
//     <ResponsiveContainer width="100%" height="100%" ref={chartRef}>
//       <LineChart
//         data={chartData}
//         margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
//       >
//         <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
//         <XAxis
//           dataKey="formattedTime"
//           tick={{ fontSize: 12 }}
//           tickFormatter={(value) => value}
//         />
//         <YAxis 
//           tick={{ fontSize: 12 }} 
//           domain={threshold ? [
//             Math.min(threshold.min * 0.9, stats.min * 0.9),
//             Math.max(threshold.max * 1.1, stats.max * 1.1)
//           ] : ['auto', 'auto']} 
//         />
//         <Tooltip 
//           formatter={(value) => [`${value} ${unit}`, title]}
//           labelFormatter={(label) => {
//             const timestamp = chartData.find(d => d.formattedTime === label)?.timestamp;
//             return timestamp ? formatDateTime(timestamp as string) : label;
//           }}
//         />
//         <Legend />
//         {threshold && (
//           <>
//             <ReferenceLine
//               y={threshold.max}
//               stroke="red"
//               strokeDasharray="3 3"
//               label={{ value: `Max: ${threshold.max}`, position: 'insideTopLeft' }}
//             />
//             <ReferenceLine
//               y={threshold.min}
//               stroke="blue"
//               strokeDasharray="3 3"
//               label={{ value: `Min: ${threshold.min}`, position: 'insideBottomLeft' }}
//             />
//           </>
//         )}
//         <Line
//           type="monotone"
//           dataKey={dataKey}
//           stroke={color}
//           strokeWidth={2}
//           dot={false}
//           activeDot={{ r: 6 }}
//         />
//       </LineChart>
//     </ResponsiveContainer>
//   );
// };

// export default ChartDisplay;

// ChartDisplay.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

/**
 * Component to display sensor data chart
 * @param {Object} props
 * @param {Array} props.chartData - Processed and formatted data for the chart
 * @param {string} props.dataKey - Key name for the data value in the chartData array
 * @param {string} props.color - Color for the chart line
 * @param {string} props.title - Chart title
 * @param {string} props.unit - Unit of measurement (°C, %, etc.)
 * @param {Object} props.stats - Statistics object with min, max, and avg values
 * @param {Object} props.threshold - Min and max threshold values
 */
const ChartDisplay = ({ chartData, dataKey, color, title, unit, stats, threshold }) => {
  // Create a custom tooltip that shows formatted time and value
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded">
          <p className="text-xs text-gray-500">{payload[0].payload.formattedTime}</p>
          <p className="text-sm font-medium">
            {payload[0].value.toFixed(1)} {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="formattedTime"
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[
            dataMin => Math.floor(Math.min(dataMin, threshold?.min || dataMin) - 1),
            dataMax => Math.ceil(Math.max(dataMax, threshold?.max || dataMax) + 1)
          ]}
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={30}
        />
        <Tooltip content={<CustomTooltip />} />
        
        {/* Threshold reference lines */}
        {threshold && (
          <>
            <ReferenceLine
              y={threshold.min}
              stroke="#0066cc"
              strokeDasharray="3 3"
              label={{ 
                value: `Min: ${threshold.min}`,
                fill: '#0066cc',
                fontSize: 10,
                position: 'insideBottomLeft'
              }}
            />
            <ReferenceLine
              y={threshold.max}
              stroke="#cc0000"
              strokeDasharray="3 3"
              label={{ 
                value: `Max: ${threshold.max}`,
                fill: '#cc0000',
                fontSize: 10,
                position: 'insideTopLeft'
              }}
            />
          </>
        )}
        
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          animationDuration={500}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ChartDisplay;


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
  // Verify we have data to render
  if (!chartData || chartData.length === 0) {
    console.warn('ChartDisplay: No chart data provided');
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  // Verify the dataKey exists in the first data point
  if (!chartData[0].hasOwnProperty(dataKey)) {
    console.error(`ChartDisplay: Data key "${dataKey}" not found in chart data`);
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        Invalid data key
      </div>
    );
  }

  // Create a custom tooltip that shows formatted time and value
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded">
          <p className="text-xs text-gray-500">{payload[0].payload.formattedTime}</p>
          <p className="text-sm font-medium">
            {payload[0].value !== undefined ? payload[0].value.toFixed(1) : 'N/A'} {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate domain to ensure threshold lines are visible
  const calculateDomain = () => {
    const values = chartData.map(item => item[dataKey]).filter(val => val !== undefined);
    
    if (values.length === 0) return [0, 1]; // Default domain if no valid values
    
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);
    
    // Include thresholds if provided
    const minBound = threshold ? Math.min(dataMin, threshold.min) : dataMin;
    const maxBound = threshold ? Math.max(dataMax, threshold.max) : dataMax;
    
    // Add some padding
    const padding = (maxBound - minBound) * 0.1;
    return [Math.floor(minBound - padding), Math.ceil(maxBound + padding)];
  };

  const domain = calculateDomain();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart 
        data={chartData} 
        margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="formattedTime"
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={domain}
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={30}
          tickFormatter={value => value.toString()}
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
          connectNulls={true}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ChartDisplay;

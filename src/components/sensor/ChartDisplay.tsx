
import { useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { formatDateTime } from "@/utils/datetime";

interface ChartDisplayProps {
  chartData: any[];
  dataKey: string;
  color: string;
  title: string;
  unit: string;
  stats: { min: number; max: number; avg: number };
  threshold?: { min: number; max: number };
}

const ChartDisplay = ({
  chartData,
  dataKey,
  color,
  title,
  unit,
  stats,
  threshold
}: ChartDisplayProps) => {
  const chartRef = useRef(null);

  if (chartData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" ref={chartRef}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey="formattedTime"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => value}
        />
        <YAxis 
          tick={{ fontSize: 12 }} 
          domain={threshold ? [
            Math.min(threshold.min * 0.9, stats.min * 0.9),
            Math.max(threshold.max * 1.1, stats.max * 1.1)
          ] : ['auto', 'auto']} 
        />
        <Tooltip 
          formatter={(value) => [`${value} ${unit}`, title]}
          labelFormatter={(label) => {
            const timestamp = chartData.find(d => d.formattedTime === label)?.timestamp;
            return timestamp ? formatDateTime(timestamp as string) : label;
          }}
        />
        <Legend />
        {threshold && (
          <>
            <ReferenceLine
              y={threshold.max}
              stroke="red"
              strokeDasharray="3 3"
              label={{ value: `Max: ${threshold.max}`, position: 'insideTopLeft' }}
            />
            <ReferenceLine
              y={threshold.min}
              stroke="blue"
              strokeDasharray="3 3"
              label={{ value: `Min: ${threshold.min}`, position: 'insideBottomLeft' }}
            />
          </>
        )}
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ChartDisplay;

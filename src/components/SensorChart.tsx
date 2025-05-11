
import { useState, useEffect, useRef } from "react";
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
import { SensorData } from "@/types";
import { formatTime, formatDateTime } from "@/utils/datetime";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Maximize2, Minimize2, Download } from "lucide-react";
import { downsampleData, calculateStatistics } from "@/workers/dataWorker";
import { sensorApi } from "@/services/api";

interface SensorChartProps {
  title: string;
  data: SensorData[];
  dataKey: "temperature" | "humidity" | "air_quality";
  color: string;
  unit: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  threshold?: { min: number; max: number };
}

const SensorChart = ({
  title,
  data,
  dataKey,
  color,
  unit,
  isExpanded = false,
  onToggleExpand,
  threshold
}: SensorChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState({ min: 0, max: 0, avg: 0 });
  const [latestSensorData, setLatestSensorData] = useState<SensorData | null>(null);
  const chartRef = useRef(null);
  
  // Fetch the latest data regularly
  useEffect(() => {
    // Initial fetch
    fetchLatestData();
    
    // Set up interval for fetching
    const intervalId = setInterval(fetchLatestData, 5000);
    
    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);
  
  const fetchLatestData = async () => {
    try {
      const response = await sensorApi.getLatest();
      if (response.success && response.data) {
        setLatestSensorData(response.data);
        console.log("Latest real-time sensor data fetched:", response.data);
      }
    } catch (error) {
      console.error("Error fetching latest sensor data:", error);
    }
  };

  useEffect(() => {
    if (data.length === 0) return;
    
    // Process the data for the chart
    const formattedData = data.map((item) => ({
      timestamp: item.timestamp,
      [dataKey]: item[dataKey],
      formattedTime: formatTime(item.timestamp as string)
    }));
    
    // Downsample data if there are too many points
    const downsampledData = downsampleData(formattedData, 100);
    setChartData(downsampledData);
    
    // Calculate statistics
    const calculatedStats = calculateStatistics(data, dataKey);
    setStats(calculatedStats);
  }, [data, dataKey]);

  const handleDownload = () => {
    if (!chartRef.current) return;
    
    // This would ideally use a proper chart export library
    alert("Chart export functionality would go here");
  };

  // Get the latest value - prioritize the real-time data if available
  const latestValue = latestSensorData ? 
    latestSensorData[dataKey] : 
    (data.length > 0 ? data[data.length - 1][dataKey] : 0);
    
  // Format the value to handle potential precision issues
  const formattedLatestValue = typeof latestValue === 'number' 
    ? latestValue.toFixed(1) 
    : '0.0';

  return (
    <Card className={`chart-container ${isExpanded ? 'col-span-2 row-span-2' : ''}`}>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {onToggleExpand && (
            <Button variant="ghost" size="icon" onClick={onToggleExpand}>
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between mt-1">
          <div>
            <span className="sensor-value text-lg font-bold" style={{ color }}>
              {formattedLatestValue}
            </span>
            <span className="ml-1">{unit}</span>
            {latestSensorData && 
              <span className="text-xs ml-2 text-muted-foreground">
                (Live)
              </span>
            }
          </div>
          {threshold && (
            <Badge variant={
              parseFloat(formattedLatestValue) > threshold.max || 
              parseFloat(formattedLatestValue) < threshold.min 
                ? "destructive" 
                : "secondary"
            }>
              {parseFloat(formattedLatestValue) > threshold.max
                ? "Above threshold"
                : parseFloat(formattedLatestValue) < threshold.min
                ? "Below threshold"
                : "Normal"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="h-[200px]">
          {chartData.length > 0 ? (
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
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground">
        <div className="flex space-x-4">
          <div>
            <span className="font-semibold">Min:</span> {stats.min.toFixed(1)} {unit}
          </div>
          <div>
            <span className="font-semibold">Avg:</span> {stats.avg.toFixed(1)} {unit}
          </div>
          <div>
            <span className="font-semibold">Max:</span> {stats.max.toFixed(1)} {unit}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDownload} title="Download chart data">
          <Download className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SensorChart;

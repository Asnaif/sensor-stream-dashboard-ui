
import { useState, useEffect, useCallback } from "react";
import { SensorData } from "@/types";
import { formatTime } from "@/utils/datetime";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, Download } from "lucide-react";
import { downsampleData, calculateStatistics } from "@/workers/dataWorker";

// Import our components
import ThresholdBadge from "./sensor/ThresholdBadge";
import ChartStatistics from "./sensor/ChartStatistics";
import ChartDisplay from "./sensor/ChartDisplay";

interface SensorChartProps {
  title: string;
  data: SensorData[];
  dataKey: "temperature" | "humidity" | "air_quality";
  color: string;
  unit: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  threshold?: { min: number; max: number };
  latestData?: SensorData | null;
}

const SensorChart = ({
  title,
  data,
  dataKey,
  color,
  unit,
  isExpanded = false,
  onToggleExpand,
  threshold,
  latestData
}: SensorChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState({ min: 0, max: 0, avg: 0 });
  const [currentValue, setCurrentValue] = useState<number>(0);

  // Debug function to log important state changes
  const logDebug = useCallback((message: string, data: any) => {
    console.log(`[${title} Chart ${dataKey}] ${message}:`, data);
  }, [title, dataKey]);

  // Process chart data when data array changes
  useEffect(() => {
    if (data.length === 0) {
      logDebug('No data available', {dataLength: 0});
      return;
    }
    
    logDebug('Processing chart data', {dataLength: data.length});
    
    // Filter out any data points with undefined values
    const validData = data.filter(item => item[dataKey] !== undefined);
    
    if (validData.length < data.length) {
      logDebug('Filtered out items with undefined values', {
        original: data.length,
        filtered: validData.length
      });
    }
    
    if (validData.length === 0) {
      logDebug('No valid data points available', {});
      return;
    }
    
    // Process the data for the chart
    const formattedData = validData.map((item) => ({
      timestamp: item.timestamp,
      [dataKey]: item[dataKey],
      formattedTime: formatTime(item.timestamp as string)
    }));
    
    // Ensure data is sorted chronologically
    const sortedData = formattedData.sort((a, b) => 
      new Date(a.timestamp as string).getTime() - new Date(b.timestamp as string).getTime()
    );
    
    // Downsample data if there are too many points
    const downsampledData = downsampleData(sortedData, 100);
    setChartData(downsampledData);
    
    // Calculate statistics
    const calculatedStats = calculateStatistics(validData, dataKey);
    setStats(calculatedStats);
    
    // Log the processed chart data
    logDebug('Chart data processed', {
      points: downsampledData.length,
      stats: calculatedStats
    });
  }, [data, dataKey, logDebug]);

  // Update currentValue when latestData changes
  useEffect(() => {
    // First priority: Get value from latestData
    if (latestData && typeof latestData[dataKey] === 'number') {
      const newValue = latestData[dataKey] as number;
      logDebug('Setting current value from latestData', {
        value: newValue,
        timestamp: latestData.timestamp
      });
      setCurrentValue(newValue);
      return;
    }
    
    // Second priority: Get value from the most recent data point in the data array
    if (data.length > 0) {
      // Sort data by timestamp (newest first) to ensure we get the most recent
      const sortedData = [...data].sort((a, b) => 
        new Date(b.timestamp as string).getTime() - new Date(a.timestamp as string).getTime()
      );
      
      const mostRecentData = sortedData[0];
      if (mostRecentData && typeof mostRecentData[dataKey] === 'number') {
        const newValue = mostRecentData[dataKey] as number;
        logDebug('Setting current value from mostRecentData', {
          value: newValue,
          timestamp: mostRecentData.timestamp
        });
        setCurrentValue(newValue);
        return;
      }
    }
    
    // If we got here, we couldn't find a valid current value
    logDebug('Could not find valid current value', {
      hasLatestData: !!latestData,
      dataLength: data.length
    });
  }, [latestData, data, dataKey, logDebug]);

  const handleDownload = () => {
    // Only execute if we have data
    if (chartData.length === 0) {
      console.warn("No data to download");
      return;
    }
    
    // Create CSV content
    const csvContent = [
      "timestamp," + dataKey, // Header
      ...chartData.map(item => `${item.timestamp},${item[dataKey]}`)
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${title}_data.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format the value to handle potential precision issues
  const formattedLatestValue = typeof currentValue === 'number' 
    ? currentValue.toFixed(1) 
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
            <span 
              className="sensor-value text-xl font-bold" 
              style={{ color }} 
              data-testid={`${dataKey}-value`}
            >
              {formattedLatestValue}
            </span>
            <span className="ml-1">{unit}</span>
          </div>
          <ThresholdBadge 
            currentValue={parseFloat(formattedLatestValue)} 
            threshold={threshold} 
          />
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="h-[200px]">
          {chartData.length > 0 ? (
            <ChartDisplay 
              chartData={chartData}
              dataKey={dataKey}
              color={color}
              title={title}
              unit={unit}
              stats={stats}
              threshold={threshold}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between">
        <ChartStatistics stats={stats} unit={unit} />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleDownload} 
          disabled={chartData.length === 0}
          title="Download chart data"
        >
          <Download className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SensorChart;

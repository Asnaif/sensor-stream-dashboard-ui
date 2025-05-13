
// import { useState, useEffect } from "react";
// import { SensorData } from "@/types";
// import { formatTime } from "@/utils/datetime";
// import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Maximize2, Minimize2, Download } from "lucide-react";
// import { downsampleData, calculateStatistics } from "@/workers/dataWorker";

// // Import our new components
// import ThresholdBadge from "./sensor/ThresholdBadge";
// import ChartStatistics from "./sensor/ChartStatistics";
// import ChartDisplay from "./sensor/ChartDisplay";

// interface SensorChartProps {
//   title: string;
//   data: SensorData[];
//   dataKey: "temperature" | "humidity" | "air_quality";
//   color: string;
//   unit: string;
//   isExpanded?: boolean;
//   onToggleExpand?: () => void;
//   threshold?: { min: number; max: number };
//   latestData?: SensorData | null;
// }

// const SensorChart = ({
//   title,
//   data,
//   dataKey,
//   color,
//   unit,
//   isExpanded = false,
//   onToggleExpand,
//   threshold,
//   latestData
// }: SensorChartProps) => {
//   const [chartData, setChartData] = useState<any[]>([]);
//   const [stats, setStats] = useState({ min: 0, max: 0, avg: 0 });
//   const [currentValue, setCurrentValue] = useState<number>(0);

//   // Process chart data when data array changes
//   useEffect(() => {
//     if (data.length === 0) return;
    
//     // Process the data for the chart
//     const formattedData = data.map((item) => ({
//       timestamp: item.timestamp,
//       [dataKey]: item[dataKey],
//       formattedTime: formatTime(item.timestamp as string)
//     }));
    
//     // Downsample data if there are too many points
//     const downsampledData = downsampleData(formattedData, 100);
//     setChartData(downsampledData);
    
//     // Calculate statistics
//     const calculatedStats = calculateStatistics(data, dataKey);
//     setStats(calculatedStats);
//   }, [data, dataKey]);

//   // Fix: Update current value with the latest data from API
//   useEffect(() => {
//     if (latestData && typeof latestData[dataKey] === 'number') {
//       // Get the value directly from latestData
//       const value = latestData[dataKey];
//       setCurrentValue(value);
//       console.log(`Updated ${title} ${dataKey} value to ${value} from latest data`, latestData);
//     } else if (data.length > 0) {
//       // Fallback to most recent data in the data array
//       const mostRecentData = data[data.length - 1];
//       if (mostRecentData && typeof mostRecentData[dataKey] === 'number') {
//         const value = mostRecentData[dataKey];
//         setCurrentValue(value);
//         console.log(`Updated ${title} ${dataKey} value to ${value} from historic data`, mostRecentData);
//       } else {
//         console.log(`Could not find valid ${dataKey} value in data for ${title}`, mostRecentData);
//       }
//     }
//   }, [latestData, data, title, dataKey]);

//   const handleDownload = () => {
//     alert("Chart export functionality would go here");
//   };

//   // Format the value to handle potential precision issues
//   const formattedLatestValue = typeof currentValue === 'number' 
//     ? currentValue.toFixed(1) 
//     : '0.0';

//   return (
//     <Card className={`chart-container ${isExpanded ? 'col-span-2 row-span-2' : ''}`}>
//       <CardHeader className="p-4 pb-0">
//         <div className="flex justify-between items-center">
//           <CardTitle className="text-lg font-semibold">{title}</CardTitle>
//           {onToggleExpand && (
//             <Button variant="ghost" size="icon" onClick={onToggleExpand}>
//               {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
//             </Button>
//           )}
//         </div>
//         <div className="flex items-center justify-between mt-1">
//           <div>
//             <span className="sensor-value text-lg font-bold" style={{ color }}>
//               {formattedLatestValue}
//             </span>
//             <span className="ml-1">{unit}</span>
//           </div>
//           <ThresholdBadge 
//             currentValue={parseFloat(formattedLatestValue)} 
//             threshold={threshold} 
//           />
//         </div>
//       </CardHeader>

//       <CardContent className="p-4">
//         <div className="h-[200px]">
//           <ChartDisplay 
//             chartData={chartData}
//             dataKey={dataKey}
//             color={color}
//             title={title}
//             unit={unit}
//             stats={stats}
//             threshold={threshold}
//           />
//         </div>
//       </CardContent>

//       <CardFooter className="p-4 pt-0 flex justify-between">
//         <ChartStatistics stats={stats} unit={unit} />
//         <Button variant="ghost" size="icon" onClick={handleDownload} title="Download chart data">
//           <Download className="h-4 w-4" />
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// };

// export default SensorChart;
// FIXED SensorChart component with improved value handling

// import { useState, useEffect } from "react";
// import { SensorData } from "@/types";
// import { formatTime } from "@/utils/datetime";
// import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Maximize2, Minimize2, Download } from "lucide-react";
// import { downsampleData, calculateStatistics } from "@/workers/dataWorker";

// // Import our components
// import ThresholdBadge from "./sensor/ThresholdBadge";
// import ChartStatistics from "./sensor/ChartStatistics";
// import ChartDisplay from "./sensor/ChartDisplay";

// interface SensorChartProps {
//   title: string;
//   data: SensorData[];
//   dataKey: "temperature" | "humidity" | "air_quality";
//   color: string;
//   unit: string;
//   isExpanded?: boolean;
//   onToggleExpand?: () => void;
//   threshold?: { min: number; max: number };
//   latestData?: SensorData | null;
// }

// const SensorChart = ({
//   title,
//   data,
//   dataKey,
//   color,
//   unit,
//   isExpanded = false,
//   onToggleExpand,
//   threshold,
//   latestData
// }: SensorChartProps) => {
//   const [chartData, setChartData] = useState<any[]>([]);
//   const [stats, setStats] = useState({ min: 0, max: 0, avg: 0 });
//   const [currentValue, setCurrentValue] = useState<number>(0);

//   // Process chart data when data array changes
//   useEffect(() => {
//     if (data.length === 0) return;
    
//     // Process the data for the chart
//     const formattedData = data.map((item) => ({
//       timestamp: item.timestamp,
//       [dataKey]: item[dataKey],
//       formattedTime: formatTime(item.timestamp as string)
//     }));
    
//     // Downsample data if there are too many points
//     const downsampledData = downsampleData(formattedData, 100);
//     setChartData(downsampledData);
    
//     // Calculate statistics
//     const calculatedStats = calculateStatistics(data, dataKey);
//     setStats(calculatedStats);
//   }, [data, dataKey]);

//   // FIXED: Always prioritize latestData for display
//   useEffect(() => {
//     // First priority: Get value from latestData
//     if (latestData && typeof latestData[dataKey] === 'number') {
//       setCurrentValue(latestData[dataKey] as number);
//       return;
//     }
    
//     // Second priority: Get value from the most recent data point in the data array
//     if (data.length > 0) {
//       const mostRecentData = data[data.length - 1];
//       if (mostRecentData && typeof mostRecentData[dataKey] === 'number') {
//         setCurrentValue(mostRecentData[dataKey] as number);
//         return;
//       }
//     }
    
//     // If we got here, we couldn't find a valid current value
//     console.warn(`${title}: Could not find valid ${dataKey} value`);
//   }, [latestData, data, dataKey, title]);

//   const handleDownload = () => {
//     alert("Chart export functionality would go here");
//   };

//   // Format the value to handle potential precision issues
//   const formattedLatestValue = typeof currentValue === 'number' 
//     ? currentValue.toFixed(1) 
//     : '0.0';

//   return (
//     <Card className={`chart-container ${isExpanded ? 'col-span-2 row-span-2' : ''}`}>
//       <CardHeader className="p-4 pb-0">
//         <div className="flex justify-between items-center">
//           <CardTitle className="text-lg font-semibold">{title}</CardTitle>
//           {onToggleExpand && (
//             <Button variant="ghost" size="icon" onClick={onToggleExpand}>
//               {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
//             </Button>
//           )}
//         </div>
//         <div className="flex items-center justify-between mt-1">
//           <div>
//             <span className="sensor-value text-xl font-bold" style={{ color }}>
//               {formattedLatestValue}
//             </span>
//             <span className="ml-1">{unit}</span>
//           </div>
//           <ThresholdBadge 
//             currentValue={parseFloat(formattedLatestValue)} 
//             threshold={threshold} 
//           />
//         </div>
//       </CardHeader>

//       <CardContent className="p-4">
//         <div className="h-[200px]">
//           <ChartDisplay 
//             chartData={chartData}
//             dataKey={dataKey}
//             color={color}
//             title={title}
//             unit={unit}
//             stats={stats}
//             threshold={threshold}
//           />
//         </div>
//       </CardContent>

//       <CardFooter className="p-4 pt-0 flex justify-between">
//         <ChartStatistics stats={stats} unit={unit} />
//         <Button variant="ghost" size="icon" onClick={handleDownload} title="Download chart data">
//           <Download className="h-4 w-4" />
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// };

// export default SensorChart;

// Fix for SensorChart.jsx

import { useState, useEffect } from "react";
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

  // Process chart data when data array changes
  useEffect(() => {
    if (data.length === 0) return;
    
    // Process the data for the chart
    const formattedData = data.map((item) => ({
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
    const calculatedStats = calculateStatistics(data, dataKey);
    setStats(calculatedStats);
  }, [data, dataKey]);

  // Fixed version: Always prioritize latestData for current value display
  useEffect(() => {
    // First priority: Get value from latestData
    if (latestData && typeof latestData[dataKey] === 'number') {
      console.log(`${title}: Setting current value from latestData:`, latestData[dataKey]);
      setCurrentValue(latestData[dataKey] as number);
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
        console.log(`${title}: Setting current value from mostRecentData:`, mostRecentData[dataKey]);
        setCurrentValue(mostRecentData[dataKey] as number);
        return;
      }
    }
    
    // If we got here, we couldn't find a valid current value
    console.warn(`${title}: Could not find valid ${dataKey} value`);
  }, [latestData, data, dataKey, title]);

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
            <span className="sensor-value text-xl font-bold" style={{ color }}>
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
          <ChartDisplay 
            chartData={chartData}
            dataKey={dataKey}
            color={color}
            title={title}
            unit={unit}
            stats={stats}
            threshold={threshold}
          />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between">
        <ChartStatistics stats={stats} unit={unit} />
        <Button variant="ghost" size="icon" onClick={handleDownload} title="Download chart data">
          <Download className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SensorChart;

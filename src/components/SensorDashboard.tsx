
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SensorData, ChartPreference } from "@/types";
import { sensorApi } from "@/services/api";
import socketService from "@/services/socket";
import { useToast } from "@/components/ui/use-toast";
import { getDateRangeOptions, formatDateISO } from "@/utils/datetime";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import SensorChart from "./SensorChart";
import SensorDataTable from "./SensorDataTable";
import SaveChartModal from "./SaveChartModal";
import { Calendar as CalendarIcon, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

const dateRangeOptions = getDateRangeOptions();

const SensorDashboard = () => {
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState(dateRangeOptions[2]); // Last 7 days default
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(selectedDateRange.start)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(selectedDateRange.end)
  );
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { preferences } = usePreferences();

  // Set default thresholds for sensors
  const thresholds = {
    temperature: { min: 18, max: 30 },
    humidity: { min: 30, max: 70 },
    air_quality: { min: 0, max: 100 }
  };

  // Query to fetch latest sensor data
  const { data: latestSensorData, isLoading: isLatestDataLoading } = useQuery({
    queryKey: ['latestSensorData'],
    queryFn: async () => {
      const response = await sensorApi.getLatest();
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch latest sensor data');
      }
      return response.data;
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Latest data fetch error",
          description: error.message || "Failed to fetch latest sensor data",
          variant: "destructive"
        });
      }
    }
  });

  // Query to fetch all sensor data for historical view
  const { data: allSensorData, isLoading: isAllDataLoading } = useQuery({
    queryKey: ['allSensorData'],
    queryFn: async () => {
      const response = await sensorApi.getAll();
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch all sensor data');
      }
      console.log('Fetched all sensor data from API:', response.data.length, 'records');
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for historical data updates
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Historical data fetch error",
          description: error.message || "Failed to fetch all sensor data",
          variant: "destructive"
        });
      }
    }
  });

  // Update state when data is fetched
  useEffect(() => {
    if (latestSensorData) {
      console.log('Latest sensor data updated:', latestSensorData);
      setLatestData(latestSensorData);
    }
  }, [latestSensorData]);
  
  useEffect(() => {
    if (allSensorData && allSensorData.length > 0) {
      console.log('Historical sensor data updated with', allSensorData.length, 'records');
      setHistoricalData(allSensorData);
    }
  }, [allSensorData]);

  // Connect to socket service for real-time updates
  useEffect(() => {
    socketService.connect();
    
    const unsubscribe = socketService.onSensorUpdate((data) => {
      console.log('Socket received real-time data update:', data);
      setLatestData(data);
      
      // Add new data to historical data (to avoid having to refetch the full dataset)
      setHistoricalData(prev => {
        // Check if this data is already in our historical dataset to avoid duplicates
        const exists = prev.some(item => item._id === data._id);
        if (!exists) {
          return [...prev, data];
        }
        return prev;
      });
    });
    
    return () => {
      unsubscribe();
      socketService.disconnect();
    };
  }, []);

  // Handle custom date range selection
  useEffect(() => {
    if (startDate && endDate) {
      const formattedStart = formatDateISO(startDate);
      const formattedEnd = formatDateISO(endDate);
      
      setSelectedDateRange({
        label: `Custom (${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')})`,
        start: formattedStart,
        end: formattedEnd
      });
    }
  }, [startDate, endDate]);

  const handleDateRangeChange = (value: string) => {
    if (value === 'custom') {
      // Open date picker
      return;
    }
    
    const selectedOption = dateRangeOptions.find(option => option.label === value);
    if (selectedOption) {
      setSelectedDateRange(selectedOption);
      
      // Update date pickers to match
      setStartDate(new Date(selectedOption.start));
      setEndDate(new Date(selectedOption.end));
    }
  };

  // Filter data based on selected date range
  const getFilteredData = () => {
    if (!historicalData.length) return [];
    
    const startTimestamp = new Date(selectedDateRange.start).getTime();
    const endTimestamp = new Date(selectedDateRange.end).getTime();
    
    return historicalData.filter(item => {
      const itemTimestamp = new Date(item.timestamp as string).getTime();
      return itemTimestamp >= startTimestamp && itemTimestamp <= endTimestamp;
    });
  };

  const filteredData = getFilteredData();

  const toggleExpandChart = (chartId: string) => {
    setExpandedChart(expandedChart === chartId ? null : chartId);
  };

  const handleLoadPreference = (preference: ChartPreference) => {
    // Apply the saved chart preference
    setChartType(preference.chartType);
    
    if (preference.timeRange === 'custom' && preference.startDate && preference.endDate) {
      const start = new Date(preference.startDate);
      const end = new Date(preference.endDate);
      setStartDate(start);
      setEndDate(end);
      setSelectedDateRange({
        label: `Custom (${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')})`,
        start: preference.startDate,
        end: preference.endDate
      });
    } else if (preference.timeRange !== 'custom') {
      const selectedOption = dateRangeOptions.find(option => {
        if (preference.timeRange === 'hour') return option.label === 'Today';
        if (preference.timeRange === 'day') return option.label === 'Today';
        if (preference.timeRange === 'week') return option.label === 'Last 7 days';
        if (preference.timeRange === 'month') return option.label === 'Last 30 days';
        return false;
      });
      
      if (selectedOption) {
        setSelectedDateRange(selectedOption);
        setStartDate(new Date(selectedOption.start));
        setEndDate(new Date(selectedOption.end));
      }
    }
    
    toast({
      title: "Chart view loaded",
      description: `"${preference.name}" settings applied to dashboard`,
    });
  };

  const getCurrentChartSettings = (): Omit<ChartPreference, 'id' | 'name' | 'createdAt' | 'updatedAt'> => {
    let timeRange: ChartPreference['timeRange'];
    
    if (selectedDateRange.label === 'Today') timeRange = 'day';
    else if (selectedDateRange.label === 'Last 7 days') timeRange = 'week';
    else if (selectedDateRange.label === 'Last 30 days') timeRange = 'month';
    else if (selectedDateRange.label.startsWith('Custom')) timeRange = 'custom';
    else timeRange = 'week'; // Default
    
    return {
      chartType,
      sensors: ['temperature', 'humidity', 'air_quality'],
      timeRange,
      startDate: startDate ? formatDateISO(startDate) : undefined,
      endDate: endDate ? formatDateISO(endDate) : undefined,
      thresholds,
      layout: {
        columns: preferences.viewMode === 'grid' ? 2 : 1,
        rows: 2
      }
    };
  };

  const isLoading = isLatestDataLoading && isAllDataLoading && historicalData.length === 0;

  return (
    <div className="container py-6 space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Sensor Monitoring</CardTitle>
              <CardDescription>
                Real-time and historical sensor data visualization
                {!isLoading && historicalData && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({historicalData.length} records)
                  </span>
                )}
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select
                value={chartType}
                onValueChange={(value) => setChartType(value as any)}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={selectedDateRange.label}
                onValueChange={handleDateRangeChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map((option) => (
                    <SelectItem key={option.label} value={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-[240px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate && endDate ? (
                      <>
                        {format(startDate, "PPP")} - {format(endDate, "PPP")}
                      </>
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="flex">
                    <div className="border-r">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </div>
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </div>
                </PopoverContent>
              </Popover>
              
              {isAuthenticated && (
                <Button onClick={() => setShowSaveModal(true)}>
                  <Save className="mr-2 h-4 w-4" />
                  Save View
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="charts" className="space-y-4">
            <TabsList>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="table">Data Table</TabsTrigger>
            </TabsList>
            
            <TabsContent value="charts" className="space-y-4">
              {isLoading ? (
                <div className={`grid gap-4 ${preferences.viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  <Skeleton className="h-[300px] rounded-lg" />
                  <Skeleton className="h-[300px] rounded-lg" />
                  <Skeleton className="h-[300px] rounded-lg" />
                </div>
              ) : (
                <div className={`grid gap-4 ${preferences.viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  <SensorChart
                    title="Temperature"
                    data={filteredData}
                    dataKey="temperature"
                    color="#3a86ff"
                    unit="°C"
                    isExpanded={expandedChart === 'temperature'}
                    onToggleExpand={() => toggleExpandChart('temperature')}
                    threshold={thresholds.temperature}
                  />
                  
                  <SensorChart
                    title="Humidity"
                    data={filteredData}
                    dataKey="humidity"
                    color="#8338ec"
                    unit="%"
                    isExpanded={expandedChart === 'humidity'}
                    onToggleExpand={() => toggleExpandChart('humidity')}
                    threshold={thresholds.humidity}
                  />
                  
                  <SensorChart
                    title="Air Quality"
                    data={filteredData}
                    dataKey="air_quality"
                    color="#ef476f"
                    unit="AQI"
                    isExpanded={expandedChart === 'air_quality'}
                    onToggleExpand={() => toggleExpandChart('air_quality')}
                    threshold={thresholds.air_quality}
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="table">
              <SensorDataTable data={filteredData} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Save Chart Modal */}
      <SaveChartModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        currentSettings={getCurrentChartSettings()}
      />
    </div>
  );
};

export default SensorDashboard;

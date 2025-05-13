import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SensorData, ChartPreference } from "@/types";
import { sensorApi } from "@/services/api";
import socketService from "@/services/socket";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
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
  const [useSocketFallback, setUseSocketFallback] = useState<boolean>(false);
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const [dataRefreshKey, setDataRefreshKey] = useState<number>(0); // Added a key to force re-renders
  
  const { toast: uiToast } = useToast();
  const { isAuthenticated } = useAuth();
  const { preferences } = usePreferences();

  // Set default thresholds for sensors
  const thresholds = {
    temperature: { min: 18, max: 30 },
    humidity: { min: 30, max: 70 },
    air_quality: { min: 0, max: 1000 }
  };

  // Query to fetch latest sensor data with retry and error handling improvements
  const { data: latestSensorData, isLoading: isLatestDataLoading, isError: isLatestDataError } = useQuery({
    queryKey: ['latestSensorData', dataRefreshKey], // Added dataRefreshKey to force refetch
    queryFn: async () => {
      try {
        console.log('Fetching latest sensor data from API');
        const response = await sensorApi.getLatest();
        console.log('Latest sensor data response:', response);
        
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch latest sensor data');
        }
        
        // API is working, no need for socket fallback
        if (useSocketFallback) {
          console.log('API working again, disabling socket fallback');
          setUseSocketFallback(false);
          
          // Disconnect socket if it was being used
          if (isSocketConnected) {
            try {
              socketService.disconnect();
              setIsSocketConnected(false);
            } catch (e) {
              console.warn('Error disconnecting socket:', e);
            }
          }
        }
        
        return response.data;
      } catch (error) {
        // API failed, enable socket fallback
        console.warn('API failed, enabling socket fallback mode', error);
        setUseSocketFallback(true);
        throw error;
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    retry: 2,
    refetchOnWindowFocus: true, // Refetch when window regains focus
    meta: {
      onSettled: (data, error) => {
        if (error) {
          console.error('Error fetching latest data:', error);
          toast.error(`Failed to fetch latest sensor data. Using cached data.`);
        }
      }
    }
  });

  // Query to fetch all sensor data for historical view with improved error handling
  const { data: allSensorData, isLoading: isAllDataLoading, isError: isAllDataError } = useQuery({
    queryKey: ['allSensorData', dataRefreshKey], // Added dataRefreshKey to force refetch
    queryFn: async () => {
      try {
        console.log('Fetching all sensor data from API');
        const response = await sensorApi.getAll();
        
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch all sensor data');
        }
        
        console.log('Fetched all sensor data from API:', response.data.length, 'records');
        
        // Important: Sort data chronologically
        const sortedData = [...response.data].sort((a, b) => 
          new Date(a.timestamp as string).getTime() - new Date(b.timestamp as string).getTime()
        );
        
        return sortedData;
      } catch (error) {
        console.warn('Failed to fetch historical data from API', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds for historical data updates
    retry: 2,
    meta: {
      onSettled: (data, error) => {
        if (error) {
          console.error('Error fetching historical data:', error);
          toast.error(`Failed to fetch historical sensor data. Using cached data.`);
        }
      }
    }
  });

  // Force data refresh when needed (can be triggered by error handlers)
  const refreshData = () => {
    console.log('Forcing data refresh');
    setDataRefreshKey(prev => prev + 1);
  };

  // Effect to handle both latest and historical data from API with better error handling
  useEffect(() => {
    // Update latest data state first if we have valid data
    if (latestSensorData) {
      console.log('Latest sensor data updated from API:', latestSensorData);
      // Only update if we have valid data
      if (
        latestSensorData.temperature !== undefined && 
        latestSensorData.humidity !== undefined && 
        latestSensorData.air_quality !== undefined
      ) {
        setLatestData(latestSensorData);
      } else {
        console.warn('Latest data has undefined values:', latestSensorData);
      }
    }
    
    // Then handle the full historical dataset if available
    if (allSensorData && allSensorData.length > 0) {
      console.log('Historical sensor data updated with', allSensorData.length, 'records');
      
      // Filter out any records with undefined sensor values
      const validHistoricalData = allSensorData.filter(item => 
        item.temperature !== undefined && 
        item.humidity !== undefined && 
        item.air_quality !== undefined
      );
      
      if (validHistoricalData.length !== allSensorData.length) {
        console.warn(`Filtered out ${allSensorData.length - validHistoricalData.length} records with undefined values`);
      }
      
      // Make sure data is sorted chronologically
      let updatedHistoricalData = [...validHistoricalData].sort((a, b) => 
        new Date(a.timestamp as string).getTime() - new Date(b.timestamp as string).getTime()
      );
      
      // If we have latest data that's not in the historical data, add it
      if (latestData && latestData.temperature !== undefined) {
        const latestExists = updatedHistoricalData.some(
          item => item._id === latestData._id
        );
        
        if (!latestExists) {
          // Place it at the end (chronologically most recent)
          updatedHistoricalData.push(latestData);
        }
      }
      
      // Update the state with valid data
      setHistoricalData(updatedHistoricalData);
      
      // Debug the latest values
      if (updatedHistoricalData.length > 0) {
        const latest = updatedHistoricalData[updatedHistoricalData.length - 1];
        console.log('Latest values from historicalData:', {
          temperature: latest.temperature,
          humidity: latest.humidity,
          air_quality: latest.air_quality
        });
      }
    }
  }, [latestSensorData, allSensorData, latestData]);

  // Socket fallback management - connect/disconnect based on API status
  useEffect(() => {
    // Check if we need to use socket fallback
    const needsFallback = useSocketFallback || (isLatestDataError && isAllDataError);
    
    if (needsFallback && !isSocketConnected) {
      // We need fallback and socket is not connected - connect it
      console.log('API data unavailable, connecting to socket fallback service');
      try {
        socketService.connect();
        setIsSocketConnected(true);
      } catch (e) {
        console.error('Failed to connect to socket service:', e);
      }
    } else if (!needsFallback && isSocketConnected) {
      // We don't need fallback but socket is connected - disconnect it
      console.log('API data available, disconnecting socket fallback service');
      try {
        socketService.disconnect();
        setIsSocketConnected(false);
      } catch (e) {
        console.warn('Error disconnecting socket:', e);
      }
    }
    
    // Only set up socket listener if we're connected
    if (isSocketConnected) {
      const unsubscribe = socketService.onSensorUpdate((data) => {
        console.log('Socket received data update (fallback mode):', data);
        
        if (data) {
          // Validate data before using it
          if (data.temperature !== undefined && data.humidity !== undefined && data.air_quality !== undefined) {
            // Update latest data
            if (!latestData || new Date(data.timestamp) > new Date(latestData.timestamp)) {
              console.log('Updating latestData from socket with:', data);
              setLatestData(data);
            }
            
            // Add to historical data if not already present
            setHistoricalData(prevData => {
              const exists = prevData.some(item => item._id === data._id);
              if (!exists) {
                return [...prevData, data].sort((a, b) => 
                  new Date(a.timestamp as string).getTime() - new Date(b.timestamp as string).getTime()
                );
              }
              return prevData;
            });
          } else {
            console.warn('Socket data has undefined values:', data);
          }
        }
      });
      
      // Return cleanup function
      return () => {
        console.log('Cleaning up socket listener');
        unsubscribe();
      };
    }
    
    return undefined;
  }, [useSocketFallback, isLatestDataError, isAllDataError, isSocketConnected, latestData]);

  // Disconnect socket on component unmount to prevent leaked connections
  useEffect(() => {
    return () => {
      if (isSocketConnected) {
        console.log('Component unmounting, disconnecting socket');
        try {
          socketService.disconnect();
        } catch (e) {
          console.warn('Error disconnecting socket on unmount:', e);
        }
      }
    };
  }, [isSocketConnected]);

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

  // Filter data based on selected date range
  const getFilteredData = () => {
    if (!historicalData.length) return [];
    
    const startTimestamp = new Date(selectedDateRange.start).getTime();
    const endTimestamp = new Date(selectedDateRange.end).getTime();
    
    const filtered = historicalData.filter(item => {
      const itemTimestamp = new Date(item.timestamp as string).getTime();
      return itemTimestamp >= startTimestamp && itemTimestamp <= endTimestamp;
    });
    
    // Make sure data is sorted chronologically
    return filtered.sort((a, b) => 
      new Date(a.timestamp as string).getTime() - new Date(b.timestamp as string).getTime()
    );
  };

  const filteredData = getFilteredData();

  const toggleExpandChart = (chartId: string) => {
    setExpandedChart(expandedChart === chartId ? null : chartId);
  };

  const handleDateRangeChange = (value: string) => {
    if (value === "custom") {
      // Keep the current custom dates if they exist
      return;
    }
    
    const selectedOption = dateRangeOptions.find(option => option.label === value);
    if (selectedOption) {
      setSelectedDateRange(selectedOption);
      setStartDate(new Date(selectedOption.start));
      setEndDate(new Date(selectedOption.end));
    }
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
    
    toast.success(`Applied chart settings: "${preference.name}"`);
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

  // Important: Make sure we always have access to the latest data for display
  const isLoading = isLatestDataLoading && isAllDataLoading && historicalData.length === 0;
  
  // Show data source indicator for user awareness
  const dataSourceIndicator = isSocketConnected 
    ? "Using socket fallback (mock data)" 
    : "Using API data";
    
  // Debug information about current data
  console.log('Current data state:', { 
    latestData: latestData ? {
      temperature: latestData.temperature,
      humidity: latestData.humidity,
      air_quality: latestData.air_quality,
      timestamp: latestData.timestamp
    } : null,
    filteredDataLength: filteredData.length,
    isLoading
  });

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
                {isSocketConnected && (
                  <span className="ml-2 text-xs text-amber-500 font-semibold">
                    {dataSourceIndicator}
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
              
              <Button onClick={refreshData} variant="outline" className="ml-2">
                Refresh Data
              </Button>
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
                    latestData={latestData}
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
                    latestData={latestData}
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
                    latestData={latestData}
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
      
      {/* DEBUG: Add a debug panel for development */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-mono overflow-auto max-h-[300px] p-2 bg-gray-100 rounded">
              <div>Data source: {dataSourceIndicator}</div>
              <div>Socket connected: {isSocketConnected ? 'Yes' : 'No'}</div>
              <div>Latest data: {latestData ? JSON.stringify({
                temperature: latestData.temperature,
                humidity: latestData.humidity,
                air_quality: latestData.air_quality,
                timestamp: latestData.timestamp
              }) : 'null'}</div>
              <div>Historical data count: {historicalData.length}</div>
              <div>Filtered data count: {filteredData.length}</div>
              <div>Date range: {selectedDateRange.start} to {selectedDateRange.end}</div>
              <div>API status: Latest={isLatestDataError ? 'Error' : 'OK'}, Historical={isAllDataError ? 'Error' : 'OK'}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SensorDashboard;


import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const dateRangeOptions = getDateRangeOptions();

const SensorDashboard = () => {
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Connect to socket service for real-time updates
  useEffect(() => {
    socketService.connect();
    
    const unsubscribe = socketService.onSensorUpdate((data) => {
      setLatestData(data);
      setHistoricalData(prev => [...prev, data].slice(-100)); // Keep last 100 records in memory
    });
    
    return () => {
      unsubscribe();
      socketService.disconnect();
    };
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Get latest sensor reading
        const latestResponse = await sensorApi.getLatest();
        if (latestResponse.success && latestResponse.data) {
          setLatestData(latestResponse.data);
        }
        
        // Get filtered historical data
        const filteredResponse = await sensorApi.getFiltered(
          selectedDateRange.start,
          selectedDateRange.end
        );
        
        if (filteredResponse.success && filteredResponse.data) {
          setHistoricalData(filteredResponse.data);
        }
      } catch (error) {
        toast({
          title: "Data fetch error",
          description: (error as Error).message || "Failed to fetch sensor data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [selectedDateRange, toast]);

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

  return (
    <div className="container py-6 space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Sensor Monitoring</CardTitle>
              <CardDescription>
                Real-time and historical sensor data visualization
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
                    data={historicalData}
                    dataKey="temperature"
                    color="#3a86ff"
                    unit="°C"
                    isExpanded={expandedChart === 'temperature'}
                    onToggleExpand={() => toggleExpandChart('temperature')}
                    threshold={thresholds.temperature}
                  />
                  
                  <SensorChart
                    title="Humidity"
                    data={historicalData}
                    dataKey="humidity"
                    color="#8338ec"
                    unit="%"
                    isExpanded={expandedChart === 'humidity'}
                    onToggleExpand={() => toggleExpandChart('humidity')}
                    threshold={thresholds.humidity}
                  />
                  
                  <SensorChart
                    title="Air Quality"
                    data={historicalData}
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
              <SensorDataTable data={historicalData} />
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

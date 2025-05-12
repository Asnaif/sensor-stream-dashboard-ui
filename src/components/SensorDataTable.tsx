
// import { useState, useEffect } from "react";
// import { SensorData } from "@/types";
// import { formatDateTime } from "@/utils/datetime";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// import { Download, Search, ChevronLeft, ChevronRight } from "lucide-react";
// import { generateCSV } from "@/workers/dataWorker";

// interface SensorDataTableProps {
//   data: SensorData[];
//   title?: string;
// }

// const SensorDataTable = ({ data, title = "Sensor Data History" }: SensorDataTableProps) => {
//   const [page, setPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredData, setFilteredData] = useState<SensorData[]>([]);
//   const itemsPerPage = 10;

//   useEffect(() => {
//   setSearchTerm("");
// }, []);


//   useEffect(() => {
//     // Filter data based on search term
//     const filtered = searchTerm
//       ? data.filter(item => {
//           const timestamp = formatDateTime(item.timestamp as string).toLowerCase();
//           const term = searchTerm.toLowerCase();
          
//           return (
//             timestamp.includes(term) ||
//             item.temperature.toString().includes(term) ||
//             item.humidity.toString().includes(term) ||
//             item.air_quality.toString().includes(term)
//           );
//         })
//       : data;

//     setFilteredData(filtered);
//     // Reset to first page when search changes
//     setPage(1);
//   }, [data, searchTerm]);

//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
//   const startIndex = (page - 1) * itemsPerPage;
//   const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

//   const downloadCSV = () => {
//     if (filteredData.length === 0) return;
    
//     const csvContent = generateCSV(filteredData);
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
    
//     const link = document.createElement("a");
//     link.setAttribute("href", url);
//     link.setAttribute("download", `sensor_data_${new Date().toISOString().split('T')[0]}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <Card className="overflow-hidden">
//       <CardHeader className="p-4 pb-0">
//         <div className="flex flex-wrap justify-between items-center gap-2">
//           <CardTitle className="text-lg font-semibold">{title}</CardTitle>
//           <div className="flex gap-2">
//             <div className="relative">
//               <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//               <Input
//                 placeholder="Search data..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-8 h-8 w-[180px] sm:w-[200px]"
//               />
//             </div>
//             <Button variant="outline" size="sm" onClick={downloadCSV}>
//               <Download className="h-4 w-4 mr-1" />
//               Export
//             </Button>
//           </div>
//         </div>
//       </CardHeader>

//       <CardContent className="p-4">
//         <div className="rounded-md border overflow-auto">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[180px]">Timestamp</TableHead>
//                 <TableHead>Temperature (°C)</TableHead>
//                 <TableHead>Humidity (%)</TableHead>
//                 <TableHead>Air Quality</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {paginatedData.length > 0 ? (
//                 paginatedData.map((item) => (
//                   <TableRow key={item._id}>
//                     <TableCell className="font-medium">
//                       {formatDateTime(item.timestamp as string)}
//                     </TableCell>
//                     <TableCell>{item.temperature.toFixed(1)}</TableCell>
//                     <TableCell>{item.humidity.toFixed(1)}</TableCell>
//                     <TableCell>
//                       <div className="flex items-center gap-2">
//                         <span>{item.air_quality.toFixed(0)}</span>
//                         <div
//                           className="h-2 w-16 rounded-full"
//                           style={{
//                             background: `linear-gradient(90deg, ${
//                               item.air_quality <= 50 ? 'green' :
//                               item.air_quality <= 100 ? 'yellow' :
//                               item.air_quality <= 150 ? 'orange' : 'red'
//                             } ${Math.min(item.air_quality / 2, 100)}%, transparent ${Math.min(item.air_quality / 2, 100)}%)`
//                           }}
//                         />
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
//                     {data.length === 0 ? "No data available" : "No matching records found"}
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       </CardContent>

//       {totalPages > 1 && (
//         <CardFooter className="p-4 pt-0 flex justify-between items-center">
//           <div className="text-sm text-muted-foreground">
//             Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
//           </div>
//           <div className="flex gap-1">
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={() => setPage(page - 1)}
//               disabled={page === 1}
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </Button>
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={() => setPage(page + 1)}
//               disabled={page === totalPages}
//             >
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>
//         </CardFooter>
//       )}
//     </Card>
//   );
// };

// export default SensorDataTable;



import { useState, useEffect, useCallback } from "react";
import { SensorData } from "@/types";
import { formatDateTime } from "@/utils/datetime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Download, Search, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { generateCSV } from "@/workers/dataWorker";

interface SensorDataTableProps {
  data: SensorData[];
  title?: string;
}

// Function to fetch latest data directly from the component
const fetchLatestData = async (): Promise<SensorData[]> => {
  try {
    const response = await fetch("/api/sensors?limit=1500");
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch latest sensor data:", error);
    return [];
  }
};

const SensorDataTable = ({ 
  data: initialData, 
  title = "Sensor Data History" 
}: SensorDataTableProps) => {
  // State for sensor data
  const [data, setData] = useState<SensorData[]>(initialData || []);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<SensorData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const itemsPerPage = 10;

  // Keep track of whether we've received new data from props
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setData(sortDataByTimestamp(initialData));
      setLastUpdated(new Date());
    }
  }, [initialData]);

  // Sort function for timestamp (newest first)
  const sortDataByTimestamp = (dataToSort: SensorData[]): SensorData[] => {
    return [...dataToSort].sort((a, b) => {
      const dateA = new Date(a.timestamp as string).getTime();
      const dateB = new Date(b.timestamp as string).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  };

  // Refresh function to fetch latest data
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      const freshData = await fetchLatestData();
      if (freshData && freshData.length > 0) {
        const sortedData = sortDataByTimestamp(freshData);
        setData(sortedData);
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError("Failed to refresh data. Please try again.");
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshData();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [refreshData]);
  
  // Filter data when search term changes
  useEffect(() => {
    const filtered = searchTerm
      ? data.filter(item => {
          const timestamp = formatDateTime(item.timestamp as string).toLowerCase();
          const term = searchTerm.toLowerCase();
          
          return (
            timestamp.includes(term) ||
            item.temperature.toString().includes(term) ||
            item.humidity.toString().includes(term) ||
            item.air_quality.toString().includes(term)
          );
        })
      : data;

    setFilteredData(filtered);
    
    // Reset to first page when search changes
    setPage(1);
  }, [data, searchTerm]);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  
  // Ensure page is valid
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);
  
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Download CSV function
  const downloadCSV = () => {
    if (filteredData.length === 0) return;
    
    const csvContent = generateCSV(filteredData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sensor_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div>
            <CardTitle className="text-lg font-semibold">
              {title} ({data.length} records)
            </CardTitle>
            <div className="text-xs text-muted-foreground mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 w-[180px] sm:w-[200px]"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={downloadCSV}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      {error && (
        <div className="mx-4 mt-4 p-2 bg-red-50 text-red-600 rounded flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <CardContent className="p-4">
        {paginatedData.length === 0 && !isRefreshing ? (
          <div className="text-center p-8 text-muted-foreground">
            {searchTerm ? "No matching records found" : "No data available"}
          </div>
        ) : (
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Temperature (°C)</TableHead>
                  <TableHead>Humidity (%)</TableHead>
                  <TableHead>Air Quality</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isRefreshing && paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                      <span className="text-sm text-muted-foreground">Loading data...</span>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item, index) => {
                    // Check if this is new data (less than 1 minute old)
                    const timestamp = new Date(item.timestamp as string);
                    const isNew = (new Date().getTime() - timestamp.getTime()) < 60000;
                    
                    return (
                      <TableRow key={item._id || `sensor-data-${index}`}>
                        <TableCell className="font-medium">
                          {formatDateTime(item.timestamp as string)}
                        </TableCell>
                        <TableCell>{item.temperature.toFixed(1)}</TableCell>
                        <TableCell>{item.humidity.toFixed(1)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{item.air_quality.toFixed(0)}</span>
                            <div
                              className="h-2 w-16 rounded-full"
                              style={{
                                background: `linear-gradient(90deg, ${
                                  item.air_quality <= 50 ? 'green' :
                                  item.air_quality <= 100 ? 'yellow' :
                                  item.air_quality <= 150 ? 'orange' : 'red'
                                } ${Math.min(item.air_quality / 2, 100)}%, transparent ${Math.min(item.air_quality / 2, 100)}%)`
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          {isNew && (
                            <Badge variant="outline" className="bg-green-50 text-green-600 text-xs">
                              New
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {totalPages > 1 && (
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {filteredData.length > 0 ? `${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredData.length)} of ${filteredData.length}` : '0'} entries
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Page number display */}
            {totalPages <= 7 ? (
              [...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "default" : "outline"}
                  size="icon"
                  onClick={() => setPage(i + 1)}
                  className="w-8 h-8"
                >
                  <span className="text-xs">{i + 1}</span>
                </Button>
              ))
            ) : (
              <>
                {/* First page */}
                <Button
                  variant={page === 1 ? "default" : "outline"}
                  size="icon"
                  onClick={() => setPage(1)}
                  className="w-8 h-8"
                >
                  <span className="text-xs">1</span>
                </Button>
                
                {/* Ellipsis or page numbers */}
                {page > 3 && (
                  <Button variant="outline" size="icon" disabled className="w-8 h-8">
                    <span className="text-xs">...</span>
                  </Button>
                )}
                
                {/* Current page and neighbors */}
                {[...Array(3)].map((_, i) => {
                  const pageNum = Math.min(
                    Math.max(page - 1 + i, 2),
                    totalPages - 1
                  );
                  // Only show if in valid range and not showing first/last page
                  if (pageNum > 1 && pageNum < totalPages) {
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="icon"
                        onClick={() => setPage(pageNum)}
                        className="w-8 h-8"
                      >
                        <span className="text-xs">{pageNum}</span>
                      </Button>
                    );
                  }
                  return null;
                })}
                
                {/* Ellipsis */}
                {page < totalPages - 2 && (
                  <Button variant="outline" size="icon" disabled className="w-8 h-8">
                    <span className="text-xs">...</span>
                  </Button>
                )}
                
                {/* Last page */}
                <Button
                  variant={page === totalPages ? "default" : "outline"}
                  size="icon"
                  onClick={() => setPage(totalPages)}
                  className="w-8 h-8"
                >
                  <span className="text-xs">{totalPages}</span>
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default SensorDataTable;

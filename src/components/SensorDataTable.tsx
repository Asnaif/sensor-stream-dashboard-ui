
import { useState, useEffect } from "react";
import { SensorData } from "@/types";
import { formatDateTime } from "@/utils/datetime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Download, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { generateCSV } from "@/workers/dataWorker";

interface SensorDataTableProps {
  data: SensorData[];
  title?: string;
}

const SensorDataTable = ({ data, title = "Sensor Data History" }: SensorDataTableProps) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<SensorData[]>([]);
  const itemsPerPage = 10;

  useEffect(() => {
  setSearchTerm("");
}, []);


  useEffect(() => {
    // Filter data based on search term
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

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

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
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
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
            <Button variant="outline" size="sm" onClick={downloadCSV}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead>Temperature (°C)</TableHead>
                <TableHead>Humidity (%)</TableHead>
                <TableHead>Air Quality</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <TableRow key={item._id}>
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
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    {data.length === 0 ? "No data available" : "No matching records found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {totalPages > 1 && (
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(page + 1)}
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

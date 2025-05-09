
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import SensorDashboard from "@/components/SensorDashboard";
import FirmwareUpload from "@/components/FirmwareUpload";
import { ChartPreference } from "@/types";

const Dashboard = () => {
  const [currentChartPreference, setCurrentChartPreference] = useState<ChartPreference | null>(null);

  const handleLoadPreference = (preference: ChartPreference) => {
    setCurrentChartPreference(preference);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onLoadPreference={handleLoadPreference} />
      
      <main className="flex-1">
        <div className="container py-6">
          <Tabs defaultValue="sensors" className="space-y-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="sensors">Sensors</TabsTrigger>
              <TabsTrigger value="firmware">Firmware</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sensors" className="space-y-4">
              <SensorDashboard />
            </TabsContent>
            
            <TabsContent value="firmware">
              <FirmwareUpload />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

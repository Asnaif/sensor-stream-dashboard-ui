
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/contexts/PreferencesContext";
import { ChartPreference } from "@/types";
import { Check, Star, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/utils/datetime";

interface UserPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPreference: (preference: ChartPreference) => void;
}

const UserPreferencesModal = ({ isOpen, onClose, onLoadPreference }: UserPreferencesModalProps) => {
  const { preferences, deleteChartPreference, setDefaultChart } = usePreferences();
  const { chartPreferences, defaultChartId } = preferences;

  const handleLoadPreference = (preference: ChartPreference) => {
    onLoadPreference(preference);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Your Dashboard Preferences</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {chartPreferences.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              <p>You haven't saved any dashboard views yet</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {chartPreferences.map((preference) => (
                  <Card key={preference.id} className="relative">
                    {defaultChartId === preference.id && (
                      <span className="absolute top-2 right-2">
                        <Star className="h-5 w-5 fill-warning text-warning" />
                      </span>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle>{preference.name}</CardTitle>
                      <CardDescription>
                        {preference.chartType.charAt(0).toUpperCase() + preference.chartType.slice(1)} chart • 
                        {preference.timeRange === 'custom' 
                          ? ` Custom range` 
                          : ` Last ${preference.timeRange}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex flex-wrap gap-2">
                        {preference.sensors.map(sensor => (
                          <Badge key={sensor} variant="secondary" className="capitalize">
                            {sensor.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created: {formatDateTime(preference.createdAt)}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDefaultChart(
                          defaultChartId === preference.id ? undefined : preference.id
                        )}
                      >
                        {defaultChartId === preference.id ? 'Unset Default' : 'Set as Default'}
                      </Button>
                      <div className="space-x-2">
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          onClick={() => deleteChartPreference(preference.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => handleLoadPreference(preference)}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Load
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserPreferencesModal;


import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChartPreference } from "@/types";
import { usePreferences } from "@/contexts/PreferencesContext";
import { Loader2 } from "lucide-react";

interface SaveChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: Omit<ChartPreference, 'id' | 'name' | 'createdAt' | 'updatedAt'>;
}

const SaveChartModal = ({ isOpen, onClose, currentSettings }: SaveChartModalProps) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { saveChartPreference } = usePreferences();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      saveChartPreference({
        ...currentSettings,
        name
      });
      
      onClose();
      setName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeSensors = currentSettings.sensors.map(
    s => s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')
  ).join(', ');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Save Dashboard View</DialogTitle>
          <DialogDescription>
            Give this dashboard configuration a name to save it for later use
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2 space-y-1 text-sm">
          <div>
            <span className="font-semibold">Chart type:</span> {currentSettings.chartType}
          </div>
          <div>
            <span className="font-semibold">Time range:</span> {currentSettings.timeRange}
          </div>
          <div>
            <span className="font-semibold">Sensors:</span> {activeSensors}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="chartName">Chart Name</Label>
            <Input
              id="chartName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My custom dashboard view"
              required
            />
          </div>
          
          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save View"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SaveChartModal;

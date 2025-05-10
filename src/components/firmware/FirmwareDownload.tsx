
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { firmwareApi } from "@/services/api";

const FirmwareDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const response = await firmwareApi.getLatestFirmware();
      
      if (response.success && response.data) {
        const url = URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `firmware_${new Date().toISOString().split('T')[0]}.bin`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Firmware downloaded",
          description: "Latest firmware file has been downloaded",
          variant: "default"
        });
      } else {
        toast({
          title: "Download failed",
          description: response.error || "Failed to download firmware",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Download error",
        description: (error as Error).message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
      {isDownloading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download Latest
        </>
      )}
    </Button>
  );
};

export default FirmwareDownload;

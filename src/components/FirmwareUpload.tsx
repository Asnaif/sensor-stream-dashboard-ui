
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Check, AlertTriangle, Download, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { firmwareApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const FirmwareUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if it's a .bin file
      if (!selectedFile.name.endsWith('.bin')) {
        toast({
          title: "Invalid file",
          description: "Please select a valid .bin firmware file",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !password) return;
    
    setIsUploading(true);
    
    try {
      const response = await firmwareApi.uploadFirmware(file, password);
      
      if (response.success) {
        toast({
          title: "Firmware uploaded",
          description: response.message || "Firmware has been uploaded successfully",
          variant: "default"
        });
        
        // Reset form
        setFile(null);
        setPassword("");
      } else {
        toast({
          title: "Upload failed",
          description: response.error || "Failed to upload firmware",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Upload error",
        description: (error as Error).message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

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

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Firmware Management</CardTitle>
          <CardDescription>Login required for firmware operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <AlertTriangle className="text-warning mr-2" />
            <p>Please login to access firmware management features</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firmware Management</CardTitle>
        <CardDescription>Upload new firmware or download the latest version</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firmware">Firmware File (.bin)</Label>
            <div className="flex gap-2">
              <Input
                id="firmware"
                type="file"
                accept=".bin"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button 
                onClick={handleUpload} 
                disabled={!file || !password || isUploading}
                className="whitespace-nowrap"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Firmware Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter firmware password"
            />
          </div>

          {file && (
            <div className="rounded-md bg-muted p-3 flex items-center gap-2">
              <Check className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
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
      </CardFooter>
    </Card>
  );
};

export default FirmwareUpload;

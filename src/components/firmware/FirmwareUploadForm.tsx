
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Check, FileUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { firmwareApi } from "@/services/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface FirmwareUploadFormProps {
  onUploadSuccess: () => void;
}

const FirmwareUploadForm = ({ onUploadSuccess }: FirmwareUploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();

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
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !password) return;
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      console.log('Starting firmware upload...');
      const response = await firmwareApi.uploadFirmware(file, password);
      console.log('Upload response received:', response);
      
      if (response.success) {
        toast({
          title: "Firmware uploaded",
          description: response.message || "Firmware has been uploaded successfully",
          variant: "default"
        });
        
        // Reset form
        setFile(null);
        setPassword("");
        onUploadSuccess();
      } else {
        const errorMsg = response.error || "Failed to upload firmware";
        console.error('Upload failed:', errorMsg);
        setUploadError(errorMsg);
        toast({
          title: "Upload failed",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMessage = (error as Error).message || "An unexpected error occurred";
      console.error('Upload exception:', errorMessage);
      setUploadError(errorMessage);
      toast({
        title: "Upload error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFetchLatest = async () => {
    setIsFetching(true);
    setUploadError(null);
    try {
      const response = await firmwareApi.getLatestFirmware();
      
      if (response.success && response.data) {
        const url = URL.createObjectURL(response.data);
        const filename = `firmware_${new Date().toISOString().split('T')[0]}.bin`;
        
        setFile(new File([response.data], filename, { type: 'application/octet-stream' }));
        
        toast({
          title: "Latest firmware fetched",
          description: "The latest firmware file is ready to upload",
          variant: "default"
        });
      } else {
        const errorMessage = response.error || "Failed to fetch latest firmware";
        setUploadError(errorMessage);
        toast({
          title: "Fetch failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMessage = (error as Error).message || "An unexpected error occurred";
      setUploadError(errorMessage);
      toast({
        title: "Error fetching firmware",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-4">
      {uploadError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="local" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="local">Upload Local File</TabsTrigger>
          <TabsTrigger value="latest">Use Latest Version</TabsTrigger>
        </TabsList>
        
        <TabsContent value="local" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firmware">Firmware File (.bin)</Label>
            <div className="flex gap-2">
              <Input
                id="firmware"
                type="file"
                accept=".bin"
                onChange={handleFileChange}
                className="flex-1"
                disabled={isUploading}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="latest" className="space-y-4">
          <div className="space-y-2">
            <Label>Latest Firmware</Label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleFetchLatest}
                disabled={isUploading || isFetching}
              >
                {isFetching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <FileUp className="mr-2 h-4 w-4" />
                    Fetch Latest Firmware
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-2">
        <Label htmlFor="password">Firmware Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter firmware password"
          disabled={isUploading}
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

      <Button 
        onClick={handleUpload} 
        disabled={!file || !password || isUploading || isFetching}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Firmware
          </>
        )}
      </Button>
    </div>
  );
};

export default FirmwareUploadForm;

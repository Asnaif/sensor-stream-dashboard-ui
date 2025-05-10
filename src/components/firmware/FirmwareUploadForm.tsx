
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { firmwareApi } from "@/services/api";

interface FirmwareUploadFormProps {
  onUploadSuccess: () => void;
}

const FirmwareUploadForm = ({ onUploadSuccess }: FirmwareUploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isUploading, setIsUploading] = useState(false);
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
        onUploadSuccess();
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

  return (
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
  );
};

export default FirmwareUploadForm;

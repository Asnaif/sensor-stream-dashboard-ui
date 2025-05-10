
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import FirmwareUploadForm from "./firmware/FirmwareUploadForm";
import FirmwareDownload from "./firmware/FirmwareDownload";

const FirmwareUpload = () => {
  const [uploadCount, setUploadCount] = useState(0);
  const { isAuthenticated } = useAuth();

  const handleUploadSuccess = () => {
    setUploadCount(prev => prev + 1);
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
        <FirmwareUploadForm onUploadSuccess={handleUploadSuccess} />
      </CardContent>
      <CardFooter className="flex justify-between">
        <FirmwareDownload />
      </CardFooter>
    </Card>
  );
};

export default FirmwareUpload;

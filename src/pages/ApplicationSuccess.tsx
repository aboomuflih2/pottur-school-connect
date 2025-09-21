import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, ArrowRight, Loader2 } from "lucide-react";
import { djangoAPI } from "@/lib/django-api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const ApplicationSuccess = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const applicationNumber = searchParams.get("app_no");
  const applicationType = searchParams.get("type");
  const mobileNumber = searchParams.get("mobile");

  const { data: application, isLoading } = useQuery({
    queryKey: ['application', applicationType, applicationNumber],
    queryFn: async () => {
        if (!applicationType || !applicationNumber) return null;
        // This is a simplified version. I will need to fetch the application by application_number
        // which is not supported by the current API. I will add this later.
        return null;
    },
    enabled: !!applicationType && !!applicationNumber,
  });

  const handleDownload = async () => {
    if (!applicationNumber || !applicationType || !mobileNumber) return;
    setIsDownloading(true);
    try {
        const response = await djangoAPI.generateApplicationPdf(applicationNumber, applicationType, mobileNumber);
        // ... (handle PDF download)
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to download PDF",
            variant: "destructive",
        });
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold mt-4">Application Submitted!</CardTitle>
          <CardDescription>
            Your application has been received. You can track its status using your application number and mobile number.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-sm text-gray-600">Application Number</p>
            <p className="text-lg font-semibold">{applicationNumber}</p>
          </div>
          <div className="space-y-2">
            <Button className="w-full" onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download Application PDF
            </Button>
            <Link to={`/admissions/track?app=${applicationNumber}&mobile=${mobileNumber}`}>
              <Button variant="outline" className="w-full">
                Track Application Status
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationSuccess;

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, Calendar, User, MapPin, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ApplicationData {
  id: string;
  application_number: string;
  full_name: string;
  mobile_number: string;
  status: string;
  interview_date?: string;
  interview_time?: string;
  created_at: string;
  // Add other fields as needed
}

const statusSteps = [
  { key: "submitted", label: "Submitted", description: "Application received" },
  { key: "under_review", label: "Under Review", description: "Being reviewed by admission committee" },
  { key: "shortlisted_for_interview", label: "Shortlisted", description: "Selected for interview" },
  { key: "interview_complete", label: "Interview Complete", description: "Interview conducted" },
  { key: "admitted", label: "Admitted", description: "Congratulations! You're admitted" },
  { key: "not_admitted", label: "Not Admitted", description: "Application not successful" }
];

export function ApplicationTracking() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationType, setApplicationType] = useState<"kg_std" | "plus_one" | null>(null);

  const applicationNumber = searchParams.get("app");
  const mobileNumber = searchParams.get("mobile");

  useEffect(() => {
    const fetchApplication = async () => {
      if (!applicationNumber || !mobileNumber) {
        toast({
          title: "Invalid Parameters",
          description: "Application number and mobile number are required",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      setLoading(true);
      try {
        // Try KG STD first
        const { data: kgStdData, error: kgStdError } = await supabase
          .from('kg_std_applications')
          .select('*')
          .eq('application_number', applicationNumber)
          .eq('mobile_number', mobileNumber)
          .single();

        if (kgStdData && !kgStdError) {
          setApplication(kgStdData);
          setApplicationType("kg_std");
          return;
        }

        // Try Plus One
        const { data: plusOneData, error: plusOneError } = await supabase
          .from('plus_one_applications')
          .select('*')
          .eq('application_number', applicationNumber)
          .eq('mobile_number', mobileNumber)
          .single();

        if (plusOneData && !plusOneError) {
          setApplication(plusOneData);
          setApplicationType("plus_one");
          return;
        }

        // No application found
        toast({
          title: "Application Not Found",
          description: "No application found with the provided details",
          variant: "destructive"
        });
        navigate("/");
      } catch (error) {
        console.error("Error fetching application:", error);
        toast({
          title: "Error",
          description: "Failed to fetch application details",
          variant: "destructive"
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationNumber, mobileNumber, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const currentStatusIndex = statusSteps.findIndex(step => step.key === application.status);
  const progress = ((currentStatusIndex + 1) / statusSteps.length) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-blue-500";
      case "under_review": return "bg-yellow-500";
      case "shortlisted_for_interview": return "bg-purple-500";
      case "interview_complete": return "bg-orange-500";
      case "admitted": return "bg-green-500";
      case "not_admitted": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const formName = applicationType === "kg_std" ? "KG & STD" : "+1 / HSS";
  const academicYear = applicationType === "kg_std" ? "2026-27" : "2025-26";

  const showInterviewLetter = application.status === "shortlisted_for_interview" && application.interview_date;
  const showMarkList = ["interview_complete", "admitted", "not_admitted"].includes(application.status);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Application Status</h1>
          <p className="text-muted-foreground">Track your {formName} application</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Application Summary */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
                <CardDescription>
                  Application Number: {application.application_number}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{application.full_name}</p>
                      <p className="text-sm text-muted-foreground">Applicant Name</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{application.mobile_number}</p>
                      <p className="text-sm text-muted-foreground">Mobile Number</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {new Date(application.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Application Submitted</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium">{formName} Application</p>
                  <p className="text-sm text-muted-foreground">Academic Year: {academicYear}</p>
                </div>
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Application Progress</CardTitle>
                <CardDescription>Current status of your application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge className={getStatusColor(application.status)}>
                      {statusSteps[currentStatusIndex]?.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(progress)}% Complete
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="space-y-4">
                  {statusSteps.map((step, index) => (
                    <div
                      key={step.key}
                      className={`flex items-center gap-3 ${
                        index <= currentStatusIndex ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          index <= currentStatusIndex
                            ? getStatusColor(step.key)
                            : "bg-muted"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{step.label}</p>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Download Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Downloads</CardTitle>
                <CardDescription>Available documents for download</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {showInterviewLetter && (
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Interview Call Letter
                  </Button>
                )}

                {showMarkList && (
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Mark List
                  </Button>
                )}

                {!showInterviewLetter && !showMarkList && (
                  <p className="text-sm text-muted-foreground">
                    No downloads available yet. Documents will appear here based on your application status.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Interview Information */}
            {application.interview_date && (
              <Card>
                <CardHeader>
                  <CardTitle>Interview Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {new Date(application.interview_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Interview Date</p>
                    </div>
                  </div>

                  {application.interview_time && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{application.interview_time}</p>
                        <p className="text-sm text-muted-foreground">Interview Time</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
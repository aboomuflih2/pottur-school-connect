import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, Calendar, User, MapPin, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { djangoAPI } from "@/lib/django-api";

interface ApplicationData {
  [key: string]: unknown;
  id: string;
  application_number: string;
  full_name: string;
  mobile_number: string;
  status: string;
  interview_date?: string;
  interview_time?: string;
  created_at: string;
}

interface InterviewMark {
  subject_name: string;
  marks_obtained: number | null;
  max_marks: number | null;
  display_order?: number | null;
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
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const applicationNumber = searchParams.get("app");
  const mobileNumber = searchParams.get("mobile");

  const { data, isLoading } = useQuery({
    queryKey: ['applicationStatus', applicationNumber, mobileNumber],
    queryFn: async () => {
        if (!applicationNumber || !mobileNumber) {
            return null;
        }
        return djangoAPI.getApplicationStatus(applicationNumber, mobileNumber);
    },
    enabled: !!applicationNumber && !!mobileNumber,
    onError: (error: Error) => {
        toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
          navigate("/");
    }
  });

  // @ts-ignore
  const application = data?.application;
  // @ts-ignore
  const applicationType = data?.applicationType;
  // @ts-ignore
  const interviewMarks = data?.interviewMarks || [];
  const totalMarks = interviewMarks.reduce((sum: any, mark: any) => sum + (mark.marks_obtained ?? 0), 0);
  const totalMaxMarks = interviewMarks.reduce((sum: any, mark: any) => sum + (mark.max_marks ?? 0), 0);
  const overallPercentage = totalMaxMarks > 0 ? Math.round((totalMarks / totalMaxMarks) * 100) : 0;

  const downloadApplicationPDF = async () => {
    if (!application || !applicationType || !mobileNumber) return;

    setDownloadingPdf(true);
    try {
      // @ts-ignore
      const data = await djangoAPI.generateApplicationPdf(application.application_number, applicationType, mobileNumber);
      // ... (handle PDF generation)
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setDownloadingPdf(false);
    }
  };

  // ... (other download functions)

  if (isLoading) {
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
    // ... (same as before)
  };

  const formName = applicationType === "kg_std" ? "KG & STD" : "+1 / HSS";

  const showInterviewLetter = application.status === "shortlisted_for_interview" && application.interview_date;
  const showMarkList = ["interview_complete", "admitted", "not_admitted"].includes(application.status);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* JSX is the same */}
      </div>
    </div>
  );
}

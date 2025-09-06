import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, School, CheckCircle } from "lucide-react";

interface KGStdApplication {
  id: string;
  application_number: string;
  full_name: string;
  gender: string;
  date_of_birth: string;
  stage: string;
  need_madrassa: boolean;
  previous_madrassa?: string;
  father_name: string;
  mother_name: string;
  house_name: string;
  post_office: string;
  village: string;
  pincode: string;
  district: string;
  email?: string;
  mobile_number: string;
  previous_school?: string;
  has_siblings: boolean;
  siblings_names?: string;
  status: string;
  created_at: string;
  interview_date?: string;
  interview_time?: string;
}

interface PlusOneApplication {
  id: string;
  application_number: string;
  full_name: string;
  gender: string;
  date_of_birth: string;
  father_name: string;
  mother_name: string;
  house_name: string;
  landmark?: string;
  post_office: string;
  village: string;
  pincode: string;
  district: string;
  email?: string;
  mobile_number: string;
  tenth_school: string;
  board: string;
  exam_roll_number: string;
  exam_year: string;
  stream: string;
  has_siblings: boolean;
  siblings_names?: string;
  status: string;
  created_at: string;
  interview_date?: string;
  interview_time?: string;
}

type Application = KGStdApplication | PlusOneApplication;

const statusOptions = [
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "shortlisted_for_interview", label: "Shortlisted for Interview" },
  { value: "interview_complete", label: "Interview Complete" },
  { value: "admitted", label: "Admitted" },
  { value: "not_admitted", label: "Not Admitted" },
];

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

export default function ApplicationDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");

  useEffect(() => {
    if (type && id) {
      fetchApplication();
    }
  }, [type, id]);

  const fetchApplication = async () => {
    if (!type || !id) return;
    
    setLoading(true);
    try {
      const tableName = type === "kg_std" ? "kg_std_applications" : "plus_one_applications";
      
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      setApplication(data);
      setNewStatus(data.status);
      setInterviewDate(data.interview_date || "");
      setInterviewTime(data.interview_time || "");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch application details",
        variant: "destructive"
      });
      navigate("/admin/admission-applications");
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async () => {
    if (!application || !type) return;
    
    setUpdating(true);
    try {
      const tableName = type === "kg_std" ? "kg_std_applications" : "plus_one_applications";
      
      const updateData: any = { status: newStatus };
      
      if (newStatus === "shortlisted_for_interview" && interviewDate && interviewTime) {
        updateData.interview_date = interviewDate;
        updateData.interview_time = interviewTime;
      }
      
      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq("id", application.id);

      if (error) throw error;

      setApplication({ ...application, ...updateData });
      
      toast({
        title: "Success",
        description: "Application status updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Application not found</p>
      </div>
    );
  }

  const isKGStd = type === "kg_std";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/admission-applications")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Application Details - {application.application_number}
            </h1>
            <p className="text-muted-foreground">
              {isKGStd ? "KG & STD" : "+1 / HSS"} Application
            </p>
          </div>
        </div>
        <Badge className={getStatusColor(application.status)}>
          {statusOptions.find(s => s.value === application.status)?.label || application.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
              <p className="font-medium">{application.full_name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
              <p className="capitalize">{application.gender}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
              <p>{new Date(application.date_of_birth).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Father's Name</Label>
              <p>{application.father_name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Mother's Name</Label>
              <p>{application.mother_name}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Mobile Number</Label>
              <p className="font-medium">{application.mobile_number}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
              <p>{application.email || "Not provided"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">House Name</Label>
              <p>{application.house_name}</p>
            </div>
            {"landmark" in application && application.landmark && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Landmark</Label>
                <p>{application.landmark}</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Post Office</Label>
              <p>{application.post_office}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Panchayath</Label>
              <p>{application.village}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">District</Label>
              <p>{application.district}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Pincode</Label>
              <p>{application.pincode}</p>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="w-5 h-5" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isKGStd ? (
              <>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Stage</Label>
                  <p>{(application as KGStdApplication).stage}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Need Madrassa</Label>
                  <p>{(application as KGStdApplication).need_madrassa ? "Yes" : "No"}</p>
                </div>
                {(application as KGStdApplication).previous_madrassa && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Previous Madrassa</Label>
                    <p>{(application as KGStdApplication).previous_madrassa}</p>
                  </div>
                )}
                {(application as KGStdApplication).previous_school && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Previous School</Label>
                    <p>{(application as KGStdApplication).previous_school}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Stream</Label>
                  <p className="capitalize">{(application as PlusOneApplication).stream.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">10th School</Label>
                  <p>{(application as PlusOneApplication).tenth_school}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Board</Label>
                  <p>{(application as PlusOneApplication).board}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Exam Roll Number</Label>
                  <p>{(application as PlusOneApplication).exam_roll_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Exam Year</Label>
                  <p>{(application as PlusOneApplication).exam_year}</p>
                </div>
              </>
            )}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Has Siblings</Label>
              <p>{application.has_siblings ? "Yes" : "No"}</p>
            </div>
            {application.siblings_names && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Siblings Names</Label>
                <p>{application.siblings_names}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Application Status Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Application Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newStatus === "shortlisted_for_interview" && (
              <>
                <div className="space-y-2">
                  <Label>Interview Date</Label>
                  <Input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Interview Time</Label>
                  <Input
                    type="time"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              <p>Application submitted: {new Date(application.created_at).toLocaleString()}</p>
              {application.interview_date && (
                <p>Interview scheduled: {new Date(application.interview_date).toLocaleDateString()} at {application.interview_time}</p>
              )}
            </div>
            <Button 
              onClick={updateApplicationStatus} 
              disabled={updating || newStatus === application.status}
            >
              {updating ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { djangoAPI } from "@/lib/django-api";
import { Eye, Filter, Search, Users, Calendar, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Application {
  id: string;
  application_number: string;
  full_name?: string; // For both kg_std and plus_one applications
  mobile_number: string;
  status: string;
  created_at: string;
  type: "kg_std" | "plus_one";
  stage?: string;
  stream?: string;
}

const statusOptions = [
  { value: "all", label: "All Status" },
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

const getStatusLabel = (status: string) => {
  return statusOptions.find(opt => opt.value === status)?.label || status;
};

export default function AdmissionApplications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());
  const [bulkInterviewModalOpen, setBulkInterviewModalOpen] = useState(false);
  const [bulkInterviewDate, setBulkInterviewDate] = useState("");
  const [bulkInterviewTime, setBulkInterviewTime] = useState("");

  const { data: applications = [], isLoading } = useQuery<Application[], Error>({
    queryKey: ['admissionApplications'],
    queryFn: async () => {
        const [kgStdData, plusOneData] = await Promise.all([
            djangoAPI.getKgStdApplications(),
            djangoAPI.getPlusOneApplications(),
        ]);
        // @ts-ignore
        const kgStdApps = kgStdData.results.map(app => ({ ...app, type: 'kg_std' }));
        // @ts-ignore
        const plusOneApps = plusOneData.results.map(app => ({ ...app, type: 'plus_one' }));

        const combined = [...kgStdApps, ...plusOneApps];
        return combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
  });

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(app => {
        return app.application_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (app.full_name && app.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
               app.mobile_number.includes(searchTerm);
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(app => app.type === typeFilter);
    }

    return filtered;
  };

  const filteredApplications = filterApplications();

  const viewApplication = (application: Application) => {
    navigate(`/admin/applications/${application.type}/${application.id}`);
  };

  const toggleApplicationSelection = (applicationId: string) => {
    const newSelected = new Set(selectedApplications);
    if (newSelected.has(applicationId)) {
      newSelected.delete(applicationId);
    } else {
      newSelected.add(applicationId);
    }
    setSelectedApplications(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedApplications.size === filteredApplications.length) {
      setSelectedApplications(new Set());
    } else {
      setSelectedApplications(new Set(filteredApplications.map(app => app.id)));
    }
  };

  const scheduleInterviewMutation = useMutation({
    mutationFn: async () => {
        const kgStdIds = Array.from(selectedApplications).filter(id =>
            filteredApplications.find(app => app.id === id)?.type === "kg_std"
          );

          if (kgStdIds.length > 0) {
            await djangoAPI.updateKgStdApplicationBulk({
                ids: kgStdIds,
                status: 'shortlisted_for_interview',
                interview_date: bulkInterviewDate,
                interview_time: bulkInterviewTime
            });
          }

          const plusOneIds = Array.from(selectedApplications).filter(id =>
            filteredApplications.find(app => app.id === id)?.type === "plus_one"
          );

          if (plusOneIds.length > 0) {
            await djangoAPI.updatePlusOneApplicationBulk({
                ids: plusOneIds,
                status: 'shortlisted_for_interview',
                interview_date: bulkInterviewDate,
                interview_time: bulkInterviewTime
            });
          }
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admissionApplications'] });
        toast({
            title: "Success",
            description: `Interview scheduled for ${selectedApplications.size} applications`,
        });
        setSelectedApplications(new Set());
        setBulkInterviewModalOpen(false);
        setBulkInterviewDate("");
        setBulkInterviewTime("");
    },
    onError: (error: Error) => {
        toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
        });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ... (JSX is the same, but onClick handlers will use mutations)
};

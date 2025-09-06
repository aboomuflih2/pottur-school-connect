import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Filter, Search, Users, Calendar, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Application {
  id: string;
  application_number: string;
  full_name: string;
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
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());
  const [bulkInterviewModalOpen, setBulkInterviewModalOpen] = useState(false);
  const [bulkInterviewDate, setBulkInterviewDate] = useState("");
  const [bulkInterviewTime, setBulkInterviewTime] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, typeFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Fetch KG STD applications
      const { data: kgStdData, error: kgStdError } = await supabase
        .from('kg_std_applications')
        .select('id, application_number, full_name, mobile_number, status, created_at, stage')
        .order('created_at', { ascending: false });

      if (kgStdError) throw kgStdError;

      // Fetch Plus One applications  
      const { data: plusOneData, error: plusOneError } = await supabase
        .from('plus_one_applications')
        .select('id, application_number, full_name, mobile_number, status, created_at, stream')
        .order('created_at', { ascending: false });

      if (plusOneError) throw plusOneError;

      // Combine and format applications
      const combinedApplications: Application[] = [
        ...(kgStdData || []).map(app => ({
          ...app,
          type: "kg_std" as const,
        })),
        ...(plusOneData || []).map(app => ({
          ...app,
          type: "plus_one" as const,
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setApplications(combinedApplications);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.application_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.mobile_number.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(app => app.type === typeFilter);
    }

    setFilteredApplications(filtered);
  };

  const viewApplication = (application: Application) => {
    navigate(`/admin/admissions/application/${application.type}/${application.id}`);
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

  const scheduleInterviewForSelected = async () => {
    if (selectedApplications.size === 0 || !bulkInterviewDate || !bulkInterviewTime) {
      toast({
        title: "Error",
        description: "Please select applications and provide interview date/time",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update KG STD applications
      const kgStdIds = Array.from(selectedApplications).filter(id => 
        filteredApplications.find(app => app.id === id)?.type === "kg_std"
      );
      
      if (kgStdIds.length > 0) {
        const { error: kgError } = await supabase
          .from('kg_std_applications')
          .update({
            status: 'shortlisted_for_interview',
            interview_date: bulkInterviewDate,
            interview_time: bulkInterviewTime
          })
          .in('id', kgStdIds);

        if (kgError) throw kgError;
      }

      // Update Plus One applications
      const plusOneIds = Array.from(selectedApplications).filter(id => 
        filteredApplications.find(app => app.id === id)?.type === "plus_one"
      );
      
      if (plusOneIds.length > 0) {
        const { error: plusError } = await supabase
          .from('plus_one_applications')
          .update({
            status: 'shortlisted_for_interview',
            interview_date: bulkInterviewDate,
            interview_time: bulkInterviewTime
          })
          .in('id', plusOneIds);

        if (plusError) throw plusError;
      }

      toast({
        title: "Success",
        description: `Interview scheduled for ${selectedApplications.size} applications`,
      });

      // Reset state
      setSelectedApplications(new Set());
      setBulkInterviewModalOpen(false);
      setBulkInterviewDate("");
      setBulkInterviewTime("");
      
      // Refresh applications
      fetchApplications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to schedule interviews",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          Admission Applications
        </h1>
        <p className="text-muted-foreground">
          View and manage all submitted applications
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">KG & STD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(app => app.type === "kg_std").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">+1 / HSS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(app => app.type === "plus_one").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Admitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {applications.filter(app => app.status === "admitted").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Application Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="kg_std">KG & STD</SelectItem>
                  <SelectItem value="plus_one">+1 / HSS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedApplications.size > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                {selectedApplications.size} Applications Selected
              </span>
              <Dialog open={bulkInterviewModalOpen} onOpenChange={setBulkInterviewModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Interview for Selected
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Interview for {selectedApplications.size} Applications</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Interview Date</Label>
                      <Input
                        type="date"
                        value={bulkInterviewDate}
                        onChange={(e) => setBulkInterviewDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Interview Time</Label>
                      <Input
                        type="time"
                        value={bulkInterviewTime}
                        onChange={(e) => setBulkInterviewTime(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setBulkInterviewModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={scheduleInterviewForSelected}>
                        Schedule Interviews
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>
            Showing {filteredApplications.length} of {applications.length} applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedApplications.size === filteredApplications.length && filteredApplications.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Application No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Stage/Stream</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={`${application.type}-${application.id}`}>
                    <TableCell>
                      <Checkbox
                        checked={selectedApplications.has(application.id)}
                        onCheckedChange={() => toggleApplicationSelection(application.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {application.application_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{application.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {application.mobile_number}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {application.type === "kg_std" ? "KG & STD" : "+1 / HSS"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {application.stage || application.stream || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(application.status)}>
                        {getStatusLabel(application.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(application.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => viewApplication(application)}
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredApplications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No applications found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
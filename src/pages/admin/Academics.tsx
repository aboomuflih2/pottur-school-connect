import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Eye, Upload, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Database } from "@/integrations/supabase/types";

type AcademicProgram = Database["public"]["Tables"]["academic_programs"]["Row"];

const AdminAcademics = () => {
  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProgram, setEditingProgram] = useState<AcademicProgram | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from("academic_programs")
        .select("*")
        .order("display_order");

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error("Error fetching academic programs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch academic programs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (program: AcademicProgram) => {
    setEditingProgram({ ...program });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingProgram) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("academic_programs")
        .update({
          program_title: editingProgram.program_title,
          short_description: editingProgram.short_description,
          full_description: editingProgram.full_description,
          subjects: editingProgram.subjects,
          duration: editingProgram.duration,
          main_image: editingProgram.main_image,
          is_active: editingProgram.is_active,
        })
        .eq("id", editingProgram.id);

      if (error) throw error;

      await fetchPrograms();
      setIsDialogOpen(false);
      setEditingProgram(null);
      
      toast({
        title: "Success",
        description: "Academic program updated successfully",
      });
    } catch (error) {
      console.error("Error updating program:", error);
      toast({
        title: "Error",
        description: "Failed to update academic program",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!editingProgram) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${editingProgram.id}-${Date.now()}.${fileExt}`;
      const filePath = `academic-programs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('program-icons')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('program-icons')
        .getPublicUrl(filePath);

      setEditingProgram({
        ...editingProgram,
        main_image: publicUrl,
      });

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const updateField = (field: keyof AcademicProgram, value: any) => {
    if (!editingProgram) return;
    setEditingProgram({
      ...editingProgram,
      [field]: value,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Academics Manager</h1>
          <p className="text-muted-foreground">
            Manage academic programs for both the homepage and dedicated Academics page
          </p>
        </div>
        <Button 
          onClick={() => window.open('/academics', '_blank')}
          variant="outline"
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          Preview Page
        </Button>
      </div>

      <div className="grid gap-6">
        {programs.map((program) => (
          <Card key={program.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{program.program_title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={program.is_active ? "default" : "secondary"}>
                      {program.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {program.duration && (
                      <Badge variant="outline">{program.duration}</Badge>
                    )}
                  </div>
                </div>
                
                <Button
                  onClick={() => handleEdit(program)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Short Description (Homepage)</h4>
                <p className="text-sm">{program.short_description}</p>
              </div>

              {program.full_description && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Full Description (Academics Page)</h4>
                  <p className="text-sm line-clamp-3">{program.full_description}</p>
                </div>
              )}

              {program.subjects && program.subjects.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Subjects</h4>
                  <div className="flex flex-wrap gap-1">
                    {program.subjects.slice(0, 6).map((subject, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                    {program.subjects.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{program.subjects.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {program.main_image && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Current Image</h4>
                  <img 
                    src={program.main_image} 
                    alt={program.program_title}
                    className="w-32 h-20 object-cover rounded border"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Academic Program</DialogTitle>
          </DialogHeader>

          {editingProgram && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Program Title</Label>
                    <Input
                      id="title"
                      value={editingProgram.program_title}
                      onChange={(e) => updateField('program_title', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={editingProgram.duration || ""}
                      onChange={(e) => updateField('duration', e.target.value)}
                      placeholder="e.g., 2 Years"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subjects">Subjects (comma-separated)</Label>
                    <Textarea
                      id="subjects"
                      value={editingProgram.subjects?.join(', ') || ""}
                      onChange={(e) => updateField('subjects', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      placeholder="English, Mathematics, Science"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="image-upload">Main Image</Label>
                    <div className="space-y-2">
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        disabled={uploading}
                      />
                      {editingProgram.main_image && (
                        <img 
                          src={editingProgram.main_image} 
                          alt="Preview"
                          className="w-full h-32 object-cover rounded border"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="short-desc">Short Description</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Used in homepage popup modals
                    </p>
                    <Textarea
                      id="short-desc"
                      value={editingProgram.short_description}
                      onChange={(e) => updateField('short_description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="full-desc">Full Description</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Used on the main Academics page
                    </p>
                    <Textarea
                      id="full-desc"
                      value={editingProgram.full_description || ""}
                      onChange={(e) => updateField('full_description', e.target.value)}
                      rows={8}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is-active"
                      checked={editingProgram.is_active}
                      onChange={(e) => updateField('is_active', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="is-active">Active (visible on website)</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || uploading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAcademics;
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, Upload, Loader2, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";


interface LeadershipMessage {
  id: string;
  position: string;
  person_name: string;
  person_title: string;
  message_content: string;
  photo_url?: string;
}

const LeadershipManager = () => {
  const [leaders, setLeaders] = useState<LeadershipMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();

  const positionLabels = {
    chairman: "Chairman",
    principal: "Principal", 
    vice_principal: "Vice Principal"
  };

  useEffect(() => {
    loadLeadership();
  }, []);

  const loadLeadership = async () => {
    try {
      const { data, error } = await supabase
        .from('leadership_messages')
        .select('*')
        .order('display_order');

      if (error) throw error;

      if (data) {
        setLeaders(data);
      }
    } catch (error) {
      console.error('Error loading leadership:', error);
      toast({
        title: "Error",
        description: "Failed to load leadership data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (leader: LeadershipMessage) => {
    setSaving(leader.position);
    try {
      const { error } = await supabase
        .from('leadership_messages')
        .update({
          person_name: leader.person_name,
          person_title: leader.person_title,
          message_content: leader.message_content,
        })
        .eq('position', leader.position);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${positionLabels[leader.position as keyof typeof positionLabels]} information updated successfully.`,
      });
    } catch (error) {
      console.error('Error saving leader:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handlePhotoUpload = async (position: string, file: File) => {
    setUploading(position);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `leadership/${position}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('testimonial-photos') // Reusing existing bucket
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('testimonial-photos')
        .getPublicUrl(fileName);

      // Update database
      const { error: updateError } = await supabase
        .from('leadership_messages')
        .update({ photo_url: publicUrl })
        .eq('position', position);

      if (updateError) throw updateError;

      // Update local state
      setLeaders(prev => prev.map(leader => 
        leader.position === position 
          ? { ...leader, photo_url: publicUrl }
          : leader
      ));

      toast({
        title: "Success",
        description: "Photo uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const handleInputChange = (position: string, field: string, value: string) => {
    setLeaders(prev => prev.map(leader => 
      leader.position === position 
        ? { ...leader, [field]: value }
        : leader
    ));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leadership Manager</h1>
        <p className="text-muted-foreground">Manage messages from school leadership</p>
      </div>

      <div className="grid gap-8">
        {leaders.map((leader) => (
          <Card key={leader.position} className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Photo Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">
                  {positionLabels[leader.position as keyof typeof positionLabels]}
                </h3>
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={leader.photo_url} alt={leader.person_name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {leader.person_name ? getInitials(leader.person_name) : positionLabels[leader.position as keyof typeof positionLabels].slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handlePhotoUpload(leader.position, file);
                        }
                      }}
                    />
                    <Button 
                      variant="outline" 
                      disabled={uploading === leader.position}
                      className="relative"
                    >
                      {uploading === leader.position ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          Upload Photo
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${leader.position}`}>Name</Label>
                    <Input
                      id={`name-${leader.position}`}
                      value={leader.person_name}
                      onChange={(e) => handleInputChange(leader.position, 'person_name', e.target.value)}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`title-${leader.position}`}>Title</Label>
                    <Input
                      id={`title-${leader.position}`}
                      value={leader.person_title}
                      onChange={(e) => handleInputChange(leader.position, 'person_title', e.target.value)}
                      placeholder="Enter official title"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`message-${leader.position}`}>Message</Label>
                  <Textarea
                    id={`message-${leader.position}`}
                    value={leader.message_content}
                    onChange={(e) => handleInputChange(leader.position, 'message_content', e.target.value)}
                    rows={6}
                    placeholder="Enter leadership message..."
                  />
                </div>

                <Button 
                  onClick={() => handleSave(leader)}
                  disabled={saving === leader.position}
                  className="bg-primary hover:bg-primary-light"
                >
                  {saving === leader.position ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save {positionLabels[leader.position as keyof typeof positionLabels]}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LeadershipManager;
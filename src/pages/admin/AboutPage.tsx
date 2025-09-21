import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
import { djangoAPI } from "@/lib/django-api";
import { useToast } from "@/hooks/use-toast";

interface PageContent {
  about_legacy: string;
  about_mission: string;
  about_vision: string;
}

interface StaffCounts {
  id: string;
  teaching_staff: number;
  security_staff: number;
  professional_staff: number;
  guides_staff: number;
}

const AboutPageManager = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [content, setContent] = useState<PageContent>({ about_legacy: "", about_mission: "", about_vision: "" });
    const [staffCounts, setStaffCounts] = useState<StaffCounts | null>(null);

    const { isLoading } = useQuery({
        queryKey: ['aboutPageData'],
        queryFn: async () => {
            // @ts-ignore
            const contentPromise = djangoAPI.getPageContent();
            // @ts-ignore
            const countsPromise = djangoAPI.getStaffCounts();
            const [contentData, countsData] = await Promise.all([
                contentPromise,
                countsPromise,
            ]);
            return { contentData, countsData };
        },
        onSuccess: (data) => {
            if (data.contentData) {
                // @ts-ignore
                const contentMap = data.contentData.results.reduce((acc, item) => {
                    // @ts-ignore
                    acc[item.page_name] = item.content;
                    return acc;
                }, {});
                setContent(contentMap);
            }
            if (data.countsData) {
                // @ts-ignore
                setStaffCounts(data.countsData.results[0]);
            }
        },
    });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['aboutPageData'] });
            toast({
                title: "Success",
                description: "About page content has been updated successfully.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    };

    const updateContentMutation = useMutation({
        mutationFn: async (contentData: any) => {
            const updates = Object.entries(contentData).map(([page_key, contentText]) =>
                // @ts-ignore
                djangoAPI.updatePageContent(page_key, { content: contentText })
            );
            return Promise.all(updates);
        },
        ...mutationOptions,
    });

    const updateCountsMutation = useMutation({
        // @ts-ignore
        mutationFn: (countsData: any) => djangoAPI.updateStaffCounts(countsData.id, countsData),
        ...mutationOptions,
    });

    const handleSave = () => {
        updateContentMutation.mutate(content);
        if (staffCounts) {
            updateCountsMutation.mutate(staffCounts);
        }
    };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">About Page Manager</h1>
          <p className="text-muted-foreground">Manage the content for the About Us page</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={updateContentMutation.isPending || updateCountsMutation.isPending}
          className="bg-primary hover:bg-primary-light"
        >
          {updateContentMutation.isPending || updateCountsMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Page Content Sections */}
      <div className="grid gap-6">
        {/* Legacy Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Legacy Section</h3>
            <div className="space-y-2">
              <Label htmlFor="legacy">School History & Legacy</Label>
              <Textarea
                id="legacy"
                value={content.about_legacy}
                onChange={(e) => setContent({ ...content, about_legacy: e.target.value })}
                rows={6}
                placeholder="Enter the school's history and legacy content..."
              />
            </div>
          </div>
        </Card>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Mission Statement</h3>
              <div className="space-y-2">
                <Label htmlFor="mission">Our Mission</Label>
                <Textarea
                  id="mission"
                  value={content.about_mission}
                  onChange={(e) => setContent({ ...content, about_mission: e.target.value })}
                  rows={5}
                  placeholder="Enter the school's mission statement..."
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Vision Statement</h3>
              <div className="space-y-2">
                <Label htmlFor="vision">Our Vision</Label>
                <Textarea
                  id="vision"
                  value={content.about_vision}
                  onChange={(e) => setContent({ ...content, about_vision: e.target.value })}
                  rows={5}
                  placeholder="Enter the school's vision statement..."
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Staff Counts */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Staff Strength Counts</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teaching">Teaching Staff</Label>
                <Input
                  id="teaching"
                  type="number"
                  min="0"
                  value={staffCounts?.teaching_staff || 0}
                  onChange={(e) => staffCounts && setStaffCounts({ ...staffCounts, teaching_staff: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="security">Security Staff</Label>
                <Input
                  id="security"
                  type="number"
                  min="0"
                  value={staffCounts?.security_staff || 0}
                  onChange={(e) => staffCounts && setStaffCounts({ ...staffCounts, security_staff: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="professional">Professional Staff</Label>
                <Input
                  id="professional"
                  type="number"
                  min="0"
                  value={staffCounts?.professional_staff || 0}
                  onChange={(e) => staffCounts && setStaffCounts({ ...staffCounts, professional_staff: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guides">Guides</Label>
                <Input
                  id="guides"
                  type="number"
                  min="0"
                  value={staffCounts?.guides_staff || 0}
                  onChange={(e) => staffCounts && setStaffCounts({ ...staffCounts, guides_staff: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AboutPageManager;
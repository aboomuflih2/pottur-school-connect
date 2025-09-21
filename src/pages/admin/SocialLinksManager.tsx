import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Facebook, Instagram, Youtube, Twitter, Linkedin } from 'lucide-react';
import { djangoAPI } from '@/lib/django-api';
import { useToast } from '@/hooks/use-toast';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  is_active: boolean;
  display_order: number;
}

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: Youtube, // Using Youtube icon for TikTok as placeholder
};

const platformLabels = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  twitter: 'Twitter/X',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
};

export default function SocialLinksManager() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
    const [formData, setFormData] = useState({
        platform: '',
        url: '',
        is_active: true,
        display_order: 0,
      });

    const { data: socialLinks = [], isLoading } = useQuery<SocialLink[], Error>({
        queryKey: ['socialLinks'],
        queryFn: async () => {
            // @ts-ignore
            const response = await djangoAPI.getSocialMediaLinks();
            // @ts-ignore
            return response.results;
        },
    });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['socialLinks'] });
            setDialogOpen(false);
            resetForm();
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    };

    const createMutation = useMutation({
        mutationFn: (linkData: any) => djangoAPI.createSocialMediaLink(linkData),
        ...mutationOptions,
    });

    const updateMutation = useMutation({
        mutationFn: (linkData: any) => djangoAPI.updateSocialMediaLink(editingLink!.id, linkData),
        ...mutationOptions,
    });

    const deleteMutation = useMutation({
        mutationFn: (linkId: string) => djangoAPI.deleteSocialMediaLink(linkId),
        ...mutationOptions,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const submitData = { ...formData, display_order: editingLink?.display_order ?? socialLinks.length + 1 };
        if (editingLink) {
            updateMutation.mutate(submitData);
        } else {
            createMutation.mutate(submitData);
        }
      };

      const handleEdit = (link: SocialLink) => {
        setEditingLink(link);
        setFormData({
          platform: link.platform,
          url: link.url,
          is_active: link.is_active,
          display_order: link.display_order,
        });
        setDialogOpen(true);
      };

      const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this social media link?')) return;
        deleteMutation.mutate(id);
      };

    const resetForm = () => {
        setFormData({ platform: '', url: '', is_active: true, display_order: 0 });
        setEditingLink(null);
    };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Media Links</h1>
          <p className="text-muted-foreground">Manage your school's social media presence</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Social Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLink ? 'Edit Social Media Link' : 'Add New Social Media Link'}
              </DialogTitle>
              <DialogDescription>
                Add your school's social media profile links to appear in the website footer.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => setFormData({ ...formData, platform: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(platformLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://facebook.com/yourschool"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingLink ? 'Update Link' : 'Add Link'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Social Media Links</CardTitle>
          <CardDescription>
            These links will appear in your website footer. Only active links are displayed to visitors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {socialLinks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No social media links configured yet. Add your first link to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {socialLinks.map((link) => {
                  const IconComponent = platformIcons[link.platform as keyof typeof platformIcons];
                  return (
                    <TableRow key={link.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          {platformLabels[link.platform as keyof typeof platformLabels]}
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {link.url}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant={link.is_active ? 'default' : 'secondary'}>
                          {link.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(link)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(link.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
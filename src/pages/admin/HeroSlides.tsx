import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { djangoAPI } from '@/lib/django-api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Upload, X } from 'lucide-react';
import { uploadImage } from '@/utils/imageUpload';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image_url: string | null;
  button_text: string;
  button_url: string;
  order_index: number;
  is_active: boolean;
}

const HeroSlidesManager = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        button_text: '',
        button_url: '',
        order_index: 0,
        is_active: true,
      });
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: slides = [], isLoading } = useQuery<HeroSlide[], Error>({
        queryKey: ['heroSlides'],
        queryFn: async () => {
            // @ts-ignore
            const response = await djangoAPI.getHeroSlides();
            // @ts-ignore
            return response.results;
        },
    });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['heroSlides'] });
            setShowForm(false);
            setEditingSlide(null);
            resetForm();
        },
        onError: (error: Error) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
        },
    };

    const createMutation = useMutation({
        mutationFn: (slideData: any) => djangoAPI.createHeroSlide(slideData),
        ...mutationOptions,
    });

    const updateMutation = useMutation({
        mutationFn: (slideData: any) => djangoAPI.updateHeroSlide(editingSlide!.id, slideData),
        ...mutationOptions,
    });

    const deleteMutation = useMutation({
        mutationFn: (slideId: string) => djangoAPI.deleteHeroSlide(slideId),
        ...mutationOptions,
    });
    
    const toggleActiveMutation = useMutation({
        mutationFn: ({ slideId, is_active }: { slideId: string, is_active: boolean }) => djangoAPI.updateHeroSlide(slideId, { is_active }),
        ...mutationOptions,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let imageUrl = editingSlide?.image_url;
        if (uploadedImage) {
            const uploadResponse = await uploadImage(uploadedImage);
            imageUrl = uploadResponse.url;
        } else if (!imagePreview) {
            imageUrl = null;
        }

        const slideData = {
            ...formData,
            image_url: imageUrl,
        };

        if (editingSlide) {
            updateMutation.mutate(slideData);
        } else {
            createMutation.mutate(slideData);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({
              variant: 'destructive',
              title: 'File too large',
              description: 'Please select an image smaller than 5MB',
            });
            return;
          }

          setUploadedImage(file);
          const reader = new FileReader();
          reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      };

      const removeImage = () => {
        setUploadedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };

      const handleEdit = (slide: HeroSlide) => {
        setEditingSlide(slide);
        setFormData({
          title: slide.title,
          subtitle: slide.subtitle,
          button_text: slide.button_text,
          button_url: slide.button_url,
          order_index: slide.order_index,
          is_active: slide.is_active,
        });
        setImagePreview(slide.image_url);
        setUploadedImage(null);
        setShowForm(true);
      };

    const resetForm = () => {
        setFormData({
            title: '',
            subtitle: '',
            button_text: '',
            button_url: '',
            order_index: slides.length,
            is_active: true,
        });
        setUploadedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        if (!showForm) {
            resetForm();
        }
    }, [showForm]);

    if (isLoading) {
        return (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        );
    }

    return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Hero Slides Manager</h1>
              <p className="text-muted-foreground">Manage homepage banner slides</p>
            </div>
            <Button
              onClick={() => {
                setEditingSlide(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Slide
            </Button>
          </div>

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingSlide ? 'Edit Hero Slide' : 'Create New Hero Slide'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Form fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <Label htmlFor="title">Slide Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter slide title"
                            required
                        />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="button_text">Button Text</Label>
                        <Input
                            id="button_text"
                            value={formData.button_text}
                            onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                            placeholder="Enter button text"
                            required
                        />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subtitle">Slide Subtitle</Label>
                        <Textarea
                        id="subtitle"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        placeholder="Enter slide subtitle/description"
                        required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <Label htmlFor="button_url">Button Link</Label>
                        <Input
                            id="button_url"
                            value={formData.button_url}
                            onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                            placeholder="/academics, /admissions, etc."
                            required
                        />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="order_index">Display Order</Label>
                        <Input
                            id="order_index"
                            type="number"
                            value={formData.order_index}
                            onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                            min="0"
                            required
                        />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Background Image (Optional)</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-6">
                        {imagePreview ? (
                            <div className="relative">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded-lg"
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={removeImage}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            </div>
                        ) : (
                            <div className="text-center">
                            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <div className="space-y-2">
                                <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                >
                                Choose Image
                                </Button>
                                <p className="text-sm text-muted-foreground">
                                PNG, JPG up to 5MB
                                </p>
                            </div>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageSelect}
                        />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                        />
                        <Label htmlFor="is_active">Active</Label>
                    </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingSlide ? 'Update Slide' : 'Create Slide'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {slides.map((slide) => (
              <Card key={slide.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{slide.title}</h3>
                          <Badge variant={slide.is_active ? 'default' : 'secondary'}>
                            {slide.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">Order: {slide.order_index}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{slide.subtitle}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span><strong>Button:</strong> {slide.button_text}</span>
                          <span><strong>Link:</strong> {slide.button_url}</span>
                          {slide.image_url && (
                            <span><strong>Image:</strong> ✅ Custom background</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActiveMutation.mutate({ slideId: slide.id, is_active: !slide.is_active })}
                      >
                        {slide.is_active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(slide)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(slide.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {slides.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No hero slides found. Create your first slide to get started.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      );
};

export default HeroSlidesManager;
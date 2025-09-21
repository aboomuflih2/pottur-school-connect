import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { djangoAPI } from '@/lib/django-api';
import { toast } from 'sonner';
import { Trash2, Edit, Eye, EyeOff, Calendar, MapPin, Upload, Image, Plus, Clock, Pencil } from 'lucide-react';
import { format, isAfter } from "date-fns";
import { uploadImage } from '@/utils/imageUpload';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location?: string;
  is_featured: boolean;
  is_published: boolean;
  image_url?: string;
}

const EventsManager = () => {
    const queryClient = useQueryClient();
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_date: '',
        location: '',
        image_url: '',
        is_featured: false,
        is_published: false
      });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    const { data: events = [], isLoading } = useQuery<Event[], Error>({
        queryKey: ['events'],
        queryFn: async () => {
            // @ts-ignore
            const response = await djangoAPI.getEvents();
            // @ts-ignore
            return response.results;
        },
    });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    };

    const createMutation = useMutation({
        mutationFn: (eventData: any) => djangoAPI.createEvent(eventData),
        ...mutationOptions,
    });

    const updateMutation = useMutation({
        mutationFn: (eventData: any) => djangoAPI.updateEvent(editingEvent!.id, eventData),
        ...mutationOptions,
    });

    const deleteMutation = useMutation({
        mutationFn: (eventId: string) => djangoAPI.deleteEvent(eventId),
        ...mutationOptions,
    });

    const togglePublishedMutation = useMutation({
        mutationFn: (event: Event) => djangoAPI.updateEvent(event.id, { is_published: !event.is_published }),
        ...mutationOptions,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          setImageFile(file);
          const reader = new FileReader();
          reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title || !formData.description || !formData.event_date) {
          toast.error("Please fill in all required fields");
          return;
        }

        try {
          let imageUrl = formData.image_url;
          
          if (imageFile) {
            const uploadResponse = await uploadImage(imageFile);
            imageUrl = uploadResponse.url;
          }

          const submitData = {
            ...formData,
            image_url: imageUrl
          };
          
          if (editingEvent) {
            updateMutation.mutate(submitData);
          } else {
            createMutation.mutate(submitData);
          }

        } catch (error) {
          toast.error("Error saving event");
        }
      };

    const resetForm = () => {
        setFormData({
          title: '',
          description: '',
          event_date: '',
          location: '',
          image_url: '',
          is_featured: false,
          is_published: false
        });
        setImageFile(null);
        setImagePreview('');
        setEditingEvent(null);
      };

      const openEditDialog = (event?: Event) => {
        if (event) {
          setEditingEvent(event);
          setFormData({
            title: event.title,
            description: event.description,
            event_date: format(new Date(event.event_date), "yyyy-MM-dd'T'HH:mm"),
            location: event.location || "",
            image_url: event.image_url || "",
            is_featured: event.is_featured,
            is_published: event.is_published,
          });
          setImagePreview(event.image_url || '');
        } else {
          resetForm();
        }
        setIsDialogOpen(true);
      };

    const upcomingEvents = events.filter(event =>
        event.is_published && isAfter(new Date(event.event_date), new Date())
      );
      const pastEvents = events.filter(event =>
        event.is_published && !isAfter(new Date(event.event_date), new Date())
      );
      const unpublishedEvents = events.filter(event => !event.is_published);

    // ... (JSX is the same, but onClick handlers will use mutations)
};

export default EventsManager;
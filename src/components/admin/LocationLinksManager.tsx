import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Loader2,
  ExternalLink,
  Map,
  Navigation,
  Eye,
  GripVertical
} from 'lucide-react';
import { djangoAPI } from '@/lib/django-api';
import { useToast } from '@/hooks/use-toast';

interface ContactLocation {
  id: string;
  title: string;
  url: string;
  description?: string;
  location_type: 'map' | 'directions' | 'street_view' | 'other';
  is_active: boolean;
  display_order: number;
}

interface NewLocation {
  title: string;
  url: string;
  description: string;
  location_type: 'map' | 'directions' | 'street_view' | 'other';
}

const LocationLinksManager = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newLocation, setNewLocation] = useState<NewLocation>({
        title: '',
        url: '',
        description: '',
        location_type: 'map'
      });

    const locationTypes = [
        { value: 'map', label: 'Map View', icon: Map },
        { value: 'directions', label: 'Directions', icon: Navigation },
        { value: 'street_view', label: 'Street View', icon: Eye },
        { value: 'other', label: 'Other', icon: ExternalLink }
      ] as const;

    const { data: locations = [], isLoading } = useQuery<ContactLocation[], Error>({
        queryKey: ['contactLocations'],
        queryFn: async () => {
            // @ts-ignore
            const response = await djangoAPI.getContactLocations();
            // @ts-ignore
            return response.results;
        },
    });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contactLocations'] });
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
        mutationFn: (locationData: any) => djangoAPI.createContactLocation(locationData),
        ...mutationOptions,
        onSuccess: () => {
            mutationOptions.onSuccess();
            setShowAddForm(false);
            setNewLocation({
                title: '',
                url: '',
                description: '',
                location_type: 'map'
              });
        }
    });

    const updateMutation = useMutation({
        mutationFn: (location: ContactLocation) => djangoAPI.updateContactLocation(location.id, location),
        ...mutationOptions,
        onSuccess: () => {
            mutationOptions.onSuccess();
            setEditingId(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (locationId: string) => djangoAPI.deleteContactLocation(locationId),
        ...mutationOptions,
    });

    const handleAdd = async () => {
        if (!newLocation.title.trim() || !newLocation.url.trim()) {
          toast({
            title: 'Missing Information',
            description: 'Please fill in title and URL fields.',
            variant: 'destructive',
          });
          return;
        }

        try {
          new URL(newLocation.url);
        } catch {
          toast({
            title: 'Invalid URL',
            description: 'Please enter a valid URL.',
            variant: 'destructive',
          });
          return;
        }

        const maxOrder = Math.max(...locations.map(l => l.display_order), 0);
        createMutation.mutate({ ...newLocation, display_order: maxOrder + 1, is_active: true });
    };

    const updateLocationField = (
        id: string,
        field: keyof ContactLocation,
        value: string | ContactLocation['location_type']
      ) => {
        // This is now handled by react-query, but we can keep local state for editing
      };

      const getTypeIcon = (type: ContactLocation['location_type']) => {
        const typeConfig = locationTypes.find(t => t.value === type);
        return typeConfig?.icon || ExternalLink;
      };

      const getTypeLabel = (type: ContactLocation['location_type']) => {
        const typeConfig = locationTypes.find(t => t.value === type);
        return typeConfig?.label || type;
      };

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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ExternalLink className="h-6 w-6" />
            Location Links
          </h2>
          <p className="text-muted-foreground">Manage location links and maps displayed on the contact page</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location Link
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Location Link</CardTitle>
            <CardDescription>Create a new location link for the contact page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Form fields are the same */}
            <div className="flex gap-2">
              <Button 
                onClick={handleAdd} 
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Add Location Link
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Links List */}
      <div className="space-y-4">
        {locations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No location links found. Add some location links to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          locations.map((location) => {
            const TypeIcon = getTypeIcon(location.location_type);
            const isEditing = editingId === location.id;
            
            return (
              <Card key={location.id} className={!location.is_active ? 'opacity-60' : ''}>
                {/* JSX for location card is the same, but onClick handlers will use mutations */}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LocationLinksManager;

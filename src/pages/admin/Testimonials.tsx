import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Check, X, Trash2 } from "lucide-react";
import { djangoAPI } from "@/lib/django-api";
import { useToast } from "@/hooks/use-toast";

interface Testimonial {
  id: string;
  name: string;
  designation: string;
  content: string;
  rating: number;
  status: string;
  photo_url?: string;
  created_at: string;
  is_active: boolean;
}

const TestimonialsManager = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: testimonials = [], isLoading } = useQuery<Testimonial[], Error>({
      queryKey: ['testimonials'],
      queryFn: async () => {
        // @ts-ignore
        const response = await djangoAPI.getTestimonials();
        // @ts-ignore
        return response.results;
      },
    });

    const mutationOptions = {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    };

    const updateStatusMutation = useMutation({
      mutationFn: ({ id, status }: { id: string, status: string }) => djangoAPI.updateTestimonial(id, { status }),
      ...mutationOptions,
      onSuccess: () => {
          toast({
              title: "Success",
              description: `Testimonial status updated`,
            });
          mutationOptions.onSuccess();
      }
    });

    const deleteMutation = useMutation({
      mutationFn: (id: string) => djangoAPI.deleteTestimonial(id),
      ...mutationOptions,
      onSuccess: () => {
          toast({
              title: "Success",
              description: "Testimonial deleted",
            });
          mutationOptions.onSuccess();
      }
    });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const pendingTestimonials = testimonials.filter(t => t.status === 'pending');
  const approvedTestimonials = testimonials.filter(t => t.status === 'approved');
  const rejectedTestimonials = testimonials.filter(t => t.status === 'rejected');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Testimonials Manager</h1>
        <p className="text-muted-foreground mt-2">
          Manage and moderate testimonials from your website visitors
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending Review
            {pendingTestimonials.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {pendingTestimonials.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedTestimonials.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedTestimonials.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingTestimonials.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No testimonials pending review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingTestimonials.map((testimonial) => (
                <Card key={testimonial.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={testimonial.photo_url} alt={testimonial.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(testimonial.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                          <CardDescription>{testimonial.designation}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {renderStars(testimonial.rating)}
                        </div>
                        {getStatusBadge(testimonial.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="text-foreground/80 leading-relaxed italic mb-4">
                      "{testimonial.content}"
                    </blockquote>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Submitted: {new Date(testimonial.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: testimonial.id, status: 'approved' })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatusMutation.mutate({ id: testimonial.id, status: 'rejected' })}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedTestimonials.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No approved testimonials</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {approvedTestimonials.map((testimonial) => (
                <Card key={testimonial.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={testimonial.photo_url} alt={testimonial.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(testimonial.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                          <CardDescription>{testimonial.designation}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {renderStars(testimonial.rating)}
                        </div>
                        {getStatusBadge(testimonial.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="text-foreground/80 leading-relaxed italic mb-4">
                      "{testimonial.content}"
                    </blockquote>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Approved: {new Date(testimonial.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ id: testimonial.id, status: 'pending' })}
                        >
                          Move to Pending
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(testimonial.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedTestimonials.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No rejected testimonials</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {rejectedTestimonials.map((testimonial) => (
                <Card key={testimonial.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={testimonial.photo_url} alt={testimonial.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(testimonial.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                          <CardDescription>{testimonial.designation}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {renderStars(testimonial.rating)}
                        </div>
                        {getStatusBadge(testimonial.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="text-foreground/80 leading-relaxed italic mb-4">
                      "{testimonial.content}"
                    </blockquote>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Rejected: {new Date(testimonial.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ id: testimonial.id, status: 'pending' })}
                        >
                          Move to Pending
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(testimonial.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestimonialsManager;
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Heart, Share2, MessageCircle, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { format, isAfter } from "date-fns";

interface NewsPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image: string | null;
  publication_date: string;
  author: string;
  like_count: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date_time: string;
  event_type: string;
}

interface GalleryPhoto {
  id: string;
  image_url: string;
  title: string;
  description: string | null;
  display_order: number;
}

interface Comment {
  id: string;
  author_name: string;
  comment_text: string;
  created_at: string;
}

const NewsEvents = () => {
  const [newsArticles, setNewsArticles] = useState<NewsPost[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsPost | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({ name: "", email: "", text: "" });
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNewsArticles();
    fetchEvents();
    fetchGalleryPhotos();
  }, []);

  const fetchNewsArticles = async () => {
    const { data, error } = await supabase
      .from("news_posts")
      .select("*")
      .eq("is_published", true)
      .order("publication_date", { ascending: false });

    if (error) {
      console.error("Error fetching news:", error);
      return;
    }

    setNewsArticles(data || []);
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_active", true)
      .order("date_time", { ascending: true });

    if (error) {
      console.error("Error fetching events:", error);
      return;
    }

    setEvents(data || []);
  };

  const fetchGalleryPhotos = async () => {
    const { data, error } = await supabase
      .from("gallery_photos")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching gallery:", error);
      return;
    }

    setGalleryPhotos(data || []);
  };

  const fetchComments = async (articleId: string) => {
    const { data, error } = await supabase
      .from("article_comments")
      .select("*")
      .eq("article_id", articleId)
      .eq("is_approved", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return;
    }

    setComments(data || []);
  };

  const handleLike = async (articleId: string) => {
    if (isLiked) return;

    const userIP = "user-ip"; // In production, get actual IP
    const { error } = await supabase
      .from("article_likes")
      .insert({ article_id: articleId, user_ip: userIP });

    if (!error) {
      setIsLiked(true);
      // Update like count in state
      setNewsArticles(prev => 
        prev.map(article => 
          article.id === articleId 
            ? { ...article, like_count: article.like_count + 1 }
            : article
        )
      );
      if (selectedArticle && selectedArticle.id === articleId) {
        setSelectedArticle(prev => prev ? { ...prev, like_count: prev.like_count + 1 } : null);
      }
      toast({ title: "Thanks for liking this article!" });
    }
  };

  const handleComment = async () => {
    if (!selectedArticle || !newComment.name || !newComment.email || !newComment.text) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("article_comments")
      .insert({
        article_id: selectedArticle.id,
        author_name: newComment.name,
        author_email: newComment.email,
        comment_text: newComment.text
      });

    if (!error) {
      setNewComment({ name: "", email: "", text: "" });
      toast({ title: "Comment submitted for approval!" });
    }
  };

  const shareArticle = (article: NewsPost) => {
    const url = `${window.location.origin}/news`;
    const text = `Check out this article: ${article.title}`;
    
    if (navigator.share) {
      navigator.share({ title: article.title, text, url });
    } else {
      navigator.clipboard.writeText(`${text} - ${url}`);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  const openArticle = (article: NewsPost) => {
    setSelectedArticle(article);
    setIsLiked(false);
    fetchComments(article.id);
  };

  const upcomingEvents = events.filter(event => isAfter(new Date(event.date_time), new Date()));
  const pastEvents = events.filter(event => !isAfter(new Date(event.date_time), new Date()));

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % galleryPhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
  };

  return (
    <>
      <Helmet>
        <title>News & Events - Latest Updates and School Events</title>
        <meta name="description" content="Stay updated with the latest news, events, and activities from our school community." />
      </Helmet>
      
      <div className="min-h-screen">
        <Header />
        
        {/* Hero Section */}
        <section className="relative h-[400px] bg-gradient-to-r from-primary to-primary-foreground flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">News & Events</h1>
            <p className="text-xl opacity-90">Stay connected with our school community</p>
          </div>
        </section>

        {/* News Section */}
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Latest News</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                {article.featured_image && (
                  <img 
                    src={article.featured_image} 
                    alt={article.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(article.publication_date), "MMM dd, yyyy")}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 mb-4">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => openArticle(article)}
                    >
                      Read Full Story
                    </Button>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Heart className="w-4 h-4" />
                      {article.like_count}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Events Section */}
        <section className="py-16 px-4 max-w-7xl mx-auto bg-muted/30">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Upcoming Events */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Upcoming Events</h2>
              <div className="space-y-4">
                {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary text-primary-foreground p-3 rounded-lg text-center min-w-[80px]">
                          <div className="text-lg font-bold">
                            {format(new Date(event.date_time), "dd")}
                          </div>
                          <div className="text-sm">
                            {format(new Date(event.date_time), "MMM")}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Clock className="w-4 h-4" />
                            {format(new Date(event.date_time), "h:mm a")}
                          </div>
                          <p className="text-muted-foreground">{event.description}</p>
                          <Badge variant="secondary" className="mt-2">
                            {event.event_type}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <p className="text-muted-foreground">No upcoming events at this time.</p>
                )}
              </div>
            </div>

            {/* Previous Events */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Previous Events</h2>
              <div className="space-y-4">
                {pastEvents.slice(0, 5).map((event) => (
                  <Card key={event.id} className="opacity-75">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-muted text-muted-foreground p-3 rounded-lg text-center min-w-[80px]">
                          <div className="text-lg font-bold">
                            {format(new Date(event.date_time), "dd")}
                          </div>
                          <div className="text-sm">
                            {format(new Date(event.date_time), "MMM")}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                          <p className="text-muted-foreground">{event.description}</p>
                          <Badge variant="outline" className="mt-2">
                            {event.event_type}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {pastEvents.length === 0 && (
                  <p className="text-muted-foreground">No previous events to display.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        {galleryPhotos.length > 0 && (
          <section className="py-16 px-4 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Photo Gallery</h2>
            
            <div className="relative">
              <div className="relative h-[500px] rounded-lg overflow-hidden">
                <img 
                  src={galleryPhotos[currentPhotoIndex]?.image_url} 
                  alt={galleryPhotos[currentPhotoIndex]?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h3 className="text-white text-xl font-bold mb-2">
                    {galleryPhotos[currentPhotoIndex]?.title}
                  </h3>
                  {galleryPhotos[currentPhotoIndex]?.description && (
                    <p className="text-white/90">
                      {galleryPhotos[currentPhotoIndex]?.description}
                    </p>
                  )}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                onClick={prevPhoto}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                onClick={nextPhoto}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <div className="flex justify-center mt-4 gap-2">
                {galleryPhotos.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentPhotoIndex ? "bg-primary" : "bg-muted"
                    }`}
                    onClick={() => setCurrentPhotoIndex(index)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Article Modal */}
        <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedArticle && (
              <div className="space-y-6">
                {selectedArticle.featured_image && (
                  <img 
                    src={selectedArticle.featured_image} 
                    alt={selectedArticle.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
                
                <div>
                  <h1 className="text-3xl font-bold mb-4">{selectedArticle.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span>By {selectedArticle.author}</span>
                    <span>•</span>
                    <span>{format(new Date(selectedArticle.publication_date), "MMMM dd, yyyy")}</span>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
                </div>

                {/* Like and Share Buttons */}
                <div className="flex items-center gap-4 pt-6 border-t">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    onClick={() => handleLike(selectedArticle.id)}
                    disabled={isLiked}
                    className="flex items-center gap-2"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                    {selectedArticle.like_count} {isLiked ? "Liked!" : "Like"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => shareArticle(selectedArticle)}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>

                {/* Comments Section */}
                <div className="pt-6 border-t">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Comments ({comments.length})
                  </h3>

                  {/* Existing Comments */}
                  <div className="space-y-4 mb-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{comment.author_name}</span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(comment.created_at), "MMM dd, yyyy")}
                          </span>
                        </div>
                        <p>{comment.comment_text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment Form */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Leave a comment</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Your name"
                        value={newComment.name}
                        onChange={(e) => setNewComment(prev => ({ ...prev, name: e.target.value }))}
                      />
                      <Input
                        type="email"
                        placeholder="Your email"
                        value={newComment.email}
                        onChange={(e) => setNewComment(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <Textarea
                      placeholder="Your comment..."
                      value={newComment.text}
                      onChange={(e) => setNewComment(prev => ({ ...prev, text: e.target.value }))}
                      rows={4}
                    />
                    <Button onClick={handleComment}>
                      Submit Comment
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Comments are reviewed before being published.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </>
  );
};

export default NewsEvents;

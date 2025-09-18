import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import { AdmissionsModal } from "@/components/admissions/AdmissionsModal";
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
  event_date: string;
  location: string;
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
  const [isAdmissionsModalOpen, setIsAdmissionsModalOpen] = useState(false);
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

  // Generate a stable anonymous client ID for likes
  const getClientId = () => {
    try {
      const key = "psc_client_id";
      let id = localStorage.getItem(key);
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(key, id);
      }
      return id;
    } catch {
      // Fallback if localStorage/crypto unavailable
      return "anon-client";
    }
  };

  // When opening an article, determine if current client already liked it
  useEffect(() => {
    const checkLiked = async () => {
      if (!selectedArticle) return;
      try {
        const clientId = getClientId();
        const { count, error } = await supabase
          .from("article_likes")
          .select("id", { count: "exact", head: true })
          .eq("article_id", selectedArticle.id)
          .eq("user_ip", clientId);
        if (!error) setIsLiked((count ?? 0) > 0);
      } catch {
        // ignore check failures
      }
    };
    checkLiked();
  }, [selectedArticle]);

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
      .eq("is_published", true)
      .order("event_date", { ascending: true });

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

    const normalized = (data ?? []).map((row) => ({
      id: row.id,
      author_name: row.author_name,
      comment_text: row.comment_text ?? row.comment_content,
      created_at: row.created_at,
    })) as Comment[];

    setComments(normalized);
  };

  const refreshLikeCount = async (articleId: string) => {
    try {
      const { count, error } = await supabase
        .from("article_likes")
        .select("id", { count: "exact", head: true })
        .eq("article_id", articleId);
      if (error) return;
      const likeCount = count ?? 0;
      setNewsArticles(prev => prev.map(a => a.id === articleId ? { ...a, like_count: likeCount } : a));
      if (selectedArticle && selectedArticle.id === articleId) {
        setSelectedArticle(prev => (prev ? { ...prev, like_count: likeCount } : null));
      }
    } catch {
      // ignore
    }
  };

  const handleLike = async (articleId: string) => {
    if (isLiked) return;
    const clientId = getClientId();
    const { error } = await supabase
      .from("article_likes")
      .insert({ article_id: articleId, user_ip: clientId });

    if (!error) {
      setIsLiked(true);
      await refreshLikeCount(articleId);
      toast({ title: "Thanks for liking this article!" });
      return;
    }

    // Handle duplicate like or RLS errors gracefully
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("unique") || msg.includes("duplicate") || msg.includes("23505")) {
      setIsLiked(true);
      await refreshLikeCount(articleId);
      toast({ title: "You already liked this article." });
    } else if (msg.toLowerCase().includes("row-level security") || msg.toLowerCase().includes("permission")) {
      toast({ title: "Unable to like right now", description: "Please sign in and try again.", variant: "destructive" });
    } else {
      toast({ title: "Unable to like right now", description: msg || "Please try again later.", variant: "destructive" });
    }
  };

  const handleComment = async () => {
    if (!selectedArticle || !newComment.name || !newComment.email || !newComment.text) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    let { error } = await supabase
      .from("article_comments")
      .insert({
        article_id: selectedArticle.id,
        author_name: newComment.name,
        author_email: newComment.email,
        comment_text: newComment.text,
      });

    // Fallback for older schema where column was 'comment_content'
    const errorMessage = error instanceof Error ? error.message : "";
    if (error && errorMessage.includes("comment_text")) {
      const retry = await supabase
        .from("article_comments")
        .insert({
          article_id: selectedArticle.id,
          author_name: newComment.name,
          author_email: newComment.email,
          comment_content: newComment.text,
        });
      error = retry.error;
    }

    if (!error) {
      setNewComment({ name: "", email: "", text: "" });
      toast({ title: "Comment submitted for approval!" });
      // Refresh comments list to show newly added once approved (optional immediate refresh)
      fetchComments(selectedArticle.id);
    } else {
      const msg = error instanceof Error ? error.message : "";
      if (msg.toLowerCase().includes("row-level security") || msg.toLowerCase().includes("permission")) {
        toast({ title: "Unable to submit comment", description: "Please sign in and try again.", variant: "destructive" });
      } else {
        toast({ title: "Unable to submit comment", description: msg || "Please try again later.", variant: "destructive" });
      }
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

  const upcomingEvents = events.filter(event => isAfter(new Date(event.event_date), new Date()));
  const pastEvents = events.filter(event => !isAfter(new Date(event.event_date), new Date()));

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
        <Header onAdmissionsClick={() => setIsAdmissionsModalOpen(true)} />
        
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
                            {format(new Date(event.event_date), "dd")}
                          </div>
                          <div className="text-sm">
                            {format(new Date(event.event_date), "MMM")}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Clock className="w-4 h-4" />
                            {format(new Date(event.event_date), "h:mm a")}
                          </div>
                          <p className="text-muted-foreground">{event.description}</p>
                          <Badge variant="secondary" className="mt-2">
                            {event.location}
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
                            {format(new Date(event.event_date), "dd")}
                          </div>
                          <div className="text-sm">
                            {format(new Date(event.event_date), "MMM")}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                          <p className="text-muted-foreground">{event.description}</p>
                          <Badge variant="outline" className="mt-2">
                            {event.location}
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
        <AdmissionsModal 
          isOpen={isAdmissionsModalOpen} 
          onClose={() => setIsAdmissionsModalOpen(false)} 
        />
      </div>
    </>
  );
};

export default NewsEvents;


import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User, ArrowRight } from "lucide-react";
import { djangoAPI } from '@/lib/django-api';
import { useNavigate } from "react-router-dom";

interface NewsPost {
  id: string;
  title: string;
  excerpt: string;
  featured_image: string | null;
  publication_date: string;
  slug?: string;
}

const CampusNews = () => {
    const navigate = useNavigate();
    const { data: newsItems = [], isLoading, error } = useQuery<NewsPost[], Error>({
        queryKey: ['latestNews'],
        queryFn: async () => {
            // @ts-ignore
            const response = await djangoAPI.getLatestNews(3);
            // @ts-ignore
            return response.results;
        },
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleReadMore = (news: NewsPost) => {
    const slug = news.slug || news.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || news.id;
    navigate(`/news-events#${slug}`);
  };

  const handleViewAllNews = () => {
    navigate('/news-events');
  };

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-4">
            Campus News & Updates
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest happenings, achievements, and events at Modern Higher Secondary School, Pottur.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video" />
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-4 mb-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="pt-0">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['latestNews'] })} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && newsItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No news articles published yet.</p>
            <Button onClick={handleViewAllNews} variant="outline">
              Visit News Page
            </Button>
          </div>
        )}

        {/* News Grid */}
        {!isLoading && !error && newsItems.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {newsItems.map((news) => (
                <Card key={news.id} className="overflow-hidden hover:shadow-elegant transition-smooth group bg-card">
                  {/* News Image */}
                  <div className="aspect-video bg-gradient-subtle relative overflow-hidden">
                    {news.featured_image ? (
                      <img 
                        src={news.featured_image} 
                        alt={news.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">News Image</span>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    {/* Date and Author */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(news.publication_date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Admin</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-heading font-semibold text-primary line-clamp-2 group-hover:text-primary-light transition-colors">
                      {news.title}
                    </h3>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Excerpt */}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                      {news.excerpt}
                    </p>

                    {/* Read More Link */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleReadMore(news)}
                      className="text-primary hover:text-primary-light p-0 h-auto font-medium group/btn"
                    >
                      Read More
                      <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* View All News Button */}
            <div className="text-center">
              <Button 
                size="lg"
                onClick={handleViewAllNews}
                className="bg-primary hover:bg-primary-light text-primary-foreground font-semibold shadow-elegant"
              >
                View All News & Events
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default CampusNews;

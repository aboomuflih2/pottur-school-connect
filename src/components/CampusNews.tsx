import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight } from "lucide-react";

const CampusNews = () => {
  // Mock news data - in real app, this would come from API
  const newsItems = [
    {
      id: 1,
      title: "Annual Science Exhibition 2024 Registration Open",
      excerpt: "Students from all streams are invited to participate in our annual science exhibition. Register now to showcase your innovative projects and compete for exciting prizes.",
      image: "/placeholder-news-1.jpg",
      date: "2024-02-15",
      author: "Science Department",
      slug: "science-exhibition-2024"
    },
    {
      id: 2,
      title: "Outstanding Performance in DHSE Results",
      excerpt: "Modern HSS Pottur achieves exceptional results in Higher Secondary examinations with 100% pass rate. Our students secured top ranks in science and commerce streams.",
      image: "/placeholder-news-2.jpg",
      date: "2024-02-10",
      author: "Academic Office",
      slug: "dhse-results-2024"
    },
    {
      id: 3,
      title: "New Computer Lab Inauguration",
      excerpt: "State-of-the-art computer laboratory with 40 latest systems inaugurated by District Collector. The lab features high-speed internet and modern software for enhanced learning.",
      image: "/placeholder-news-3.jpg",
      date: "2024-02-05",
      author: "IT Department",
      slug: "computer-lab-inauguration"
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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

        {/* News Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {newsItems.map((news) => (
            <Card key={news.id} className="overflow-hidden hover:shadow-elegant transition-smooth group bg-card">
              {/* News Image */}
              <div className="aspect-video bg-gradient-subtle relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">News Image</span>
                </div>
              </div>

              <CardHeader className="pb-3">
                {/* Date and Author */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(news.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{news.author}</span>
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
            className="bg-primary hover:bg-primary-light text-primary-foreground font-semibold shadow-elegant"
          >
            View All News & Events
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CampusNews;
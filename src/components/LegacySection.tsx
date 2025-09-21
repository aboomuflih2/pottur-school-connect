import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { icons, type LucideIcon } from "lucide-react";
import { djangoAPI } from "@/lib/django-api";

interface SchoolStat {
  id: string;
  stat_label: string;
  stat_value: string;
  stat_name: string;
  icon?: string | null;
}

const LegacySection = () => {
  const [stats, setStats] = useState<SchoolStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await djangoAPI.getSchoolStats();
      setStats(data || []);
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback to default stats if database fails
      setStats([
        { id: '1', stat_label: 'Students Enrolled', stat_value: '500+', stat_name: 'Students', icon: 'Users' },
        { id: '2', stat_label: 'Years of Excellence', stat_value: '25+', stat_name: 'Years', icon: 'Award' },
        { id: '3', stat_label: 'Pass Rate', stat_value: '100%', stat_name: 'PassRate', icon: 'BookOpen' },
        { id: '4', stat_label: 'Academic Awards', stat_value: '50+', stat_name: 'Awards', icon: 'Trophy' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-6">
              A Legacy of Educational Excellence
            </h2>
            <div className="space-y-4 text-foreground/80 text-lg leading-relaxed">
              <p>
                Modern Higher Secondary School, Pottur, stands as a beacon of quality education in Malappuram district. 
                Established under the Crescent Educational Trust, our institution has been nurturing young minds and 
                shaping future leaders for over two decades.
              </p>
              <p>
                Affiliated with the Kerala State Board (DHSE Code: 11181), we are committed to providing comprehensive 
                education that blends academic excellence with moral values, preparing our students for the challenges 
                of tomorrow.
              </p>
              <p>
                Located in the serene environment of Mudur P.O., Vattamkulam Via, our campus provides an ideal setting 
                for learning, growth, and character development.
              </p>
            </div>
            
            <div className="mt-8">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-light text-primary-foreground font-semibold shadow-elegant"
              >
                Learn More About Us
              </Button>
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-2 gap-6">
            {loading ? (
              // Loading skeleton
              [...Array(4)].map((_, index) => (
                <Card key={index} className="p-6 text-center shadow-card bg-card animate-pulse">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-full mb-4">
                    <div className="w-6 h-6 bg-muted-foreground/20 rounded"></div>
                  </div>
                  <div className="h-8 bg-muted-foreground/20 rounded mb-2 mx-auto w-20"></div>
                  <div className="h-4 bg-muted-foreground/20 rounded mx-auto w-24"></div>
                </Card>
              ))
            ) : (
              stats.map((stat) => {
                const iconKey = (stat as any).icon || 'Trophy';
                const IconComponent = (icons as Record<string, LucideIcon>)[iconKey] || icons.Trophy;
                return (
                  <Card key={stat.id} className="p-6 text-center shadow-card hover:shadow-elegant transition-smooth bg-card">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {stat.stat_value}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      {stat.stat_label}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LegacySection;

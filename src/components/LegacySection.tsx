import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Award, Users, BookOpen, Trophy } from "lucide-react";

const LegacySection = () => {
  const achievements = [
    {
      icon: Users,
      number: "500+",
      label: "Students Enrolled"
    },
    {
      icon: Award,
      number: "25+",
      label: "Years of Excellence"
    },
    {
      icon: BookOpen,
      number: "100%",
      label: "Pass Rate"
    },
    {
      icon: Trophy,
      number: "50+",
      label: "Academic Awards"
    }
  ];

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
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <Card key={index} className="p-6 text-center shadow-card hover:shadow-elegant transition-smooth bg-card">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {achievement.number}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {achievement.label}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LegacySection;
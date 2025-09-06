import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GraduationCap, Calculator, Beaker, Globe, BookOpen, Users } from "lucide-react";

const AcademicPrograms = () => {
  const [selectedProgram, setSelectedProgram] = useState(null);

  const programs = [
    {
      id: 1,
      title: "Science Stream",
      icon: Beaker,
      shortDescription: "Physics, Chemistry, Mathematics, and Biology for aspiring engineers and medical professionals.",
      detailedDescription: `Our Science stream offers comprehensive preparation for engineering and medical entrance examinations. The curriculum includes:
      
      • Physics: Mechanics, Thermodynamics, Optics, Electricity & Magnetism
      • Chemistry: Physical, Organic, and Inorganic Chemistry
      • Mathematics: Calculus, Algebra, Trigonometry, and Statistics  
      • Biology: Botany and Zoology with practical applications
      
      Students benefit from well-equipped laboratories, experienced faculty, and regular practice sessions for competitive exams like JEE and NEET.`,
      subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
      duration: "2 Years (Class 11 & 12)"
    },
    {
      id: 2,
      title: "Commerce Stream",
      icon: Calculator,
      shortDescription: "Business Studies, Accountancy, and Economics for future business leaders and entrepreneurs.",
      detailedDescription: `The Commerce stream prepares students for careers in business, finance, and management:
      
      • Business Studies: Principles of management, marketing, and entrepreneurship
      • Accountancy: Financial accounting, cost accounting, and auditing
      • Economics: Micro and macroeconomics principles
      • Statistics: Business statistics and data analysis
      
      Our commerce program includes practical training in accounting software, business plan development, and market research techniques.`,
      subjects: ["Business Studies", "Accountancy", "Economics", "Statistics"],
      duration: "2 Years (Class 11 & 12)"
    },
    {
      id: 3,
      title: "Humanities Stream",
      icon: BookOpen,
      shortDescription: "History, Political Science, and Sociology for future civil servants and social workers.",
      detailedDescription: `The Humanities stream develops critical thinking and analytical skills:
      
      • History: World history, Indian freedom struggle, and contemporary events
      • Political Science: Indian constitution, political theory, and governance
      • Sociology: Social institutions, change, and development
      • Psychology: Human behavior and mental processes
      
      Students are prepared for civil services, law, journalism, and social work careers through debates, discussions, and project work.`,
      subjects: ["History", "Political Science", "Sociology", "Psychology"],
      duration: "2 Years (Class 11 & 12)"
    },
    {
      id: 4,
      title: "Computer Science",
      icon: Globe,
      shortDescription: "Programming, Data Structures, and modern technology for the digital age.",
      detailedDescription: `Our Computer Science program covers cutting-edge technology concepts:
      
      • Programming: Python, Java, and web development
      • Data Structures: Arrays, linked lists, trees, and graphs
      • Database Management: SQL and database design
      • Computer Networks: Internet protocols and security
      
      Students work on real-world projects and internships with technology companies to gain practical experience.`,
      subjects: ["Programming", "Data Structures", "Database Management", "Computer Networks"],
      duration: "2 Years (Class 11 & 12)"
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-4">
            Academic Programs
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from our diverse range of academic streams designed to unlock your potential 
            and prepare you for higher education and career success.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {programs.map((program) => {
            const Icon = program.icon;
            return (
              <Card 
                key={program.id} 
                className="p-6 hover:shadow-elegant transition-smooth cursor-pointer group bg-card"
              >
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6 group-hover:bg-primary/20 transition-smooth">
                  <Icon className="h-8 w-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-heading font-semibold text-primary mb-4">
                  {program.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {program.shortDescription}
                </p>

                {/* Learn More Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setSelectedProgram(program)}
                >
                  Learn More
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Program Details Modal */}
        <Dialog 
          open={!!selectedProgram} 
          onOpenChange={() => setSelectedProgram(null)}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedProgram && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-2xl text-primary">
                    {(() => {
                      const Icon = selectedProgram.icon;
                      return <Icon className="h-8 w-8" />;
                    })()}
                    {selectedProgram.title}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Duration */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{selectedProgram.duration}</span>
                  </div>

                  {/* Detailed Description */}
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-line text-foreground">
                      {selectedProgram.detailedDescription}
                    </div>
                  </div>

                  {/* Subjects */}
                  <div>
                    <h4 className="font-semibold text-primary mb-3">Core Subjects</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProgram.subjects.map((subject, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    <Button className="w-full bg-primary hover:bg-primary-light text-primary-foreground">
                      Apply for {selectedProgram.title}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default AcademicPrograms;
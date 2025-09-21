import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { djangoAPI } from '@/lib/django-api';
import { AcademicProgram } from '@/types/academic';
import { BookOpen, Users, Award, Target, Lightbulb, GraduationCap } from "lucide-react";

const Academics = () => {
    const [isAdmissionsModalOpen, setIsAdmissionsModalOpen] = useState(false);
    const { data: programs = [], isLoading } = useQuery<AcademicProgram[], Error>({
        queryKey: ['academicPrograms'],
        queryFn: async () => {
            // @ts-ignore
            const response = await djangoAPI.getPrograms();
            // @ts-ignore
            return response.results;
        },
    });

    const getIcon = (title: string) => {
        if (title.includes("Pre-School")) return BookOpen;
        if (title.includes("Primary")) return Users;
        if (title.includes("Upper Primary")) return Target;
        if (title.includes("Moral Studies")) return Lightbulb;
        if (title.includes("High School")) return Award;
        if (title.includes("Higher Secondary")) return GraduationCap;
        return BookOpen;
      };

  return (
    <>
      <Helmet>
        <title>Academics - Modern Higher Secondary School Pottur</title>
        <meta name="description" content="Explore the academic programs offered at Modern Higher Secondary School Pottur, from Pre-School to Higher Secondary education." />
      </Helmet>
      <Header onAdmissionsClick={() => setIsAdmissionsModalOpen(true)} />
      <main>
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-8">Our Academic Programs</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <CardHeader>
                      <div className="h-6 bg-gray-200 w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-gray-200 mb-2"></div>
                      <div className="h-4 bg-gray-200 w-1/2"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                programs.map((program) => {
                  const IconComponent = getIcon(program.name);
                  return (
                    <Card key={program.id}>
                      <div className="h-48 bg-gray-100 flex items-center justify-center">
                        <IconComponent className="w-16 h-16 text-gray-400" />
                      </div>
                      <CardHeader>
                        <CardTitle>{program.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{program.description}</p>
                        <Button className="mt-4">Learn More</Button>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Academics;
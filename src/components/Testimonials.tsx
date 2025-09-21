import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { djangoAPI } from '@/lib/django-api';

interface Testimonial {
  id: string;
  name: string;
  designation: string;
  content: string;
  rating: number;
  photo_url?: string;
  status: string;
}

const Testimonials = () => {
    const { data: testimonials = [], isLoading } = useQuery<Testimonial[], Error>({
        queryKey: ['testimonials'],
        queryFn: async () => {
            // @ts-ignore
            const response = await djangoAPI.getTestimonials();
            // @ts-ignore
            return response.results.filter(t => t.status === 'approved');
        },
    });

    const getInitials = (name: string) => {
        return name
          .split(' ')
          .map(word => word.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2);
      };

    if (isLoading) {
        return <div>Loading testimonials...</div>;
    }

    if (testimonials.length === 0) {
        return null;
    }

  return (
    <section className="py-12 bg-gray-50 sm:py-16 lg:py-20">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl xl:text-5xl font-pj">
            What Our Community Says
          </h2>
          <p className="max-w-lg mx-auto mt-4 text-base leading-7 text-gray-600 font-pj">
            Hear from students, parents, and alumni about their experience at our school.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full max-w-4xl mx-auto mt-12"
        >
          <CarouselContent>
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="md:basis-1/2">
                <Card className="h-full">
                  <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div>
                        <div className="flex items-center mb-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                key={i}
                                className={`h-5 w-5 ${
                                    i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                }`}
                                />
                            ))}
                        </div>
                        <p className="text-lg italic text-gray-700">
                            "{testimonial.content}"
                        </p>
                    </div>
                    <div className="flex items-center mt-6">
                      <Avatar>
                        <AvatarImage src={testimonial.photo_url} alt={testimonial.name} />
                        <AvatarFallback>{getInitials(testimonial.name)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <p className="font-bold text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.designation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};

export default Testimonials;
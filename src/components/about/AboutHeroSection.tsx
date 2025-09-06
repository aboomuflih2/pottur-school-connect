import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroSchoolBuilding from "@/assets/hero-school-building.jpg";
import studentsStudying from "@/assets/students-studying.jpg";

interface HeroSlide {
  id: string;
  background_image: string;
}

const AboutHeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('id, background_image')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;

      if (data && data.length > 0) {
        setSlides(data);
      } else {
        // Fallback slides with default images
        setSlides([
          { id: '1', background_image: heroSchoolBuilding },
          { id: '2', background_image: studentsStudying }
        ]);
      }
    } catch (error) {
      console.error('Error loading slides:', error);
      // Use fallback slides
      setSlides([
        { id: '1', background_image: heroSchoolBuilding },
        { id: '2', background_image: studentsStudying }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getSlideImage = (slide: HeroSlide) => {
    if (slide.background_image && slide.background_image.startsWith('http')) {
      return slide.background_image;
    }
    return slide.id === '1' ? heroSchoolBuilding : studentsStudying;
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [slides]);

  if (loading) {
    return (
      <section className="relative h-[50vh] lg:h-[60vh] flex items-center justify-center bg-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </section>
    );
  }

  return (
    <section className="relative h-[50vh] lg:h-[60vh] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${getSlideImage(slide)})`,
            }}
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      ))}

      {/* Navigation Buttons */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default AboutHeroSection;
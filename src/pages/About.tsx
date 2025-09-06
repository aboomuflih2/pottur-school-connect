import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AboutHeroSection from "@/components/about/AboutHeroSection";
import AboutLegacySection from "@/components/about/AboutLegacySection";
import AboutMissionVision from "@/components/about/AboutMissionVision";
import AboutLeadership from "@/components/about/AboutLeadership";
import AboutTeamStats from "@/components/about/AboutTeamStats";
import AboutFeatures from "@/components/about/AboutFeatures";
import AboutTestimonials from "@/components/about/AboutTestimonials";

const About = () => {
  useEffect(() => {
    // Set page title and meta description
    document.title = "About Us - Modern Higher Secondary School, Pottur";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn about the rich history, mission, vision, and leadership of Modern Higher Secondary School, Pottur. Discover our commitment to educational excellence.');
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <AboutHeroSection />
        <AboutLegacySection />
        <AboutMissionVision />
        <AboutLeadership />
        <AboutTeamStats />
        <AboutFeatures />
        <AboutTestimonials />
      </main>
      <Footer />
    </div>
  );
};

export default About;
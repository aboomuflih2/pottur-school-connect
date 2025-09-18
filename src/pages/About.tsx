import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AboutHeroSection from "@/components/about/AboutHeroSection";
import AboutLegacySection from "@/components/about/AboutLegacySection";
import AboutMissionVision from "@/components/about/AboutMissionVision";
import AboutLeadership from "@/components/about/AboutLeadership";
import AboutTeamStats from "@/components/about/AboutTeamStats";
import AboutFeatures from "@/components/about/AboutFeatures";
import AboutTestimonials from "@/components/about/AboutTestimonials";
import { AdmissionsModal } from "@/components/admissions/AdmissionsModal";

const About = () => {
  const [isAdmissionsModalOpen, setIsAdmissionsModalOpen] = useState(false);
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
      <Header onAdmissionsClick={() => setIsAdmissionsModalOpen(true)} />
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
      <AdmissionsModal 
        isOpen={isAdmissionsModalOpen} 
        onClose={() => setIsAdmissionsModalOpen(false)} 
      />
    </div>
  );
};

export default About;
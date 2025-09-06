import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import BreakingNews from "@/components/BreakingNews";
import LegacySection from "@/components/LegacySection";
import AcademicPrograms from "@/components/AcademicPrograms";
import CampusNews from "@/components/CampusNews";
import ContactForm from "@/components/ContactForm";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <BreakingNews />
      <LegacySection />
      <AcademicPrograms />
      <CampusNews />
      <ContactForm />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;

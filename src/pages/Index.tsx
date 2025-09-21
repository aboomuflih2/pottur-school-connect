import { useState, Suspense, lazy, memo, useCallback } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import LegacySection from "@/components/LegacySection";
import Footer from "@/components/Footer";

// Defer non-critical homepage sections to speed first paint
const BreakingNews = lazy(() => import("@/components/BreakingNews"));
const AcademicPrograms = lazy(() => import("@/components/AcademicPrograms"));
const CampusNews = lazy(() => import("@/components/CampusNews"));
const ContactForm = lazy(() => import("@/components/ContactForm"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const JoinOurTeam = lazy(() => import("@/components/JoinOurTeam"));
const AdmissionsModal = lazy(() =>
  import("@/components/admissions/AdmissionsModal").then((m) => ({
    default: m.AdmissionsModal,
  }))
);

const Index = memo(() => {
  const [isAdmissionsModalOpen, setIsAdmissionsModalOpen] = useState(false);
  
  const handleAdmissionsClick = useCallback(() => {
    setIsAdmissionsModalOpen(true);
  }, []);
  
  const handleAdmissionsClose = useCallback(() => {
    setIsAdmissionsModalOpen(false);
  }, []);
  
  return (
    <div className="min-h-screen">
      <Header onAdmissionsClick={handleAdmissionsClick} />
      <HeroSection />
      <Suspense fallback={<div className="py-6" />}> 
        <BreakingNews />
      </Suspense>
      <LegacySection />
      <Suspense fallback={<div className="py-12" />}> 
        <AcademicPrograms />
      </Suspense>
      <Suspense fallback={<div className="py-12" />}> 
        <CampusNews />
      </Suspense>
      <Suspense fallback={<div className="py-12" />}> 
        <ContactForm />
      </Suspense>
      <Suspense fallback={<div className="py-12" />}> 
        <Testimonials />
      </Suspense>
      <Suspense fallback={<div className="py-12" />}> 
        <JoinOurTeam />
      </Suspense>
      <Footer />
      <Suspense fallback={null}>
        <AdmissionsModal
          isOpen={isAdmissionsModalOpen}
          onClose={handleAdmissionsClose}
        />
      </Suspense>
    </div>
  );
});

export default Index;

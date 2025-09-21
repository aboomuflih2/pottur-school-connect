import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Route-level code splitting
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Careers = lazy(() => import("./pages/Careers"));
const Academics = lazy(() => import("./pages/Academics"));
const NewsEvents = lazy(() => import("./pages/NewsEvents"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const TestAuth = lazy(() => import("./pages/TestAuth"));

// Admin and admissions areas (heavy) – load on demand
const AdminRoute = lazy(() => import("./components/AdminRoute"));
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const HeroSlidesManager = lazy(() => import("./pages/admin/HeroSlides"));
const BreakingNewsManager = lazy(() => import("./pages/admin/BreakingNews"));
const ContactsManager = lazy(() => import("./pages/admin/Contacts"));
const ContactPageManager = lazy(() => import("./pages/admin/ContactPageManager"));
const AboutPageManager = lazy(() => import("./pages/admin/AboutPage"));
const BoardMembersManager = lazy(() => import("./pages/admin/BoardMembers"));
const LeadershipMessagesManager = lazy(() => import("./pages/admin/LeadershipMessages"));
const SchoolFeaturesManager = lazy(() => import("./pages/admin/SchoolFeatures"));
const SchoolStats = lazy(() => import("./pages/admin/SchoolStats"));
const TestimonialsManager = lazy(() => import("./pages/admin/Testimonials"));
const AdminAcademics = lazy(() => import("./pages/admin/Academics"));
const AcademicProgramNew = lazy(() => import("./pages/admin/AcademicProgramNew"));
const AcademicProgramEdit = lazy(() => import("./pages/admin/AcademicProgramEdit"));
const NewsManager = lazy(() => import("./pages/admin/NewsManager"));
const EventsManager = lazy(() => import("./pages/admin/EventsManager"));
const GalleryManager = lazy(() => import("./pages/admin/GalleryManager"));
const SocialLinksManager = lazy(() => import("./pages/admin/SocialLinksManager"));
const AdmissionForms = lazy(() => import("./pages/admin/AdmissionForms"));
const AdmissionApplications = lazy(() => import("./pages/admin/AdmissionApplications"));
const JobApplications = lazy(() => import("./pages/admin/JobApplications"));
const InterviewSettings = lazy(() => import("./pages/admin/InterviewSettings"));
const ApplicationDetail = lazy(() => import("./pages/admin/ApplicationDetail"));

// Files with named exports – map to default for React.lazy
const KGStdApplicationForm = lazy(() =>
  import("./components/admissions/KGStdApplicationForm").then((m) => ({
    default: m.KGStdApplicationForm,
  }))
);
const PlusOneApplicationForm = lazy(() =>
  import("./components/admissions/PlusOneApplicationForm").then((m) => ({
    default: m.PlusOneApplicationForm,
  }))
);
const ApplicationSuccess = lazy(() =>
  import("./pages/ApplicationSuccess").then((m) => ({ default: m.ApplicationSuccess }))
);
const ApplicationTracking = lazy(() =>
  import("./pages/ApplicationTracking").then((m) => ({ default: m.ApplicationTracking }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/academics" element={<Academics />} />
              <Route path="/news-events" element={<NewsEvents />} />
              <Route path="/news" element={<NewsEvents />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/test-auth" element={<TestAuth />} />
            
              {/* Admission Routes */}
              <Route path="/admissions/apply/kg-std" element={<KGStdApplicationForm />} />
              <Route path="/admissions/apply/plus-one" element={<PlusOneApplicationForm />} />
              <Route path="/admissions/success" element={<ApplicationSuccess />} />
              <Route path="/admissions/track" element={<ApplicationTracking />} />
          
            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="hero-slides" element={<HeroSlidesManager />} />
                      <Route path="breaking-news" element={<BreakingNewsManager />} />
                      <Route path="contacts" element={<ContactsManager />} />
                      <Route path="contact-page" element={<ContactPageManager />} />
                      <Route path="about" element={<AboutPageManager />} />
                      <Route path="board-members" element={<BoardMembersManager />} />
                      <Route path="leadership-messages" element={<LeadershipMessagesManager />} />
                      <Route path="school-features" element={<SchoolFeaturesManager />} />
                      <Route path="school-stats" element={<SchoolStats />} />
                      <Route path="testimonials" element={<TestimonialsManager />} />
                      <Route path="academics" element={<AdminAcademics />} />
                      <Route path="academics/new" element={<AcademicProgramNew />} />
                      <Route path="academics/:id/edit" element={<AcademicProgramEdit />} />
                      <Route path="news" element={<NewsManager />} />
                      <Route path="events" element={<EventsManager />} />
                      <Route path="gallery" element={<GalleryManager />} />
                      <Route path="social-links" element={<SocialLinksManager />} />
                      <Route path="admission-forms" element={<AdmissionForms />} />
                      <Route path="admission-applications" element={<AdmissionApplications />} />
                      <Route path="job-applications" element={<JobApplications />} />
                      <Route path="interview-settings" element={<InterviewSettings />} />
                      <Route path="applications/:type/:id" element={<ApplicationDetail />} />
                      <Route index element={<AdminDashboard />} />
                    </Routes>
                  </AdminLayout>
                </AdminRoute>
              }
            />
          
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

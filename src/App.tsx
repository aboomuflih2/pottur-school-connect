import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import HeroSlidesManager from "./pages/admin/HeroSlides";
import BreakingNewsManager from "./pages/admin/BreakingNews";
import ContactsManager from "./pages/admin/Contacts";
import AboutPageManager from "./pages/admin/AboutPage";
import LeadershipManager from "./pages/admin/Leadership";
import SchoolFeaturesManager from "./pages/admin/SchoolFeatures";
import TestimonialsManager from "./pages/admin/Testimonials";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="banners" element={<HeroSlidesManager />} />
                  <Route path="breaking-news" element={<BreakingNewsManager />} />
                  <Route path="contacts" element={<ContactsManager />} />
                  <Route path="about-page" element={<AboutPageManager />} />
                  <Route path="leadership" element={<LeadershipManager />} />
                  <Route path="features" element={<SchoolFeaturesManager />} />
                  <Route path="testimonials" element={<TestimonialsManager />} />
                  <Route index element={<AdminDashboard />} />
                </Routes>
              </AdminLayout>
            </AdminRoute>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

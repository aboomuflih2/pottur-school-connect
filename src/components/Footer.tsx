import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Footer = () => {
  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Academics", href: "/academics" },
    { name: "Admissions", href: "/admissions" },
    { name: "Campus Life", href: "/campus-life" },
    { name: "News & Events", href: "/news" },
    { name: "Contact", href: "/contact" }
  ];

  const academicPrograms = [
    { name: "Science Stream", href: "/academics/science" },
    { name: "Commerce Stream", href: "/academics/commerce" },
    { name: "Humanities Stream", href: "/academics/humanities" },
    { name: "Computer Science", href: "/academics/computer-science" }
  ];

  const importantLinks = [
    { name: "Kerala DHSE", href: "https://dhsekerala.gov.in", external: true },
    { name: "Admission Guidelines", href: "/admissions/guidelines" },
    { name: "Fee Structure", href: "/admissions/fees" },
    { name: "Academic Calendar", href: "/academics/calendar" },
    { name: "Results", href: "/results" },
    { name: "Downloads", href: "/downloads" }
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">
          {/* School Information */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-xl">M</span>
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold">Modern HSS</h3>
                <p className="text-sm text-primary-foreground/80">Pottur</p>
              </div>
            </div>
            
            <p className="text-primary-foreground/90 leading-relaxed mb-6">
              Excellence in education with Kerala State Syllabus. Nurturing young minds 
              and shaping future leaders since our establishment.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="text-sm">0494-2699645</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="text-sm">modernpotur@gmail.com</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">
                  Mudur P.O., Vattamkulam Via,<br />
                  Edappal, Malappuram,<br />
                  Kerala - 679578
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="text-sm">Mon-Fri: 8 AM - 4 PM</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-heading font-semibold mb-6 text-accent">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/80 hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Academic Programs */}
          <div>
            <h4 className="text-lg font-heading font-semibold mb-6 text-accent">
              Academic Programs
            </h4>
            <ul className="space-y-3">
              {academicPrograms.map((program, index) => (
                <li key={index}>
                  <Link
                    to={program.href}
                    className="text-primary-foreground/80 hover:text-accent transition-colors text-sm"
                  >
                    {program.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Important Links & Social Media */}
          <div>
            <h4 className="text-lg font-heading font-semibold mb-6 text-accent">
              Important Links
            </h4>
            <ul className="space-y-3 mb-8">
              {importantLinks.map((link, index) => (
                <li key={index}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-foreground/80 hover:text-accent transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-primary-foreground/80 hover:text-accent transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* Social Media */}
            <div>
              <h5 className="font-semibold mb-4 text-accent">Follow Us</h5>
              <div className="flex gap-3">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-primary-foreground hover:text-accent hover:bg-primary-foreground/10"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-primary-foreground hover:text-accent hover:bg-primary-foreground/10"
                >
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-primary-foreground hover:text-accent hover:bg-primary-foreground/10"
                >
                  <Youtube className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-primary-foreground hover:text-accent hover:bg-primary-foreground/10"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-primary-foreground/80">
              <p>© 2024 Modern Higher Secondary School, Pottur. All rights reserved.</p>
              <p className="text-xs mt-1">
                DHSE Code: 11181 | Managed by Crescent Educational Trust
              </p>
            </div>
            <div className="flex gap-6 text-xs text-primary-foreground/80">
              <Link to="/privacy" className="hover:text-accent transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-accent transition-colors">
                Terms of Service
              </Link>
              <Link to="/sitemap" className="hover:text-accent transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import { useQuery } from '@tanstack/react-query';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { djangoAPI } from '@/lib/django-api';
import { Facebook, Instagram, Youtube, Twitter, Linkedin } from 'lucide-react';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

const platformIcons = {
    facebook: Facebook,
    instagram: Instagram,
    youtube: Youtube,
    twitter: Twitter,
    linkedin: Linkedin,
  };

const Footer = () => {
    const { data: socialLinks = [], isLoading } = useQuery<SocialLink[], Error>({
        queryKey: ['socialMediaLinks'],
        queryFn: async () => {
            // @ts-ignore
            const response = await djangoAPI.getSocialMediaLinks();
            // @ts-ignore
            return response.results;
        },
    });

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-sm text-gray-400">
              Modern Higher Secondary School, Pottur is a leading educational institution committed to providing quality education.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-gray-300">About</Link></li>
              <li><Link to="/academics" className="hover:text-gray-300">Academics</Link></li>
              <li><Link to="/admissions" className="hover:text-gray-300">Admissions</Link></li>
              <li><Link to="/contact" className="hover:text-gray-300">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="text-sm text-gray-400 space-y-2">
              <p>Mudur P.O., Vattamkulam Via, Edappal, Malappuram, Kerala - 679578</p>
              <p>Email: modernpotur@gmail.com</p>
              <p>Phone: 0494-2699645</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <div className="flex">
              <Input type="email" placeholder="Your email" className="bg-gray-700 border-gray-600 text-white" />
              <Button className="ml-2">Subscribe</Button>
            </div>
            <div className="flex space-x-4 mt-4">
                {socialLinks.map((link) => {
                    // @ts-ignore
                    const Icon = platformIcons[link.platform];
                    return (
                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                            {Icon && <Icon className="h-6 w-6" />}
                        </a>
                    );
                })}
            </div>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500 mt-8 border-t border-gray-700 pt-4">
          © {new Date().getFullYear()} Modern Higher Secondary School, Pottur. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
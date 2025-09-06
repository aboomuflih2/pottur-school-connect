import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Image, 
  Radio, 
  FileText, 
  BookOpen, 
  MessageSquare, 
  Trophy, 
  Users,
  Star,
  Mail,
  ChevronDown,
  LogOut 
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [pageManagementOpen, setPageManagementOpen] = useState(true);
  const [contentModulesOpen, setContentModulesOpen] = useState(true);
  const [submissionsOpen, setSubmissionsOpen] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const dashboardItem = { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard };
  
  const pageManagementItems = [
    { href: '/admin/banners', label: 'Homepage', icon: Image },
    { href: '/admin/about-page', label: 'About Us', icon: FileText },
  ];

  const contentModuleItems = [
    { href: '/admin/banners', label: 'Hero Slides', icon: Image },
    { href: '/admin/breaking-news', label: 'Breaking News', icon: Radio },
    { href: '/admin/testimonials', label: 'Testimonials', icon: Trophy },
    { href: '/admin/leadership', label: 'Leadership', icon: Users },
    { href: '/admin/features', label: "'Why Choose Us' Features", icon: Star },
  ];

  const submissionItems = [
    { href: '/admin/contacts', label: 'Contact Messages', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r">
        <div className="p-6">
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Modern HSS Pottur</p>
        </div>
        
        <nav className="px-4 pb-4">
          <div className="space-y-2">
            {/* Dashboard */}
            <NavLink
              to={dashboardItem.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <dashboardItem.icon className="h-4 w-4" />
              {dashboardItem.label}
            </NavLink>

            {/* Page Management */}
            <Collapsible open={pageManagementOpen} onOpenChange={setPageManagementOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4" />
                  Page Management
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${pageManagementOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 ml-4 mt-1">
                {pageManagementItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>

            {/* Content Modules */}
            <Collapsible open={contentModulesOpen} onOpenChange={setContentModulesOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4" />
                  Content Modules
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${contentModulesOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 ml-4 mt-1">
                {contentModuleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>

            {/* Submissions */}
            <Collapsible open={submissionsOpen} onOpenChange={setSubmissionsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4" />
                  Submissions
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${submissionsOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 ml-4 mt-1">
                {submissionItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </div>
          
          <div className="mt-8 pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
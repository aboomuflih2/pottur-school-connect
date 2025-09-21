import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { adminSupabase as supabase } from '@/integrations/supabase/admin-client';
import { toast } from '@/hooks/use-toast';
import { Radio, Save, Link, ExternalLink } from 'lucide-react';

interface BreakingNews {
  id: string;
  title: string;
  content: string;
  message?: string; // For backward compatibility
  link_url?: string;
  link_text?: string;
  is_external?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const BreakingNewsManager = () => {
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [isExternal, setIsExternal] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [currentActive, setCurrentActive] = useState<BreakingNews | null>(null);

  useEffect(() => {
    loadBreakingNews();
  }, []);

  // URL validation functions
  const validateUrl = (url: string, isExternal: boolean): boolean => {
    if (!url.trim()) return true; // Empty URL is valid (optional)
    
    if (isExternal) {
      return url.startsWith('http://') || url.startsWith('https://');
    } else {
      return url.startsWith('/');
    }
  };

  const sanitizeUrl = (url: string): string => {
    return url.trim().replace(/[<>"']/g, ''); // Basic XSS prevention
  };

  const loadBreakingNews = async () => {
    try {
      const { data, error } = await supabase
        .from('breaking_news')
        .select('id, title, content, message, link_url, link_text, is_external, is_active, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to include message for backward compatibility
      const mappedData = data?.map(item => ({
        ...item,
        message: item.content || item.title
      })) || [];
      
      setBreakingNews(mappedData);
      
      // Find the currently active news
      const active = mappedData?.find(item => item.is_active);
      if (active) {
        setCurrentActive(active);
        setMessage(active.message || active.content || active.title);
        setLinkUrl(active.link_url || '');
        setLinkText(active.link_text || '');
        setIsExternal(active.is_external || false);
        setIsActive(active.is_active);
      }
    } catch (error) {
      console.error('Error loading breaking news:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load breaking news',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Validate link fields
    if (linkUrl.trim() && !linkText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Link text is required when providing a link URL',
      });
      setSaving(false);
      return;
    }

    if (linkUrl.trim() && !validateUrl(linkUrl, isExternal)) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: isExternal 
          ? 'External links must start with http:// or https://' 
          : 'Internal links must start with /',
      });
      setSaving(false);
      return;
    }

    const sanitizedUrl = linkUrl.trim() ? sanitizeUrl(linkUrl) : '';
    const sanitizedText = linkText.trim() ? linkText.trim().replace(/[<>"']/g, '') : '';

    try {
      // If we have a currently active item and we're making a new one active,
      // or if we're updating the current active item
      if (isActive && currentActive) {
        // Deactivate current active news
        await supabase
          .from('breaking_news')
          .update({ is_active: false })
          .eq('id', currentActive.id);
      }

      if (currentActive && currentActive.message === message) {
        // Just update the active status of current item
        const { error } = await supabase
          .from('breaking_news')
          .update({ 
            title: message.trim(),
            content: message.trim(),
            message: message.trim(),
            link_url: sanitizedUrl || null,
            link_text: sanitizedText || null,
            is_external: isExternal,
            is_active: isActive 
          })
          .eq('id', currentActive.id);

        if (error) throw error;
      } else {
        // Create new breaking news entry
        const { error } = await supabase
          .from('breaking_news')
          .insert([{
            title: message.trim(),
            content: message.trim(),
            message: message.trim(),
            link_url: sanitizedUrl || null,
            link_text: sanitizedText || null,
            is_external: isExternal,
            is_active: isActive
          }]);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Breaking news updated successfully',
      });

      loadBreakingNews();
    } catch (error) {
      console.error('Error saving breaking news:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save breaking news',
      });
    } finally {
      setSaving(false);
    }
  };

  const activateNews = async (newsId: string) => {
    try {
      // Deactivate all breaking news
      await supabase
        .from('breaking_news')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

      // Activate the selected one
      const { error } = await supabase
        .from('breaking_news')
        .update({ is_active: true })
        .eq('id', newsId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Breaking news activated successfully',
      });

      loadBreakingNews();
    } catch (error) {
      console.error('Error activating breaking news:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to activate breaking news',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Radio className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Breaking News Manager</h1>
          <p className="text-muted-foreground">Manage the scrolling news ticker</p>
        </div>
      </div>

      {/* Current Active News Display */}
      {currentActive && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-primary animate-pulse" />
                Currently Live
              </CardTitle>
              <Badge>Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm bg-muted p-3 rounded-lg">
                {currentActive.message}
                {currentActive.link_url && currentActive.link_text && (
                  <span className="ml-2">
                    {currentActive.is_external ? (
                      <ExternalLink className="h-3 w-3 inline ml-1" />
                    ) : (
                      <Link className="h-3 w-3 inline ml-1" />
                    )}
                    <span className="text-primary underline ml-1">{currentActive.link_text}</span>
                  </span>
                )}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {new Date(currentActive.updated_at).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Update/Create Form */}
      <Card>
        <CardHeader>
          <CardTitle>Update Breaking News</CardTitle>
          <CardDescription>
            Enter the message that will scroll across the top of your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Breaking News Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your breaking news message..."
                className="min-h-[100px]"
                maxLength={500}
                required
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Keep it concise for better readability</span>
                <span>{message.length}/500 characters</span>
              </div>
            </div>

            {/* Link Management Section */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                <Label className="text-base font-medium">Optional Link</Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="link_url">Link URL</Label>
                  <Input
                    id="link_url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder={isExternal ? "https://example.com" : "/page-path"}
                    className={linkUrl.trim() && !validateUrl(linkUrl, isExternal) ? "border-red-500" : ""}
                  />
                  {linkUrl.trim() && !validateUrl(linkUrl, isExternal) && (
                    <p className="text-xs text-red-500">
                      {isExternal ? "Must start with http:// or https://" : "Must start with /"}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="link_text">Link Text</Label>
                  <Input
                    id="link_text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Read More, Learn More, etc."
                    className={linkUrl.trim() && !linkText.trim() ? "border-red-500" : ""}
                  />
                  {linkUrl.trim() && !linkText.trim() && (
                    <p className="text-xs text-red-500">Required when URL is provided</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_external"
                  checked={isExternal}
                  onCheckedChange={setIsExternal}
                />
                <Label htmlFor="is_external" className="flex items-center gap-2">
                  {isExternal ? (
                    <><ExternalLink className="h-4 w-4" /> External Link</>
                  ) : (
                    <><Link className="h-4 w-4" /> Internal Link</>
                  )}
                </Label>
              </div>
              
              <p className="text-xs text-muted-foreground">
                {isExternal 
                  ? "External links open in a new tab and must include http:// or https://"
                  : "Internal links navigate within your site and must start with /"
                }
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="is_active">Make this news active</Label>
            </div>

            <Button type="submit" disabled={saving || !message.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Breaking News'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Previous Breaking News */}
      {breakingNews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Previous Breaking News</CardTitle>
            <CardDescription>
              History of your breaking news messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {breakingNews.map((news) => (
                <div
                  key={news.id}
                  className={`p-4 rounded-lg border ${
                    news.is_active ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        {news.message}
                        {news.link_url && news.link_text && (
                          <span className="ml-2">
                            {news.is_external ? (
                              <ExternalLink className="h-3 w-3 inline ml-1" />
                            ) : (
                              <Link className="h-3 w-3 inline ml-1" />
                            )}
                            <span className="text-primary underline ml-1">{news.link_text}</span>
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">
                          Created: {new Date(news.created_at).toLocaleDateString()}
                        </span>
                        {news.updated_at !== news.created_at && (
                          <span className="text-xs text-muted-foreground">
                            Updated: {new Date(news.updated_at).toLocaleDateString()}
                          </span>
                        )}
                        {news.link_url && (
                          <span className="text-xs text-muted-foreground">
                            Link: {news.is_external ? 'External' : 'Internal'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {news.is_active ? (
                        <Badge>Active</Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => activateNews(news.id)}
                        >
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BreakingNewsManager;
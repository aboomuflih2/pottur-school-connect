import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { djangoAPI } from '@/lib/django-api';
import { useToast } from '@/hooks/use-toast';
import { Radio, Save, Link, ExternalLink } from 'lucide-react';

interface BreakingNews {
  id: string;
  title: string;
  content: string;
  link_url?: string;
  link_text?: string;
  is_external?: boolean;
  is_active: boolean;
  updated_at: string;
}

const BreakingNewsManager = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [message, setMessage] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [isExternal, setIsExternal] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [currentActive, setCurrentActive] = useState<BreakingNews | null>(null);

    const { data: breakingNews = [], isLoading } = useQuery<BreakingNews[], Error>({
        queryKey: ['breakingNews'],
        queryFn: async () => {
            // @ts-ignore
            const response = await djangoAPI.getBreakingNews();
            // @ts-ignore
            return response.results;
        },
        onSuccess: (data) => {
            const active = data.find(item => item.is_active);
            if (active) {
                setCurrentActive(active);
                setMessage(active.content);
                setLinkUrl(active.link_url || '');
                setLinkText(active.link_text || '');
                setIsExternal(active.is_external || false);
                setIsActive(active.is_active);
            }
        }
    });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['breakingNews'] });
            toast({
                title: 'Success',
                description: 'Breaking news updated successfully',
              });
        },
        onError: (error: Error) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
        },
    };

    const createMutation = useMutation({
        mutationFn: (newsData: any) => djangoAPI.createBreakingNews(newsData),
        ...mutationOptions,
    });

    const updateMutation = useMutation({
        mutationFn: (newsData: any) => djangoAPI.updateBreakingNews(currentActive!.id, newsData),
        ...mutationOptions,
    });

    const activateMutation = useMutation({
        mutationFn: async (newsId: string) => {
            // Deactivate all other news
            const updates = breakingNews.map(news => djangoAPI.updateBreakingNews(news.id, { is_active: false }));
            await Promise.all(updates);
            // Activate the selected one
            return djangoAPI.updateBreakingNews(newsId, { is_active: true });
        },
        ...mutationOptions,
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const newsData = {
            title: message.trim(),
            content: message.trim(),
            link_url: linkUrl.trim() || null,
            link_text: linkText.trim() || null,
            is_external: isExternal,
            is_active: isActive,
        };

        if (currentActive && currentActive.content === message) {
            updateMutation.mutate(newsData);
        } else {
            createMutation.mutate(newsData);
        }
      };

    if (isLoading) {
        return (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        );
      }

    // ... (JSX is the same, but onClick handlers will use mutations)
};

export default BreakingNewsManager;
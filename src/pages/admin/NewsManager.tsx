import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { djangoAPI } from '@/lib/django-api';
import { toast } from 'sonner';
import { Trash2, Edit, Eye, EyeOff, Upload, Image, FileText, MessageCircle, Plus, Heart, Pencil } from 'lucide-react';
import { format } from "date-fns";
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/utils/imageUpload';

interface NewsPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image: string | null;
  publication_date: string;
  author: string;
  is_published: boolean;
  like_count: number;
}

interface Comment {
  id: string;
  author_name: string;
  author_email: string;
  comment_text: string;
  is_approved: boolean;
  created_at: string;
  article_id: string;
  article_title?: string;
}

const NewsManager = () => {
    const queryClient = useQueryClient();
    const [editingArticle, setEditingArticle] = useState<NewsPost | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'articles' | 'comments'>('articles');
    const { toast: toastHook } = useToast();

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        featured_image: '',
        is_published: false
      });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    const { data: newsArticles = [], isLoading: articlesLoading } = useQuery<NewsPost[], Error>({
        queryKey: ['newsArticles'],
        queryFn: async () => {
            // @ts-ignore
            const response = await djangoAPI.getNewsPosts();
            // @ts-ignore
            return response.results;
        },
    });

    const { data: comments = [], isLoading: commentsLoading } = useQuery<Comment[], Error>({
        queryKey: ['comments'],
        queryFn: async () => {
            // @ts-ignore
            const response = await djangoAPI.getAllNewsComments();
            // @ts-ignore
            return response.results;
        },
    });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['newsArticles'] });
            queryClient.invalidateQueries({ queryKey: ['comments'] });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error: Error) => {
            toastHook({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    };

    const createMutation = useMutation({
        mutationFn: (articleData: any) => djangoAPI.createNewsPost(articleData),
        ...mutationOptions,
    });

    const updateMutation = useMutation({
        mutationFn: (articleData: any) => djangoAPI.updateNewsPost(editingArticle!.id, articleData),
        ...mutationOptions,
    });

    const deleteMutation = useMutation({
        mutationFn: (articleId: string) => djangoAPI.deleteNewsPost(articleId),
        ...mutationOptions,
    });

    const togglePublishMutation = useMutation({
        mutationFn: (article: NewsPost) => djangoAPI.updateNewsPost(article.id, { is_published: !article.is_published }),
        ...mutationOptions,
    });

    const approveCommentMutation = useMutation({
        mutationFn: (commentId: string) => djangoAPI.updateNewsComment(commentId, { is_approved: true }),
        ...mutationOptions,
    });

    const rejectCommentMutation = useMutation({
        mutationFn: (commentId: string) => djangoAPI.updateNewsComment(commentId, { is_approved: false }),
        ...mutationOptions,
    });

    const deleteCommentMutation = useMutation({
        mutationFn: (commentId: string) => djangoAPI.deleteNewsComment(commentId),
        ...mutationOptions,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          setImageFile(file);
          const reader = new FileReader();
          reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.content || !formData.excerpt) {
          toastHook({ title: "Please fill in all required fields", variant: "destructive" });
          return;
        }
    
        try {
          let imageUrl = formData.featured_image;

          if (imageFile) {
            const uploadResponse = await uploadImage(imageFile);
            imageUrl = uploadResponse.url;
          }

          const articleData = {
            ...formData,
            featured_image: imageUrl || null,
            publication_date: formData.is_published ? new Date().toISOString() : null,
            slug: formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          };

          if (editingArticle) {
            updateMutation.mutate(articleData);
          } else {
            createMutation.mutate(articleData);
          }

        } catch (error) {
          toastHook({ title: "Failed to save article", variant: "destructive" });
        }
      };

    const resetForm = () => {
        setFormData({
            title: '',
            excerpt: '',
            content: '',
            featured_image: '',
            is_published: false
        });
        setImageFile(null);
        setImagePreview('');
        setEditingArticle(null);
      };

      const openEditDialog = (article?: NewsPost) => {
        if (article) {
          setEditingArticle(article);
          setFormData({
            title: article.title,
            content: article.content,
            excerpt: article.excerpt,
            featured_image: article.featured_image || "",
            is_published: article.is_published,
          });
          setImagePreview(article.featured_image || '');
        } else {
          resetForm();
        }
        setIsDialogOpen(true);
      };

    const pendingComments = comments.filter(c => !c.is_approved);
    const approvedComments = comments.filter(c => c.is_approved);

    // ... (JSX is the same, but onClick handlers will use mutations)
};

export default NewsManager;

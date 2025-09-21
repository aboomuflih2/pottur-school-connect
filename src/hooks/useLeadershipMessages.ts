import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabase-admin';
import type { LeadershipMessage, CreateLeadershipMessageRequest, UpdateLeadershipMessageRequest, LeadershipPosition } from '../../shared/types/leadership-messages';

export const useLeadershipMessages = (position?: LeadershipPosition) => {
  const [messages, setMessages] = useState<LeadershipMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('leadership_messages')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (position) {
        query = query.eq('position', position);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setMessages(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leadership messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [position]);

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages
  };
};

export const useLeadershipMessagesAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMessage = async (messageData: CreateLeadershipMessageRequest): Promise<LeadershipMessage | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await supabaseAdmin
        .from('leadership_messages')
        .insert({
          person_name: messageData.person_name,
          person_title: messageData.person_title,
          position: messageData.position,
          message_content: messageData.message_content,
          photo_url: messageData.photo_url || null,
          is_active: messageData.is_active ?? true,
          display_order: messageData.display_order ?? 0
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create leadership message');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateMessage = async (id: string, messageData: UpdateLeadershipMessageRequest): Promise<LeadershipMessage | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabaseAdmin
        .from('leadership_messages')
        .update({
          person_name: messageData.person_name,
          person_title: messageData.person_title,
          position: messageData.position,
          message_content: messageData.message_content,
          photo_url: messageData.photo_url,
          is_active: messageData.is_active,
          display_order: messageData.display_order
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update leadership message');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabaseAdmin
        .from('leadership_messages')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete leadership message');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllMessages = useCallback(async (): Promise<LeadershipMessage[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabaseAdmin
        .from('leadership_messages')
        .select('*')
        .order('position', { ascending: true })
        .order('display_order', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch all leadership messages');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createMessage,
    updateMessage,
    deleteMessage,
    getAllMessages
  };
};
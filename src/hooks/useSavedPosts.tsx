
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useSavedPosts(postId: string) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if the post is saved by the current user
  const checkIfSaved = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 is the error code for "No rows returned" which is expected if the post is not saved
        console.error('Error checking saved status:', error.message);
      }
      
      setIsSaved(!!data);
    } catch (error) {
      console.error('Error checking saved status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle saved status
  const toggleSave = async () => {
    if (!user) {
      toast({
        title: 'Login necessário',
        description: 'Você precisa estar logado para salvar posts.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    try {
      if (isSaved) {
        // Unsave the post
        const { error } = await supabase
          .from('saved_posts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        setIsSaved(false);
        toast({
          title: 'Post removido',
          description: 'Post removido dos seus favoritos.'
        });
      } else {
        // Save the post
        const { error } = await supabase
          .from('saved_posts')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        
        if (error) throw error;
        
        setIsSaved(true);
        toast({
          title: 'Post salvo',
          description: 'Post adicionado aos seus favoritos.'
        });
      }
    } catch (error: any) {
      console.error('Error toggling saved status:', error.message);
      toast({
        title: 'Erro',
        description: 'Não foi possível processar sua solicitação.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Check saved status on component mount
  useEffect(() => {
    checkIfSaved();
  }, [user, postId]);

  return {
    isSaved,
    isLoading,
    isSaving,
    toggleSave
  };
}

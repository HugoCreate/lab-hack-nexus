
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}

interface CommentSectionProps {
  postId: string;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch comments for the current post
  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profile:profiles(username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error('Error fetching comments:', error.message);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os comentários.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Submit a new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Login necessário',
        description: 'Você precisa estar logado para comentar.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!newComment.trim()) {
      toast({
        title: 'Comentário vazio',
        description: 'Seu comentário não pode estar vazio.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim(),
        });
      
      if (error) throw error;
      
      setNewComment('');
      toast({
        title: 'Comentário adicionado',
        description: 'Seu comentário foi publicado com sucesso.',
      });
      
      // Refresh comments
      fetchComments();
    } catch (error: any) {
      console.error('Error submitting comment:', error.message);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar seu comentário.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load comments on component mount
  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-6 flex items-center">
        <MessageSquare className="mr-2" />
        Comentários
      </h3>
      
      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva seu comentário..."
            className="mb-3 border-cyber-purple/30 bg-cyber-dark/30"
          />
          <Button 
            type="submit" 
            className="bg-cyber-purple hover:bg-cyber-purple-dark"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Comentar'}
          </Button>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-cyber-dark/30 rounded-md border border-cyber-purple/20">
          <p className="text-sm text-muted-foreground">
            Você precisa estar <a href="/login" className="text-cyber-purple hover:underline">logado</a> para comentar.
          </p>
        </div>
      )}
      
      {/* Comments list */}
      <div className="space-y-6">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Carregando comentários...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="cyber-card p-4 border-cyber-purple/20">
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-cyber-purple/20 text-cyber-purple">
                    {comment.profile?.username.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      {comment.profile?.username || 'Usuário'}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground">Ainda não há comentários. Seja o primeiro a comentar!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;

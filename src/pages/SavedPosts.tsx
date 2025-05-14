
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BookmarkIcon } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  coverImage: string;
  category: {
    name: string;
    slug: string;
  };
  author: {
    name: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: number;
}

const SavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('saved_posts')
          .select(`
            post_id,
            posts:posts(
              id,
              title,
              content,
              slug,
              thumbnail_url,
              created_at,
              categories:categories(name, slug),
              profiles:profiles(username, avatar_url)
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        // Transform the data to match the PostCard component expectations
        const formattedPosts = data
          .filter(item => item.posts) // Filter out any null posts
          .map(item => {
            const post = item.posts as any;
            return {
              id: post.id,
              title: post.title,
              excerpt: post.content.substring(0, 150) + '...',
              slug: post.slug,
              coverImage: post.thumbnail_url || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
              category: {
                name: post.categories?.name || 'Sem categoria',
                slug: post.categories?.slug || 'sem-categoria'
              },
              author: {
                name: post.profiles?.username || 'Usuário',
                avatar: post.profiles?.avatar_url || '/placeholder.svg'
              },
              publishedAt: new Date(post.created_at).toLocaleDateString('pt-BR'),
              readTime: Math.ceil(post.content.length / 1000) // Rough estimate
            };
          });

        setSavedPosts(formattedPosts);
      } catch (error: any) {
        console.error('Error fetching saved posts:', error.message);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar seus posts salvos.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedPosts();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <BookmarkIcon className="mr-2 text-cyber-purple" />
              Posts Salvos
            </h1>
            <p className="text-muted-foreground">
              {user ? 'Sua coleção de artigos e tutoriais favoritos.' : 'Faça login para ver seus posts salvos.'}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link to="/posts">
              <Button variant="outline" className="border-cyber-purple/30">
                Ver todos os posts
              </Button>
            </Link>
          </div>
        </div>
        
        {!user ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-medium mb-4">Faça login para ver seus posts salvos</h2>
            <p className="text-muted-foreground mb-8">
              Você precisa estar logado para salvar e visualizar posts.
            </p>
            <Link to="/login">
              <Button className="bg-cyber-purple hover:bg-cyber-purple-dark">
                Fazer Login
              </Button>
            </Link>
          </div>
        ) : isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Carregando posts salvos...</p>
          </div>
        ) : savedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-medium mb-4">Nenhum post salvo</h2>
            <p className="text-muted-foreground mb-8">
              Você ainda não salvou nenhum post. Navegue pelos artigos e clique no ícone de favorito para salvá-los.
            </p>
            <Link to="/posts">
              <Button className="bg-cyber-purple hover:bg-cyber-purple-dark">
                Explorar Posts
              </Button>
            </Link>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default SavedPosts;

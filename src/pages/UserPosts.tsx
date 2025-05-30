
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Edit, Trash2, Plus, Loader2, ArrowUpFromLine, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const UserPosts = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [postToPublish, setPostToPublish]  = useState<string | null>(null);
  const [isPublishPost, setIsPublishingPost] = useState(false);
  // Redirect to login if not authenticated
  

  useEffect(() => {
    if (!user) return;
    
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id, 
            title, 
            slug, 
            published, 
            created_at,
            categories:category_id (name)
          `)
          .eq('author_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setPosts(data || []);
        setIsLoadingPosts(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast({
          title: 'Erro ao carregar posts',
          description: error.message,
          variant: 'destructive',
        });
        setIsLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [user, toast]);

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    setIsDeletingPost(true);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postToDelete);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== postToDelete));
      toast({
        title: 'Post excluído',
        description: 'O post foi excluído com sucesso.',
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Erro ao excluir post',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeletingPost(false);
      setPostToDelete(null);
    }
  };

  const handlePublishPost = async () => {
    if (postToPublish) {

      setIsPublishingPost(true);
      try {
        const { error } = await supabase
          .from('posts')
          .update({published: true})
          .eq('id', postToPublish);

        if (error) throw error;

        toast({
          title: 'Post Publicado',
          description: 'O post foi publicado com sucesso.',
        });
      } catch (error) {
        console.error('Error publishing post:', error);
        toast({
          title: 'Erro ao publicar o post',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsPublishingPost(false)
        setPostToPublish(null);
      }
    } else return 
  }

  if (!isLoading && !user) {
      return <Navigate to="/login" />;
  } else {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-12 flex-grow">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold mb-1">Meus Posts</h1>
                <p className="text-muted-foreground">
                  Gerencie seus posts e rascunhos
                </p>
              </div>
              
              <Link to="/create-post">
                <Button className="bg-cyber-purple hover:bg-cyber-purple-dark">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Post
                </Button>
              </Link>
            </div>
            
            {isLoadingPosts ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyber-purple" />
              </div>
            ) : posts.length > 0 ? (
              <div className="cyber-card p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead className="hidden md:table-cell">Categoria</TableHead>
                      <TableHead className="hidden md:table-cell">Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {post.categories?.name || "Sem categoria"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(post.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {post.published ? (
                            <Badge className="bg-green-500">Publicado</Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-500 border-amber-500">
                              Rascunho
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-red-500">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertCircle className="h-6 w-6 text-red-500 mb-2" />
                                  <AlertDialogTitle>Excluir post</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir "{post.title}"? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      setPostToDelete(post.id);
                                      handleDeletePost();
                                    }}
                                    disabled={isDeletingPost}
                                    className="bg-red-500 text-white hover:bg-red-600"
                                  >
                                    {isDeletingPost && postToDelete === post.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          <div className="flex justify-end gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant='ghost' size='icon'>
                                  <ArrowUpFromLine className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertTriangle className="h-6 w-6 text-yellow-500 mb-2" />
                                  <AlertDialogTitle>Publicar post</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Está pronto para publicar "{post.title}"? Não será possível edita-lo depois de publicado.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      setPostToPublish(post.id);
                                      handlePublishPost();
                                    }}
                                    disabled={isPublishPost}
                                    className="bg-yellow-500 text-white hover:bg-yellow-600"
                                  >
                                    {isPublishPost && postToPublish === post.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    Publicar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="cyber-card p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Você ainda não criou nenhum post.
                </p>
                <Link to="/create-post">
                  <Button className="bg-cyber-purple hover:bg-cyber-purple-dark">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar meu primeiro post
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

};

export default UserPosts;

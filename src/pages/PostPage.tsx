import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, BookmarkIcon, MessageCircle } from 'lucide-react';
import CommentSection from '@/components/CommentSection';
import SharePost from '@/components/SharePost';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTitle } from '@/hooks/use-title';
import { Post } from './Posts/types';


const PostPage = () => {
  useTitle()
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<Error>(null)
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
    //Carrega todos os posts
    useEffect(() => {
      const fetchPost = async () => {
        try {
          setIsLoading(true);
          
          const { data, error } = await supabase
            .from('posts')
            .select(`
              *,
              author:profiles(*),
              category: categories(*)  
            `)
            .eq('slug', slug)
            .eq('published', true)
            .single()
          
          if(error) throw error
          if(!data) {
            console.log('Post não encontrado')
            return;
          }

          setPost(data)
        } catch(error) {
          console.error('Error at loading post: ', error);
          setError(error.message)
          toast({
              title: 'Erro ao carregar post',
              description: error.message,
              variant: 'destructive'
          })
        } finally {
          setIsLoading(false)
        }
      };
      fetchPost();
    }, [slug]) 
  
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex-grow">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Carregando post...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex-grow">
          <div className="text-center py-16">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Post não encontrado</h1>
            <p className="text-muted-foreground mb-8">
              O post que você está procurando não existe ou foi removido.
            </p>
            <Link to="/posts">
              <Button className="bg-cyber-purple hover:bg-cyber-purple-dark">
                Ver todos os posts
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  } 
  const currentUrl = window.location.href;

  return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <div className="relative h-[400px] md:h-[500px] overflow-hidden">
          {/* Thumbnail Image */}
          { post.thumbnail_url && (
            <img 
              src={post.thumbnail_url} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-b from-cyber-black/70 to-cyber-black/30"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="container mx-auto">
              <Link 
                to={`/category/${post.category.slug}`}
                className="inline-block mb-4"
              >
                <Badge className="bg-cyber-purple/80 hover:bg-cyber-purple">
                  {post.category.name}
                </Badge>
              </Link>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 max-w-4xl">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={post.author.avatarUrl} alt={post.author.username} />
                    <AvatarFallback>{post.author.username[0]}</AvatarFallback>
                  </Avatar>
                  <span>{post.author.username}</span>
                </div>
                
                

              </div>
            </div>
          </div>
        </div>
        
        <main className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-3/4">
              <div className="cyber-card p-6 md:p-8">
                <div 
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content || post.content }}
                />
              </div>
            
              
              {/* Author bio */}
              <div className="mt-8 cyber-card p-6">
                <div className="flex items-center">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={post.author.avatarUrl} alt={post.author.username} />
                    <AvatarFallback className="bg-cyber-purple/20 text-cyber-purple text-xl">
                      {post.author.username.charAt(0).toUpperCase()}{post.author.username.charAt(1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">
                      {post.author.username}
                      </h3>
                    <p className="text-muted-foreground text-sm">
                      {/* TODO: Adicionar bio do autor do post */}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Comments Section */}
              <CommentSection postId={post.id} />
            </div>
            
            <div className="md:w-1/4">
              <div className="sticky top-24 space-y-6">
                {/* Post actions */}
                <div className="cyber-card p-6">
                  <div className="flex flex-col space-y-4">
                    {/* <Button 
                      variant="outline" 
                      className={`w-full ${isSaved ? 'bg-cyber-purple/20 border-cyber-purple' : 'border-cyber-purple/30 hover:bg-cyber-purple/10'} flex items-center justify-center`}
                      onClick={handleSaveClick}
                      disabled={isSavedLoading || isSaving}
                    >
                      <BookmarkIcon className="mr-2 h-4 w-4" />
                      {isSaved ? 'Salvo' : 'Salvar'}
                    </Button> */}
                    
                    <SharePost postTitle={post.title} postUrl={currentUrl} />
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-cyber-purple/30 hover:bg-cyber-purple/10 flex items-center justify-center"
                      onClick={() => document.querySelector('#comments')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Comentar
                    </Button>
                  </div>
                </div>
                
              
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  };

export default PostPage;

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import CategoryCard from '@/components/CategoryCard';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Post } from './Posts/types';
import { useTitle } from '@/hooks/use-title';

// Função auxiliar para determinar o ícone com base no slug
const getCategoryIcon = (slug: string): 'code' | 'terminal' | 'wifi' | 'cpu' | 'fileCode' => {
  const iconMapping: Record<string, 'code' | 'terminal' | 'wifi' | 'cpu' | 'fileCode'> = {
    'web-app-hacking': 'code',
    'introducao-hacking': 'terminal',
    'linux': 'terminal',
    'redes': 'wifi',
    'hardware-hacking': 'cpu',
    'mobile-hacking': 'code',
    'forense-digital': 'fileCode',
    'engenharia-social': 'code'
  };
  
  return iconMapping[slug] || 'code';
};

// Função para buscar categorias do Supabase
const fetchCategories = async (limit = 3) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
    .limit(limit);
  
  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  
  // Mapear os dados para incluir a propriedade icon
  return data.map(category => ({
    ...category,
    icon: getCategoryIcon(category.slug)
  }));
};

const Index = () => {
  useTitle();
  const [allPosts, setAllPosts] = useState([])  
  // Função para buscar posts do Supabase
  const fetchPosts = async () => {
    try {
      // Primeiro, buscamos os posts básicos
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          categories:category_id (name, slug)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw postsError;
      }
      setAllPosts(postsData)
      // Para cada post, buscamos informações do autor separadamente
      const postsWithAuthors = await Promise.all(postsData.map(async (post) => {
        // Buscar informações do autor
        const { data: authorData } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', post.author_id)
          .single();
        
        // Usar valores padrão se não encontrar o autor
        const author = authorData || {
          username: 'Autor desconhecido',
          avatar_url: '/placeholder.svg'
        };
        
        return {
          id: post.id,
          title: post.title,
          excerpt: post.content ? post.content.substring(0, 150) + '...' : '',
          slug: post.slug,
          coverImage: post.thumbnail_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
          category: {
            name: post.categories?.name || 'Sem categoria',
            slug: post.categories?.slug || ''
          },
          author: {
            name: author.username,
            avatar: author.avatar_url
          },
          publishedAt: new Date(post.created_at).toLocaleDateString('pt-BR'),
          readTime: Math.ceil(post.content?.length / 1000) || 5
        };
      }));
      
      
      return postsWithAuthors;
    } catch (error) {
      console.error('Error processing posts:', error);
      return [];
    }
  };
  // Buscar categorias do Supabase
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['home-categories'],
    queryFn: () => fetchCategories(3),
  });
  
  // Buscar posts do Supabase
  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['home-posts'],
    queryFn: fetchPosts,
  });

  // Primeiros 3 posts para destaque
  const featuredPosts = posts.slice(0, 3);
  
  // Posts restantes para seção "Recentes"
  const recentPosts = posts.slice(3, 5);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        
        {/* Categories Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Categorias <span className="text-cyber-purple">Especializadas</span>
                </h2>
                <p className="text-muted-foreground">
                  Explore nosso conteúdo organizado por áreas do conhecimento
                </p>
              </div>
              <Link to="/categories" className="mt-4 md:mt-0">
                <Button variant="outline" className="border-cyber-purple/30">
                  Ver todas categorias <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {loadingCategories ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando categorias...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.slice(0, 3).map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* Featured Posts */}
        <section className="py-16 bg-cyber-dark cyber-grid">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Posts <span className="text-cyber-blue">Em Destaque</span>
                </h2>
                <p className="text-muted-foreground">
                  Confira os conteúdo adicionados mais recentemente em nossa Wiki.
                </p>
              </div>
              <Link to="/posts" className="mt-4 md:mt-0">
                <Button variant="outline" className="border-cyber-purple/30">
                  Ver todos posts <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {loadingPosts ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando posts...</p>
              </div>
            ) : featuredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium mb-2">Nenhum post encontrado</h3>
                <p className="text-muted-foreground">
                  Estamos trabalhando para adicionar conteúdo em breve.
                </p>
              </div>
            )}
          </div>
        </section>
        
        {/* Recent Posts - Mostrado apenas se houver posts após os 3 primeiros */}
        {recentPosts.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center justify-between mb-10">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    Publicações <span className="text-cyber-purple">Recentes</span>
                  </h2>
                  <p className="text-muted-foreground">
                    Últimos conteúdos adicionados à nossa plataforma
                  </p>
                </div>
                <Link to="/posts" className="mt-4 md:mt-0">
                  <Button variant="outline" className="border-cyber-purple/30">
                    Ver mais posts <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </section>
        )}
        
        {/* CTA Section */}
        <section className="py-16 bg-cyber-dark relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full cyber-grid opacity-20"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyber-purple/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyber-blue/20 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-block rounded bg-cyber-purple/10 px-3 py-1 text-sm font-medium text-cyber-purple-light mb-4 font-mono">
                $ sudo join_community.sh
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Faça parte da comunidade <span className="text-cyber-purple">Lab Hack</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Junte-se a outros entusiastas e profissionais de segurança cibernética. Compartilhe conhecimento, aprenda novas técnicas e cresça em sua jornada no hacking ético.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-cyber-purple hover:bg-cyber-purple-dark">
                    Criar uma conta
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-cyber-purple/30">
                    Já tenho uma conta
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;

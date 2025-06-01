
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category, Post } from './Posts/types';
import { useTitle } from '@/hooks/use-title';
import { Badge } from '@/components/ui/badge';
import Posts from './Posts';

// // Mock category data
// const categories = {
//   'web-app-hacking': {
//     name: 'Web App Hacking',
//     description: 'Aprenda a encontrar e explorar vulnerabilidades em aplicações web como SQL Injection, XSS e CSRF.',
//     icon: <Code className="h-8 w-8 text-cyber-purple" />,
//     color: 'from-cyber-purple to-cyber-blue'
//   },
//   'introducao-hacking': {
//     name: 'Introdução a Hacking',
//     description: 'Comece sua jornada no mundo da segurança cibernética com conceitos básicos e fundamentos importantes.',
//     icon: <Terminal className="h-8 w-8 text-cyber-purple" />,
//     color: 'from-cyber-purple to-cyber-purple-light'
//   },
//   'linux': {
//     name: 'Linux',
//     description: 'Domine o sistema operacional preferido dos hackers, desde comandos básicos até configurações avançadas.',
//     icon: <Terminal className="h-8 w-8 text-cyber-purple" />,
//     color: 'from-cyber-purple to-cyber-yellow'
//   },
//   'redes': {
//     name: 'Redes',
//     description: 'Entenda como as redes funcionam, desde protocolos fundamentais até técnicas de análise de tráfego.',
//     icon: <Wifi className="h-8 w-8 text-cyber-purple" />,
//     color: 'from-cyber-blue to-cyber-purple'
//   },
//   'hardware-hacking': {
//     name: 'Hardware Hacking',
//     description: 'Explore a segurança de dispositivos físicos, IoT e técnicas de engenharia reversa de hardware.',
//     icon: <Cpu className="h-8 w-8 text-cyber-purple" />,
//     color: 'from-cyber-purple-dark to-cyber-purple'
//   }
// };

const CategoryPage = () => {
  useTitle();
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category|null>(null);
  const [posts, setPosts] = useState([]) 
  
  const fetchCategory = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    setCategory(data)
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('category_id', category.id)

      
    if (error) {
      console.log('Error fetching pages: ', error);
      throw error;
    }

    setPosts(data)
  }
  
  const {isLoading: isLoadingCategory, error: errorLoadingCategory} = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategory,
  });

  const {isLoading: isLoadingPosts, error: errorLoadingPosts} = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })
  

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          {isLoadingCategory && (
          <div className="text-center">
              <p className='text-muted-foreground'>Carregando categoria...</p>
          </div>
          )}
          {(!isLoadingCategory && !category) && (
          <div className="text-center py-16">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Categoria não encontrada</h1>
            <p className="text-muted-foreground mb-8">
              A categoria que você está procurando não existe ou foi removida.
            </p>
            <Link to="/categories">
              <Button className="bg-cyber-purple hover:bg-cyber-purple-dark">
                Ver todas categorias
              </Button>
            </Link>
          </div>
          )}
          {(!isLoadingCategory && category) && (
          <div className="max-w-3x1 max-auto mb-12">
            <h2 className='text-center md:text-left text-3xl font-bold mb-4 text-cyber-purple'>
              Categoria
            </h2>
            <div className="container mx-auto px-4">
                {/* TODO: Adicionar string de icone a tabela category 
                <div className="bg-cyber-black/50 p-6 rounded-lg border border-cyber-purple/20 backdrop-blur-sm">
                  {category.icon}
                </div> */}
                
                <div className="text-center md:text-left">
                  <h1 className="text-justify text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r bg-clip-text">
                    {category.name}
                  </h1>
                  <div className='flex flex-col items-center content-center'>
                    <span className="text-lg text-muted-foreground py-4">
                      {category.description}.
                    </span>
                    <Badge className='self-end cursor-default'>
                      {/* TODO: Adicionar cor customizada a badge variant custom */}
                      {category.slug}
                    </Badge>
                  </div>  
                </div>
            </div>
            <main className="container mx-auto px-4 py-16 flex-grow">
              <div className="mb-2 flex flex-col md:flex-row justify-between items-center">
                <h2 className="text-2xl font-bold mb-4 md:mb-0">
                  Posts em <span className="text-cyber-purple">{category.name}</span>
                </h2>
                
                <div className="flex items-center space-x-2">
                  <Link to="/posts">
                    <Button variant="outline" className="border-cyber-purple/30">
                      Todos os posts
                    </Button>
                  </Link>
                  <Link to="/categories">
                    <Button variant="outline" className="border-cyber-purple/30">
                      Categorias
                    </Button>
                  </Link>
                </div>
              </div>
              { isLoadingPosts && (
              <div className="text-center">
                  <p className='text-muted-foreground'>Carregando posts...</p>
              </div>  
              )}
              
              { (!isLoadingPosts && posts.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 rounded p-4 bg-black/30">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              )} 
              { (!isLoadingPosts && posts.length == 0) && (
                <div className="text-center py-16">
                  <h3 className="text-xl font-medium mb-2">Nenhum post encontrado</h3>
                  <p className="text-muted-foreground mb-8">
                    Ainda não existem posts nesta categoria. Seja o primeiro a contribuir!
                  </p>
                  <Link to="/posts">
                    <Button className="bg-cyber-purple hover:bg-cyber-purple-dark">
                      Ver todos os posts
                    </Button>
                  </Link>
                </div>
              )}
            </main>
          </div>
          )}
          
        </div>
      </main>
      <Footer />
    </div>
  );
  
  
  // const posts = categoryPosts[slug as keyof typeof categoryPosts] || [];
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="bg-cyber-dark py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* <div className="bg-cyber-black/50 p-6 rounded-lg border border-cyber-purple/20 backdrop-blur-sm">
              {category.icon}
            </div> */}
            
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent">
                {category.name}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                {category.description}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      
      
      <Footer />
    </div>
  );
};

export default CategoryPage;

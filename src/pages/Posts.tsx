
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostCard from '@/components/PostCard';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Função para buscar posts do Supabase
const fetchPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories:category_id (name, slug),
      profiles:author_id (username, avatar_url)
    `)
    .eq('published', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
  
  // Mapear os dados para o formato necessário para o PostCard
  return data.map(post => ({
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
      name: post.profiles?.username || 'Autor desconhecido',
      avatar: post.profiles?.avatar_url || '/placeholder.svg'
    },
    publishedAt: new Date(post.created_at).toLocaleDateString('pt-BR'),
    readTime: Math.ceil(post.content?.length / 1000) || 5 // Estimativa simples: 1000 caracteres = 1 minuto de leitura
  }));
};

// Função para buscar categorias do Supabase
const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('name, slug')
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  
  return data;
};

const Posts = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('recent');

  // Buscar posts e categorias do Supabase
  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });
  
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['post-categories'],
    queryFn: fetchCategories,
  });
  
  // Filtrar e ordenar posts
  const filteredPosts = React.useMemo(() => {
    let result = [...posts];
    
    // Filtrar por pesquisa
    if (searchQuery) {
      result = result.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      result = result.filter(post => post.category.slug === selectedCategory);
    }
    
    // Ordenar resultados
    if (sortBy === 'recent') {
      // Já ordenado por created_at descendente
    } else if (sortBy === 'oldest') {
      result = [...result].reverse();
    } else if (sortBy === 'readTime') {
      result = [...result].sort((a, b) => a.readTime - b.readTime);
    }
    
    return result;
  }, [posts, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Posts e <span className="text-cyber-purple">Tutoriais</span>
            </h1>
            <p className="text-muted-foreground">
              Artigos, guias e tutoriais sobre hacking ético e segurança da informação
            </p>
          </div>
          
          {/* Filters */}
          <div className="bg-cyber-dark p-6 rounded-lg mb-10 border border-cyber-purple/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar posts..."
                  className="pl-10 border-cyber-purple/20 focus:border-cyber-purple"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
                disabled={loadingCategories}
              >
                <SelectTrigger className="border-cyber-purple/20">
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-cyber-purple/20">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                  <SelectItem value="oldest">Mais antigos</SelectItem>
                  <SelectItem value="readTime">Tempo de leitura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedCategory !== 'all' && (
              <div className="mt-4 flex items-center">
                <span className="text-sm text-muted-foreground mr-2">Filtros ativos:</span>
                <Badge 
                  variant="outline" 
                  className="border-cyber-purple/30 text-cyber-purple flex items-center"
                >
                  {categories.find(c => c.slug === selectedCategory)?.name}
                  <button 
                    className="ml-1 hover:text-white" 
                    onClick={() => setSelectedCategory('all')}
                  >
                    ×
                  </button>
                </Badge>
              </div>
            )}
          </div>
          
          {/* Posts Grid */}
          {loadingPosts ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Carregando posts...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">Nenhum post encontrado</h3>
              <p className="text-muted-foreground">
                Tente buscar com outros termos ou remover alguns filtros
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Posts;

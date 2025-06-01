import React, {useState, useEffect, useMemo} from 'react';
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
import { Search, Variable } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useTitle } from '@/hooks/use-title';

const Posts = () => {
  useTitle()
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [allCategories, setAllCategories] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [allPosts, setAllPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([]);
  
  //Carrega todos os posts
  const fetchPosts = async () => {
      try {
        const {data, error} = await supabase
          .from('posts')
          .select(`
            *,
            author:profiles(*),
            categories(name, slug)  
          `)
          .eq('published', true)
          .order('created_at', {ascending: false})
          
        if (error) throw error

        setAllPosts(data || []);
        setFilteredPosts(data || [])
        return data;
      } catch (error) {
        console.error('Error selecting posts: ', error);
        toast({
          title: 'Erro ao listar posts',
          description: error.message,
          variant: 'destructive'
        })
        return [];
      }
  }
  const fetchCategories = async () => {
    try {
      const {data, error} = await supabase
        .from('categories')
        .select('*')

      if (error) throw error 

      setAllCategories(data || [])
      return data;
    } catch (error) {
      console.error('Error fetching categories: ', error);
      toast({
        title: 'Erro ao listar categorias',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const {data: posts = [], isLoading: isLoadingPosts} = useQuery({
    queryKey: ['postsList-posts'],
    queryFn: fetchPosts,
  })

  const {data: categories = [], isLoading: isLoadingCategories} = useQuery({
    queryKey: ['postList-categories'],
    queryFn: fetchCategories,
  })

  // Filtra a lista de posts baseado nos filtros
  useEffect(() => {
    let result = [...allPosts];

    // Filtro por busca textual
    try {
      //TODO: Corrigir busca por texto
      result = result.filter(post => 
        (post.title?.trim().toLowerCase() || '').includes(searchQuery.toLowerCase().trim()) ||
        (post.content?.trim().toLowerCase() || '').includes(searchQuery.toLowerCase().trim())
      );
    } catch (error) {
      console.error('Error at querying search text: ', error);
      toast({
        title: 'Erro ao buscar post por texto',
        description: error.message,
        variant: 'destructive'  
      })
    }

    
    try {
      // Filtro por categoria
      if (selectedSlug !== 'all') {
        result = result.filter(post => post.categories?.slug === selectedSlug);
      } else {
        result = [...allPosts]
      }
    } catch (error) {
      console.error('Error at querying post category: ', error);
      toast({
        title: 'Erro ao buscar post por categoria',
        description: error.message,
        variant: 'destructive'  
      })
    }
    
    try {
      // Ordenação dos resultados
      if (sortBy === 'recent') // Já ordenado por created_at descendente
        result = [...result]
      else if (sortBy === 'oldest')// Portanto é só inverter
        result = [...result].reverse();
      
    } catch (error) {
      console.error('Error at sorting posts: ', error);
      toast({
        title: 'Erro ao ordenar posts',
        description: error.message,
        variant: 'destructive'  
      })
    }
    
    
    setFilteredPosts(result);
  }, [searchQuery, selectedSlug, sortBy, allPosts]);

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
                  disabled
                  placeholder="Pesquisar posts..."
                  className="pl-10 border-cyber-purple/20 focus:border-cyber-purple"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select 
                value={selectedSlug} 
                onValueChange={(e) => setSelectedSlug(e)}
                disabled={isLoadingCategories}
              >
                <SelectTrigger className="border-cyber-purple/20">
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  {allCategories.map((category) => (
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
            
            {selectedSlug !== 'all' && (
              <div className="mt-4 flex items-center">
                <span className="text-sm text-muted-foreground mr-2">Filtros ativos:</span>
                <Badge 
                  variant="disabled" 
                  className="border-cyber-purple/30 text-cyber-purple flex items-center"
                >
                  {allCategories.find(c => c.slug == selectedSlug)?.name}
                  <button 
                    className="ml-1 hover:text-white" 
                    onClick={() => setSelectedSlug('all')}
                  >
                    ×
                  </button>
                </Badge>
              </div>
            )}
          </div>
          
          {/* Posts Grid */}
          {isLoadingPosts ? (
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

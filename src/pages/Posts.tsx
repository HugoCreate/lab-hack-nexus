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

const Posts = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [allPosts, setAllPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  // Extract unique categories
  // const categories = [...new Set(allPosts.map(post => post.category.name))].map(name => {
  //   const post = allPosts.find(p => p.category.name === name);
  //   return { name, slug: post?.category.slug || '' };
  // });

  // const categories = useMemo(() => {
  //   const uniqueCategories = allPosts.reduce((acc, post) => {
  //     if(!post?.category?.slug || !post?.category?.name) return acc;
      
  //     if(!acc.some(category => category.slug === post.category.slug)) {
  //       acc.push({
  //         name: post.category.name,
  //         slug: post.category.slug
  //       })
  //     }
  //     return acc;
  //   }, [] as {name: string, slug: string}[]);
  //   return [{ name: "Todas Categorias", slug:"all"}, ...uniqueCategories]
  // }, [allPosts])

  //Carrega todos os posts
  const fetchPosts = async () => {
      try {
        const {data, error} = await supabase
          .from('posts')
          .select(`
            *,
            author:profiles(*)
            category:categories(*)  
          `)
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
        .order('created_at', {ascending: false})

      if (error) throw error 
      setAllCategories(data)
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
    if (searchQuery) {
      result = result.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filtro por categoria
    if (selectedCategory !== 'all') {
      result = result.filter(post => post.category.slug === selectedCategory);
    }
    
    // Ordenação dos resultados
    if (sortBy === 'recent') {
      // Já ordenado por created_at descendente
      // result = [...result]
    } else if (sortBy === 'oldest') { // Portanto é só inverter
      result = [...result].reverse();
    } 
    
    setFilteredPosts(result);
  }, [searchQuery, selectedCategory, sortBy, allPosts]);

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
                disabled={isLoadingCategories}
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
                  variant="disabled" 
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


import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTitle } from '@/hooks/use-title';

// Dicionário de Icones para cada Slug
// TODO: Colocar os icone-slug no banco de dados
const iconMapping: Record<string, 'code' | 'terminal' | 'library' | 'wifi' | 'cpu' | 'fileCode'> = {
  'web-app-hacking': 'code',
  'introducao-hacking': 'library',
  'linux': 'terminal',
  'redes': 'wifi',
  'hardware-hacking': 'cpu',
  'mobile-hacking': 'code',
  'forense-digital': 'fileCode',
  'engenharia-social': 'code'
};

// Função para buscar categorias do Supabase
const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', {ascending: false});
  
  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  
  // Mapear os dados para incluir a propriedade icon
  return data.map(category => ({
    ...category,
    icon: iconMapping[category.slug] || 'code'
  }));
};


const Categories = () => {
  useTitle();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Buscar categorias do Supabase
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
  
  // Filtrar categorias com base na pesquisa
  const filteredCategories = React.useMemo(() => {
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Explore por <span className="text-cyber-purple">Categoria</span>
            </h1>
            <p className="text-muted-foreground mb-8">
              Descubra conteúdo especializado organizado por áreas de conhecimento em hacking e cibersegurança
            </p>
            
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar categorias..."
                className="pl-10 bg-cyber-dark border-cyber-purple/20 focus:border-cyber-purple focus:ring-cyber-purple"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Carregando categorias...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">Erro ao carregar categorias</h3>
              <p className="text-muted-foreground">
                Ocorreu um erro ao buscar as categorias. Tente novamente mais tarde.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
          
          {!isLoading && !error && filteredCategories.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">Nenhuma categoria encontrada</h3>
              <p className="text-muted-foreground">
                Tente buscar com outros termos ou entre em contato para sugerir uma nova categoria
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Categories;

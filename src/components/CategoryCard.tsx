
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from './ui/badge';
import { Code, Terminal, Wifi, Cpu, FileCode, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: 'code' | 'terminal' | 'wifi' | 'cpu' | 'fileCode';
};

const iconMap = {
  code: Code,
  terminal: Terminal,
  wifi: Wifi,
  cpu: Cpu,
  fileCode: FileCode
};

interface CategoryCardProps {
  category: Category;
}

// Função para buscar a contagem de posts por categoria
const fetchPostCount = async (categorySlug: string): Promise<number> => {
  try {
    // Verificamos se o slug é "web-app-hacking" (nossa única categoria com posts reais)
    if (categorySlug === "web-app-hacking") {
      const { data, error, count } = await supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .eq('category_id', (await supabase.from('categories').select('id').eq('slug', categorySlug).single()).data?.id);
      
      if (error) {
        console.error('Error fetching post count:', error);
        return 0;
      }
      
      return count || 0;
    }
    
    // Para outras categorias, retornamos 0 pois não há posts
    return 0;
  } catch (error) {
    console.error('Error fetching post count:', error);
    return 0;
  }
};

const CategoryCard = ({ category }: CategoryCardProps) => {
  const IconComponent = iconMap[category.icon];

  // Buscar a contagem de posts para esta categoria
  const { data: postsCount = 0, isLoading } = useQuery({
    queryKey: ['category-post-count', category.slug],
    queryFn: () => fetchPostCount(category.slug)
  });

  return (
    <Link 
      to={`/category/${category.slug}`} 
      className="relative group"
    >
      <div className="cyber-card p-6 h-full transition-all duration-300 group-hover:border-cyber-purple/50 group-hover:shadow-cyber-purple/20">
        <div className="flex justify-between items-start">
          <div className="bg-cyber-purple/10 p-3 rounded-md">
            <IconComponent className="h-6 w-6 text-cyber-purple" />
          </div>
          <Badge variant="outline" className="border-cyber-blue/30 text-cyber-blue">
            {isLoading ? '...' : `${postsCount} posts`}
          </Badge>
        </div>
        
        <h3 className="mt-4 text-lg font-medium text-foreground">{category.name}</h3>
        
        <p className="mt-2 text-muted-foreground text-sm line-clamp-3">
          {category.description}
        </p>
        
        <div className="mt-4 flex items-center text-cyber-purple opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-sm">Explorar</span>
          <ChevronRight className="ml-1 h-4 w-4" />
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;

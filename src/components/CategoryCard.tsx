
import React, { useEffect, useState } from 'react';
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
  //Define se não há nenhum post para essa cateogria
  const [isEmpty, setIsEmpty] = useState((postsCount <= 0));

  useEffect(() => {
    setIsEmpty(postsCount <= 0);
  },[postsCount])

  return (    
    <Link 
      to={isEmpty ? null : `/category/${category.slug}`} 
      className={"relative group" + (isEmpty ? " cursor-default" : " ")}
    >
        <div className={`
          cyber-card p-6 h-full 
          transition-all duration-300 
          ${isEmpty ? null : "group-hover:border-cyber-blue" }`
          }>
          <div className="flex justify-between items-start">
            <div className="bg-black/25 p-3 rounded-md">
              <IconComponent className="h-6 w-6 text-cyber-purple-dark" />
            </div>
            
            <Badge 
              variant={isEmpty ? "outline" : "default"} 
              className={
                isEmpty 
                  ? "border-cyber-black/20 text-cyber-dark/90 bg-cyber-black/40" 
                  : "border-cyber-purple/50 text-cyber-purple/90 bg-cyber-purple-light/10 "}>
              {isLoading ? '...' : `${postsCount} posts`}
            </Badge>
             
          </div>
          
          <h3 className="mt-4 text-lg font-medium text-cyber-dark">
            {category.name}
          </h3>
          
          <p className="mt-2 text-muted-foreground text-sm line-clamp-3">
            {category.description}
          </p>
          <div className="mt-4 flex items-center text-cyber-blue-10 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isEmpty && (
          <>
            <span className="text-sm">Explorar</span>
            <ChevronRight className="ml-1 h-4 w-4" />
          </>
          )}
          </div>
      </div>
    </Link>   
  );
};

export default CategoryCard;


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
          border-4
          ${!isEmpty && "group-hover:border-cyber-purple" }`
          }>
          <div className={`
            flex justify-between items-start`}>
            <div 
              className={`
              p-3 rounded-md
              transition-colors
              duration-700
              text-primary-foreground/75
              ${isEmpty 
              ? `
                bg-black/25 
                  text-secondary
                ` 
              : `
                  bg-primary/10 
                  hover:bg-primary/60
                  hover:text-foreground/60
                  `}
              `}>
              <IconComponent 
                className={`h-6 w-6`} />
            </div>
            
            <Badge 
              variant={isEmpty ? "disabled" : "primary"} >
              {isLoading ? '...' : `${postsCount} posts`}
            </Badge>
      
          </div>
          
          <h3 className={`
            mt-4 text-lg font-bold 
            ${isEmpty ?  'text-foreground/30' : 'text-foreground'}
            ${!isEmpty && 'group-hover:text-primary'}
            transition-colors
            `}>
            {category.name}
          </h3>
          
          <p className={`
            mt-2 text-sm line-clamp-3
            ${isEmpty && 'text-cyber-purple-dark/30'}
            ${!isEmpty && 'text-muted-foreground group-hover:text-foreground'}
            transition-colors`}>
            {category.description}
          </p>
          <div className={`
            mt-4 flex items-center justify-end 
            font-bold
            text-cyber-purple/90 
            opacity-0 
            group-hover:opacity-100 
            hover:text-cyber-purple/60
            transition-all
            duration-300
            `}>
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


import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from './ui/badge';
import { Code, Terminal, Wifi, Cpu, FileCode, ChevronRight } from 'lucide-react';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  postsCount: number;
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

const CategoryCard = ({ category }: CategoryCardProps) => {
  const IconComponent = iconMap[category.icon];

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
            {category.postsCount} posts
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

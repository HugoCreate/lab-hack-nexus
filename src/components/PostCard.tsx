
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from './ui/badge';
import { Calendar } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    excerpt: string;
    slug: string;
    coverImage: string;
    category: {
      name: string;
      slug: string;
    };
    author: {
      name: string;
      avatar: string;
    };
    publishedAt: string;
    readTime: number;
  };
}

const PostCard = ({ post }: PostCardProps) => {
  const { theme } = useTheme();
  
  return (
    <div className="group h-full">
      <Link to={`/post/${post.slug}`} className="block h-full">
        <div className={`h-full overflow-hidden flex flex-col transition-all duration-300 border rounded-lg ${
          theme === 'light' 
            ? 'bg-white border-gray-200 shadow-sm hover:border-primary/50 hover:shadow-md' 
            : 'cyber-card group-hover:border-cyber-purple/50 group-hover:shadow-cyber-purple/20'
        }`}>
          <div className="relative h-48 overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className={`absolute inset-0 ${
              theme === 'light' 
                ? 'bg-gradient-to-t from-gray-900/70 to-transparent' 
                : 'bg-gradient-to-t from-cyber-black/80 to-transparent'
            }`} />
            <div className="absolute bottom-3 left-3 z-10">
              <Link 
                to={`/category/${post.category.slug}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Badge className={`${
                  theme === 'light' 
                    ? 'bg-primary hover:bg-primary/90' 
                    : 'bg-cyber-purple/80 hover:bg-cyber-purple'
                }`}>
                  {post.category.name}
                </Badge>
              </Link>
            </div>
          </div>
          
          <div className={`p-5 flex flex-col flex-grow ${
            theme === 'light' ? 'text-foreground' : ''
          }`}>
            <h3 className={`text-lg font-medium mb-2 line-clamp-2 transition-colors ${
              theme === 'light' 
                ? 'text-gray-800 group-hover:text-primary' 
                : 'group-hover:text-cyber-purple'
            }`}>
              {post.title}
            </h3>
            
            <p className={`text-sm line-clamp-3 mb-4 flex-grow ${
              theme === 'light' ? 'text-gray-600' : 'text-muted-foreground'
            }`}>
              {post.excerpt}
            </p>
            
            <div className={`flex items-center justify-between pt-4 ${
              theme === 'light' ? 'border-t border-gray-200' : 'border-t border-cyber-purple/10'
            }`}>
              <div className="flex items-center space-x-2">
                <img 
                  src={post.author.avatar} 
                  alt={post.author.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className={`text-xs ${
                  theme === 'light' ? 'text-gray-600' : 'text-muted-foreground'
                }`}>{post.author.name}</span>
              </div>
              
              <div className={`flex items-center text-xs ${
                theme === 'light' ? 'text-gray-500' : 'text-muted-foreground'
              }`}>
                <Calendar className="h-3 w-3 mr-1" />
                <span>{post.publishedAt} • {post.readTime} min</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PostCard;

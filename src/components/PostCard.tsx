
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from './ui/badge';
import { Calendar, User } from 'lucide-react';

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
  return (
    <Link to={`/post/${post.slug}`} className="group">
      <div className="cyber-card h-full overflow-hidden flex flex-col transition-all duration-300 group-hover:border-cyber-purple/50 group-hover:shadow-cyber-purple/20">
        <div className="relative h-48 overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cyber-black/80 to-transparent" />
          <Link 
            to={`/category/${post.category.slug}`}
            className="absolute bottom-3 left-3 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <Badge className="bg-cyber-purple/80 hover:bg-cyber-purple">
              {post.category.name}
            </Badge>
          </Link>
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-medium mb-2 line-clamp-2 group-hover:text-cyber-purple transition-colors">
            {post.title}
          </h3>
          
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
            {post.excerpt}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-cyber-purple/10">
            <div className="flex items-center space-x-2">
              <img 
                src={post.author.avatar} 
                alt={post.author.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-xs text-muted-foreground">{post.author.name}</span>
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{post.publishedAt} • {post.readTime} min</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;


import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from './ui/badge';
import { Calendar } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { format } from 'date-fns';
import { Post } from '@/pages/Posts/types';

interface PostCardProps {
  post: Post
}

const PostCard = ({ post }: PostCardProps) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  console.log(post)
  return (
    <div className="group h-full cursor-pointer">
      <div className={`h-full overflow-hidden flex flex-col transition-all duration-300 border rounded-lg ${
        isLight 
          ? 'bg-white border-gray-200 shadow-sm hover:border-primary/50 hover:shadow-md' 
          : 'cyber-card bg-cyber-dark border-cyber-purple/20 group-hover:border-cyber-purple/50 group-hover:shadow-cyber-purple/20'
      }`}>
        <Link to={`/post/${post.slug}`} className="block">
            {post.thumbnail_url && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.thumbnail_url}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                <div className={`absolute inset-0  ${
                      isLight 
                        ? 'bg-gradient-to-t from-gray-900/70 to-transparent' 
                        : 'bg-gradient-to-t from-cyber-black/80 to-transparent'
                    }`} 
                  ></div>
              </div>
            )}
            {post.category && (
            <div className="absolute bottom-3 left-3 z-10">
              <Link 
                to={`/category/${post.category.slug}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Badge className={`${
                  isLight 
                    ? 'bg-primary hover:bg-primary/90 text-white' 
                    : 'bg-cyber-purple/80 hover:bg-cyber-purple text-white'
                }`}>
                  {post.category.name}
                </Badge>
              </Link>
            </div>
            )}
        </Link>
        
        <div className={`p-5 flex flex-col flex-grow ${
          isLight ? 'text-gray-800' : 'text-foreground'
        }`}>
          <Link to={`/post/${post.slug}`}>
            <h3 className={`text-lg font-medium mb-2 line-clamp-2 transition-colors ${
              isLight 
                ? 'text-gray-800 group-hover:text-primary' 
                : 'text-foreground group-hover:text-cyber-purple'
            }`}>
              {post.title}
            </h3>
          </Link>
          
          <p className={`text-sm line-clamp-3 mb-4 flex-grow ${
            isLight ? 'text-gray-600' : 'text-muted-foreground'
          }`}>
            {post.content}
          </p>
          
          <div className={`flex items-center justify-between pt-4 ${
            isLight ? 'border-t border-gray-200' : 'border-t border-cyber-purple/10'
          }`}>
            <div className="flex items-center space-x-2">
              <Avatar className="inline-flex size-[45px] select-none items-center justify-center overflow-hidden rounded-full bg-blackA1 align-middle">
                <AvatarFallback className="leading-1 flex size-full items-center justify-center bg-white text-[15px] font-medium text-violet11">
                  {post.author?.username.charAt(0).toUpperCase() + post.author?.username.charAt(1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className={`text-xs ${
                isLight ? 'text-gray-600' : 'text-muted-foreground'
              }`}>{post.author?.username.charAt(0).toUpperCase() + post.author?.username.slice(1)}</span>
            </div>
            
            <div className={`flex items-center text-xs ${
              isLight ? 'text-gray-500' : 'text-muted-foreground'
            }`}>
              <Calendar className="h-3 w-3 mr-1" />
              <span>{format(post.created_at, "dd/MM/yy HH:mm")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
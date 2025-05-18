
import React from 'react';
import { Sun, Moon, Contrast } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'high-contrast':
        return <Contrast className="h-5 w-5" />;
      case 'dark':
      default:
        return <Moon className="h-5 w-5" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full border-cyber-purple/30 hover:bg-cyber-purple/10"
        >
          {getIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-cyber-dark border-cyber-purple/30 w-40">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={`flex items-center gap-2 hover:bg-cyber-purple/10 ${theme === 'light' ? 'text-cyber-purple' : ''}`}
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-2 hover:bg-cyber-purple/10 ${theme === 'dark' ? 'text-cyber-purple' : ''}`}
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('high-contrast')}
          className={`flex items-center gap-2 hover:bg-cyber-purple/10 ${theme === 'high-contrast' ? 'text-cyber-purple' : ''}`}
        >
          <Contrast className="h-4 w-4" />
          <span>High Contrast</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;

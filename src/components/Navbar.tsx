
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, X, Terminal, Shield, ChevronDown, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const categories = [
    { name: 'Web App Hacking', path: '/category/web-app-hacking' },
    { name: 'Introdução a Hacking', path: '/category/introducao-hacking' },
    { name: 'Linux', path: '/category/linux' },
    { name: 'Redes', path: '/category/redes' },
    { name: 'Hardware Hacking', path: '/category/hardware-hacking' },
  ];

  // Get initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return "?";
    const email = user.email || "";
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="border-b border-cyber-purple/20 bg-background/95 backdrop-blur-md sticky top-0 z-40 w-full">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-cyber-purple" />
          <span className="text-xl font-bold bg-gradient-to-r from-cyber-purple to-cyber-blue bg-clip-text text-transparent">
            Lab<span className="text-cyber-purple-light">Hack</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          <Link to="/" className="text-sm font-medium hover:text-cyber-purple transition-colors">
            Home
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1 py-2">
                <span>Categorias</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-cyber-dark border-cyber-purple/30 w-56">
              {categories.map((category) => (
                <DropdownMenuItem key={category.path} asChild>
                  <Link 
                    to={category.path} 
                    className="flex w-full hover:bg-cyber-purple/10"
                  >
                    {category.name}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem asChild>
                <Link to="/categories" className="flex w-full text-cyber-purple">
                  Ver todas categorias
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/posts" className="text-sm font-medium hover:text-cyber-purple transition-colors">
            Posts
          </Link>
        </div>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
                  <Avatar className="h-8 w-8 border border-cyber-purple/30">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-cyber-purple/10 text-cyber-purple">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-cyber-dark border-cyber-purple/30 w-56">
                <DropdownMenuItem asChild>
                  <Link to="/account/settings" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-cyber-purple/20" />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-sm hover:text-cyber-purple">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-cyber-purple hover:bg-cyber-purple-dark text-sm">Registrar</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-cyber-black bg-opacity-95 pt-16">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-lg font-medium p-2 hover:bg-cyber-purple/10 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <div className="border-t border-cyber-purple/20 pt-2">
              <p className="text-cyber-purple text-sm mb-2 font-mono">CATEGORIAS:</p>
              {categories.map((category) => (
                <Link
                  key={category.path}
                  to={category.path}
                  className="block text-lg p-2 hover:bg-cyber-purple/10 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-cyber-purple-light">{'>'}</span> {category.name}
                </Link>
              ))}
              <Link
                to="/categories"
                className="block text-lg p-2 text-cyber-purple hover:bg-cyber-purple/10 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Ver todas categorias
              </Link>
            </div>
            <Link 
              to="/posts" 
              className="text-lg font-medium p-2 hover:bg-cyber-purple/10 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Posts
            </Link>
            <div className="border-t border-cyber-purple/20 pt-4 flex flex-col space-y-2">
              {user ? (
                <>
                  <Link to="/account/settings" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-cyber-purple/30 flex items-center justify-center">
                      <User className="mr-2 h-4 w-4" />
                      Meu Perfil
                    </Button>
                  </Link>
                  <Button 
                    className="w-full bg-red-900 hover:bg-red-800 flex items-center justify-center"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-cyber-purple/30">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-cyber-purple hover:bg-cyber-purple-dark">
                      Registrar
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

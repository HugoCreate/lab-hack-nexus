
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-cyber-dark border-t border-cyber-purple/20 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-cyber-purple" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyber-purple to-cyber-blue bg-clip-text text-transparent">
                Lab<span className="text-cyber-purple-light">Hack</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Uma comunidade para aspirantes e profissionais de hacking e cibersegurança compartilharem conhecimento.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <a href="#" className="text-muted-foreground hover:text-cyber-purple transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-cyber-purple transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-cyber-purple transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-cyber-purple-light">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-cyber-purple transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-muted-foreground hover:text-cyber-purple transition-colors">
                  Categorias
                </Link>
              </li>
              <li>
                <Link to="/posts" className="text-muted-foreground hover:text-cyber-purple transition-colors">
                  Posts
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-cyber-purple-light">Comunidade</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-muted-foreground hover:text-cyber-purple transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-muted-foreground hover:text-cyber-purple transition-colors">
                  Registrar
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="text-muted-foreground hover:text-cyber-purple transition-colors">
                  Sobre o Lab Hack
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-cyber-purple/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Lab Hack. Todos os direitos reservados.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/termos" className="hover:text-cyber-purple">
              Termos de uso
            </Link>
            <Link to="/privacidade" className="hover:text-cyber-purple">
              Política de privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

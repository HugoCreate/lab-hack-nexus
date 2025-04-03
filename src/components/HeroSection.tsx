
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Terminal, Shield, ChevronRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-cyber-black py-16 md:py-24 cyber-grid">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-20 w-60 h-60 bg-cyber-purple/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-cyber-blue/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 space-y-6 text-center md:text-left mb-10 md:mb-0">
            <div className="inline-block rounded bg-cyber-purple/10 px-3 py-1 text-sm font-medium text-cyber-purple-light mb-2">
              <span className="font-mono">$ ./sejabem_vindo.sh</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="block">Lab</span>
              <span className="bg-gradient-to-r from-cyber-purple via-cyber-blue to-cyber-purple-light bg-clip-text text-transparent">
                Hack Nexus
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
              Uma comunidade para aspirantes e profissionais compartilharem conhecimento sobre hacking ético e cibersegurança.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link to="/register">
                <Button size="lg" className="bg-cyber-purple hover:bg-cyber-purple-dark">
                  Começar agora <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button size="lg" variant="outline" className="border-cyber-purple/30 hover:bg-cyber-purple/10">
                  Explorar conteúdos
                </Button>
              </Link>
            </div>
            
            <div className="text-sm text-muted-foreground flex items-center justify-center md:justify-start">
              <Terminal className="mr-2 h-4 w-4" />
              <span>Junte-se a mais de 500 hackers éticos</span>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative">
              {/* Background Shape */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple/30 to-cyber-blue/30 rounded-lg blur-md -z-10"></div>
              
              {/* Terminal-like UI */}
              <div className="bg-cyber-dark border border-cyber-purple/30 rounded-lg overflow-hidden shadow-xl w-full max-w-md">
                <div className="flex items-center px-4 py-3 bg-cyber-black border-b border-cyber-purple/20">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="mx-auto text-center text-sm text-muted-foreground font-mono">
                    lab-hack-terminal
                  </div>
                </div>
                
                <div className="p-4 font-mono text-sm space-y-3">
                  <p className="flex">
                    <span className="text-cyber-purple-light mr-2">$</span>
                    <span className="text-cyber-yellow">./lab-hack</span>
                    <span className="animate-pulse text-cyber-purple ml-1">▊</span>
                  </p>
                  <p className="text-cyber-blue-light">
                    Iniciando LabHack Nexus v1.0...
                  </p>
                  <p className="text-green-400">
                    &gt; Comunidade conectada
                  </p>
                  <p className="text-green-400">
                    &gt; Tutoriais carregados
                  </p>
                  <p className="text-green-400">
                    &gt; CTFs disponíveis
                  </p>
                  <p>
                    <span className="text-cyber-purple-light mr-2">$</span>
                    <span>Bem-vindo ao Lab Hack Nexus!</span>
                  </p>
                  <p className="text-cyber-blue animate-pulse">
                    Aguardando seu comando...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

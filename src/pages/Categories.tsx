
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Mock data - expanded from Index.tsx
const allCategories = [
  {
    id: '1',
    name: 'Web App Hacking',
    slug: 'web-app-hacking',
    description: 'Aprenda a encontrar e explorar vulnerabilidades em aplicações web como SQL Injection, XSS e CSRF.',
    postsCount: 24,
    icon: 'code' as const
  },
  {
    id: '2',
    name: 'Introdução a Hacking',
    slug: 'introducao-hacking',
    description: 'Comece sua jornada no mundo da segurança cibernética com conceitos básicos e fundamentos importantes.',
    postsCount: 18,
    icon: 'terminal' as const
  },
  {
    id: '3',
    name: 'Linux',
    slug: 'linux',
    description: 'Domine o sistema operacional preferido dos hackers, desde comandos básicos até configurações avançadas.',
    postsCount: 32,
    icon: 'terminal' as const
  },
  {
    id: '4',
    name: 'Redes',
    slug: 'redes',
    description: 'Entenda como as redes funcionam, desde protocolos fundamentais até técnicas de análise de tráfego.',
    postsCount: 15,
    icon: 'wifi' as const
  },
  {
    id: '5',
    name: 'Hardware Hacking',
    slug: 'hardware-hacking',
    description: 'Explore a segurança de dispositivos físicos, IoT e técnicas de engenharia reversa de hardware.',
    postsCount: 12,
    icon: 'cpu' as const
  },
  {
    id: '6',
    name: 'Mobile Hacking',
    slug: 'mobile-hacking',
    description: 'Descubra como analisar e testar a segurança de aplicativos móveis para iOS e Android.',
    postsCount: 9,
    icon: 'code' as const
  },
  {
    id: '7',
    name: 'Forense Digital',
    slug: 'forense-digital',
    description: 'Técnicas e ferramentas para analisar evidências digitais e investigar incidentes de segurança.',
    postsCount: 7,
    icon: 'fileCode' as const
  },
  {
    id: '8',
    name: 'Engenharia Social',
    slug: 'engenharia-social',
    description: 'Entenda as táticas psicológicas usadas por atacantes e como se proteger contra manipulação.',
    postsCount: 11,
    icon: 'code' as const
  }
];

const Categories = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredCategories, setFilteredCategories] = React.useState(allCategories);

  React.useEffect(() => {
    const filtered = allCategories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Explore por <span className="text-cyber-purple">Categoria</span>
            </h1>
            <p className="text-muted-foreground mb-8">
              Descubra conteúdo especializado organizado por áreas de conhecimento em hacking e cibersegurança
            </p>
            
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar categorias..."
                className="pl-10 bg-cyber-dark border-cyber-purple/20 focus:border-cyber-purple focus:ring-cyber-purple"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
          
          {filteredCategories.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">Nenhuma categoria encontrada</h3>
              <p className="text-muted-foreground">
                Tente buscar com outros termos ou entre em contato para sugerir uma nova categoria
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Categories;


import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Code, Terminal, Wifi, Cpu, FileCode } from 'lucide-react';

// Mock category data
const categories = {
  'web-app-hacking': {
    name: 'Web App Hacking',
    description: 'Aprenda a encontrar e explorar vulnerabilidades em aplicações web como SQL Injection, XSS e CSRF.',
    icon: <Code className="h-8 w-8 text-cyber-purple" />,
    color: 'from-cyber-purple to-cyber-blue'
  },
  'introducao-hacking': {
    name: 'Introdução a Hacking',
    description: 'Comece sua jornada no mundo da segurança cibernética com conceitos básicos e fundamentos importantes.',
    icon: <Terminal className="h-8 w-8 text-cyber-purple" />,
    color: 'from-cyber-purple to-cyber-purple-light'
  },
  'linux': {
    name: 'Linux',
    description: 'Domine o sistema operacional preferido dos hackers, desde comandos básicos até configurações avançadas.',
    icon: <Terminal className="h-8 w-8 text-cyber-purple" />,
    color: 'from-cyber-purple to-cyber-yellow'
  },
  'redes': {
    name: 'Redes',
    description: 'Entenda como as redes funcionam, desde protocolos fundamentais até técnicas de análise de tráfego.',
    icon: <Wifi className="h-8 w-8 text-cyber-purple" />,
    color: 'from-cyber-blue to-cyber-purple'
  },
  'hardware-hacking': {
    name: 'Hardware Hacking',
    description: 'Explore a segurança de dispositivos físicos, IoT e técnicas de engenharia reversa de hardware.',
    icon: <Cpu className="h-8 w-8 text-cyber-purple" />,
    color: 'from-cyber-purple-dark to-cyber-purple'
  }
};

// Mock posts for each category
const categoryPosts = {
  'web-app-hacking': [
    {
      id: '1',
      title: 'Como identificar e explorar vulnerabilidades XSS em aplicações web',
      excerpt: 'Aprenda como identificar, testar e mitigar vulnerabilidades de Cross-Site Scripting (XSS) em aplicações web modernas.',
      slug: 'como-identificar-xss',
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      category: { name: 'Web App Hacking', slug: 'web-app-hacking' },
      author: { name: 'Marcos Silva', avatar: '/placeholder.svg' },
      publishedAt: '12 Fev 2023',
      readTime: 8
    },
    {
      id: '7',
      title: 'Criando seu primeiro script de exploração em Python',
      excerpt: 'Um tutorial prático para desenvolver ferramentas personalizadas para testes de segurança usando Python.',
      slug: 'script-exploracao-python',
      coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
      category: { name: 'Web App Hacking', slug: 'web-app-hacking' },
      author: { name: 'Lucas Ferreira', avatar: '/placeholder.svg' },
      publishedAt: '10 Abr 2023',
      readTime: 18
    },
    {
      id: '9',
      title: 'Entendendo e explorando SQL Injection',
      excerpt: 'Um guia profundo sobre como detectar, explorar e mitigar vulnerabilidades de SQL Injection em aplicações modernas.',
      slug: 'sql-injection-guide',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      category: { name: 'Web App Hacking', slug: 'web-app-hacking' },
      author: { name: 'Julia Rocha', avatar: '/placeholder.svg' },
      publishedAt: '15 Mai 2023',
      readTime: 14
    },
    {
      id: '10',
      title: 'Configurando um ambiente de teste com DVWA',
      excerpt: 'Aprenda a configurar e usar o Damn Vulnerable Web Application para praticar técnicas de hacking web em um ambiente seguro.',
      slug: 'configurando-dvwa',
      coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      category: { name: 'Web App Hacking', slug: 'web-app-hacking' },
      author: { name: 'João Pereira', avatar: '/placeholder.svg' },
      publishedAt: '02 Jun 2023',
      readTime: 10
    }
  ],
  'introducao-hacking': [
    {
      id: '3',
      title: 'Introdução ao Capture The Flag (CTF): Como participar e aprender',
      excerpt: 'Descubra como as competições CTF podem acelerar seu aprendizado em segurança cibernética de forma prática.',
      slug: 'introducao-ctf',
      coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      category: { name: 'Introdução a Hacking', slug: 'introducao-hacking' },
      author: { name: 'Carla Mendes', avatar: '/placeholder.svg' },
      publishedAt: '20 Jan 2023',
      readTime: 6
    },
    {
      id: '6',
      title: 'Entendendo ataques de força bruta e como se proteger',
      excerpt: 'Um guia completo sobre como funcionam os ataques de força bruta e quais medidas adotar para proteger seus sistemas.',
      slug: 'ataques-forca-bruta',
      coverImage: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=800&q=80',
      category: { name: 'Introdução a Hacking', slug: 'introducao-hacking' },
      author: { name: 'Pedro Costa', avatar: '/placeholder.svg' },
      publishedAt: '25 Mar 2023',
      readTime: 7
    }
  ],
  'linux': [
    {
      id: '2',
      title: 'Guia completo para iniciantes em sistemas Linux',
      excerpt: 'Um guia passo a passo para quem está começando a usar Linux, com foco em ferramentas para segurança da informação.',
      slug: 'guia-iniciantes-linux',
      coverImage: 'https://images.unsplash.com/photo-1567301861629-03a59ece5b67?auto=format&fit=crop&w=800&q=80',
      category: { name: 'Linux', slug: 'linux' },
      author: { name: 'Paulo Machado', avatar: '/placeholder.svg' },
      publishedAt: '05 Mar 2023',
      readTime: 12
    }
  ],
  'redes': [
    {
      id: '4',
      title: 'Análise avançada de pacotes com Wireshark',
      excerpt: 'Técnicas avançadas para analisar tráfego de rede e identificar atividades suspeitas usando Wireshark.',
      slug: 'analise-pacotes-wireshark',
      coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      category: { name: 'Redes', slug: 'redes' },
      author: { name: 'Roberto Alves', avatar: '/placeholder.svg' },
      publishedAt: '03 Abr 2023',
      readTime: 10
    }
  ],
  'hardware-hacking': [
    {
      id: '5',
      title: 'Raspberry Pi como ferramenta de pentesting',
      excerpt: 'Aprenda como transformar um Raspberry Pi em uma poderosa ferramenta de teste de penetração portátil.',
      slug: 'raspberry-pi-pentesting',
      coverImage: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
      category: { name: 'Hardware Hacking', slug: 'hardware-hacking' },
      author: { name: 'Ana Souza', avatar: '/placeholder.svg' },
      publishedAt: '18 Mar 2023',
      readTime: 15
    }
  ]
};

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug || !categories[slug as keyof typeof categories]) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex-grow">
          <div className="text-center py-16">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Categoria não encontrada</h1>
            <p className="text-muted-foreground mb-8">
              A categoria que você está procurando não existe ou foi removida.
            </p>
            <Link to="/categories">
              <Button className="bg-cyber-purple hover:bg-cyber-purple-dark">
                Ver todas categorias
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  const category = categories[slug as keyof typeof categories];
  const posts = categoryPosts[slug as keyof typeof categoryPosts] || [];
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="bg-cyber-dark py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="bg-cyber-black/50 p-6 rounded-lg border border-cyber-purple/20 backdrop-blur-sm">
              {category.icon}
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent">
                {category.name}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                {category.description}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-16 flex-grow">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-center">
          <h2 className="text-2xl font-bold mb-4 md:mb-0">
            Posts em <span className="text-cyber-purple">{category.name}</span>
          </h2>
          
          <div className="flex items-center space-x-2">
            <Link to="/posts">
              <Button variant="outline" className="border-cyber-purple/30">
                Todos os posts
              </Button>
            </Link>
            <Link to="/categories">
              <Button variant="outline" className="border-cyber-purple/30">
                Categorias
              </Button>
            </Link>
          </div>
        </div>
        
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">Nenhum post encontrado</h3>
            <p className="text-muted-foreground mb-8">
              Ainda não existem posts nesta categoria. Seja o primeiro a contribuir!
            </p>
            <Link to="/posts">
              <Button className="bg-cyber-purple hover:bg-cyber-purple-dark">
                Ver todos os posts
              </Button>
            </Link>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoryPage;

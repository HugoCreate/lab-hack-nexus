import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import CategoryCard from '@/components/CategoryCard';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Mock data for categories
const categories = [
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
  }
];

// Featured posts - only keeping posts with substantial content
const featuredPosts = [
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
    id: '2',
    title: 'Guia completo para iniciantes em sistemas Linux',
    excerpt: 'Um guia passo a passo para quem está começando a usar Linux, com foco em ferramentas para segurança da informação.',
    slug: 'guia-iniciantes-linux',
    coverImage: 'https://images.unsplash.com/photo-1567301861629-03a59ece5b67?auto=format&fit=crop&w=800&q=80',
    category: { name: 'Linux', slug: 'linux' },
    author: { name: 'Paulo Machado', avatar: '/placeholder.svg' },
    publishedAt: '05 Mar 2023',
    readTime: 12
  },
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
  }
];

// Recent posts - only keeping posts with substantial content
const recentPosts = [
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
  },
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
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        
        {/* Categories Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Categorias <span className="text-cyber-purple">Especializadas</span>
                </h2>
                <p className="text-muted-foreground">
                  Explore nosso conteúdo organizado por áreas do conhecimento
                </p>
              </div>
              <Link to="/categories" className="mt-4 md:mt-0">
                <Button variant="outline" className="border-cyber-purple/30">
                  Ver todas categorias <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.slice(0, 3).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>
        
        {/* Featured Posts */}
        <section className="py-16 bg-cyber-dark cyber-grid">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Posts <span className="text-cyber-blue">Em Destaque</span>
                </h2>
                <p className="text-muted-foreground">
                  Conteúdo selecionado pelos nossos especialistas
                </p>
              </div>
              <Link to="/posts" className="mt-4 md:mt-0">
                <Button variant="outline" className="border-cyber-blue/30">
                  Ver todos posts <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
        
        {/* Recent Posts */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Publicações <span className="text-cyber-purple">Recentes</span>
                </h2>
                <p className="text-muted-foreground">
                  Últimos conteúdos adicionados à nossa plataforma
                </p>
              </div>
              <Link to="/posts" className="mt-4 md:mt-0">
                <Button variant="outline" className="border-cyber-purple/30">
                  Ver mais posts <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-cyber-dark relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full cyber-grid opacity-20"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyber-purple/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyber-blue/20 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-block rounded bg-cyber-purple/10 px-3 py-1 text-sm font-medium text-cyber-purple-light mb-4 font-mono">
                $ sudo join_community.sh
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Faça parte da comunidade <span className="text-cyber-purple">Lab Hack</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Junte-se a outros entusiastas e profissionais de segurança cibernética. Compartilhe conhecimento, aprenda novas técnicas e cresça em sua jornada no hacking ético.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-cyber-purple hover:bg-cyber-purple-dark">
                    Criar uma conta
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-cyber-purple/30">
                    Já tenho uma conta
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;

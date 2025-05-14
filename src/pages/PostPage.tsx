
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, BookmarkIcon, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import CommentSection from '@/components/CommentSection';
import SharePost from '@/components/SharePost';
import { useSavedPosts } from '@/hooks/useSavedPosts';
import { useToast } from '@/hooks/use-toast';

// Combining all mock posts
const allPosts = [
  {
    id: '1',
    title: 'Como identificar e explorar vulnerabilidades XSS em aplicações web',
    content: `
      <p class="mb-6">Cross-Site Scripting (XSS) é uma das vulnerabilidades mais comuns encontradas em aplicações web. Neste tutorial, vamos aprender como identificar, testar e mitigar vulnerabilidades XSS em aplicações modernas.</p>
      
      <h2 class="text-xl font-bold mb-4">O que é XSS?</h2>
      
      <p class="mb-6">XSS é uma vulnerabilidade que permite a injeção de código JavaScript malicioso em páginas web visualizadas por outros usuários. Esse código pode roubar dados, manipular o conteúdo da página ou realizar ações não autorizadas.</p>
      
      <h2 class="text-xl font-bold mb-4">Tipos de XSS</h2>
      
      <h3 class="text-lg font-medium mb-3">1. Reflected XSS</h3>
      <p class="mb-6">O payload malicioso é refletido no servidor e executado no navegador da vítima. Geralmente ocorre quando dados de entrada do usuário são incluídos em uma resposta HTTP sem validação adequada.</p>
      
      <div class="bg-cyber-black/30 p-4 rounded-md my-4 font-mono text-sm overflow-auto">
        https://exemplo.com/search?q=&lt;script&gt;alert('XSS')&lt;/script&gt;
      </div>
      
      <h3 class="text-lg font-medium mb-3">2. Stored XSS</h3>
      <p class="mb-6">O código malicioso é armazenado no servidor (em um banco de dados, por exemplo) e é executado quando outros usuários acessam a página afetada.</p>
      
      <h3 class="text-lg font-medium mb-3">3. DOM-based XSS</h3>
      <p class="mb-6">Ocorre quando o JavaScript no cliente modifica o DOM de maneira insegura, permitindo a execução de código malicioso.</p>
      
      <h2 class="text-xl font-bold mb-4">Como identificar vulnerabilidades XSS</h2>
      
      <ol class="list-decimal list-inside space-y-4 mb-6 ml-4">
        <li>Identifique pontos de entrada onde o input do usuário é refletido na página</li>
        <li>Teste payloads simples como <span class="font-mono bg-cyber-black/30 px-2 py-0.5 rounded">alert(1)</span> ou <span class="font-mono bg-cyber-black/30 px-2 py-0.5 rounded">console.log(1)</span></li>
        <li>Verifique se a aplicação filtra caracteres especiais como <span class="font-mono bg-cyber-black/30 px-2 py-0.5 rounded">&lt;</span>, <span class="font-mono bg-cyber-black/30 px-2 py-0.5 rounded">&gt;</span> ou <span class="font-mono bg-cyber-black/30 px-2 py-0.5 rounded">"</span></li>
        <li>Use técnicas de bypass caso a aplicação implemente filtros</li>
        <li>Teste variações de context (HTML, JS, atributos, etc)</li>
      </ol>
      
      <h2 class="text-xl font-bold mb-4">Exemplo de payload XSS</h2>
      
      <div class="bg-cyber-black/30 p-4 rounded-md my-4 font-mono text-sm overflow-auto">
        &lt;img src="x" onerror="alert(document.cookie)" /&gt;
      </div>
      
      <h2 class="text-xl font-bold mb-4">Como mitigar vulnerabilidades XSS</h2>
      
      <ul class="list-disc list-inside space-y-4 mb-6 ml-4">
        <li>Sanitize todas as entradas de usuário</li>
        <li>Implemente Content Security Policy (CSP)</li>
        <li>Use frameworks modernos que fazem escape automático de HTML</li>
        <li>Valide inputs tanto no cliente quanto no servidor</li>
        <li>Utilize o atributo HttpOnly em cookies sensíveis</li>
      </ul>
      
      <h2 class="text-xl font-bold mb-4">Ferramentas úteis para testar XSS</h2>
      
      <ul class="list-disc list-inside space-y-2 mb-6 ml-4">
        <li>OWASP ZAP</li>
        <li>Burp Suite</li>
        <li>XSStrike</li>
        <li>BeEF (Browser Exploitation Framework)</li>
      </ul>
      
      <p class="mb-6">Lembre-se sempre de realizar testes apenas em sistemas que você tem permissão para testar. Explorar vulnerabilidades em sistemas sem autorização é ilegal e antiético.</p>
      
      <div class="p-4 border border-cyber-purple/20 rounded-md bg-cyber-dark/50 mb-6">
        <p class="font-medium mb-2">Nota importante:</p>
        <p class="text-sm">Este tutorial é apenas para fins educacionais. Use este conhecimento de maneira responsável e ética.</p>
      </div>
    `,
    slug: 'como-identificar-xss',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    category: { name: 'Web App Hacking', slug: 'web-app-hacking' },
    author: { name: 'Marcos Silva', avatar: '/placeholder.svg' },
    publishedAt: '12 Fev 2023',
    readTime: 8,
    tags: ['xss', 'web security', 'javascript', 'pentesting'],
    relatedPosts: ['7', '9', '10']
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
    readTime: 12,
    tags: ['linux', 'beginner', 'terminal', 'commands'],
    relatedPosts: ['3', '4', '5']
  },
  // ... the rest of the mock posts
];

const PostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // For now, we'll use the mock data, but in a real app you'd fetch from Supabase
  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    
    setTimeout(() => {
      const foundPost = allPosts.find(p => p.slug === slug);
      setPost(foundPost || null);
      
      if (foundPost && foundPost.relatedPosts) {
        const related = foundPost.relatedPosts
          .map(id => allPosts.find(p => p.id === id))
          .filter(Boolean);
        setRelatedPosts(related);
      }
      
      setIsLoading(false);
    }, 300);
  }, [slug]);
  
  // Initialize the saved posts hook
  const postId = post?.id || '';
  const { isSaved, isLoading: isSavedLoading, isSaving, toggleSave } = useSavedPosts(postId);
  
  // Get the current URL for sharing
  const currentUrl = window.location.href;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex-grow">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Carregando post...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex-grow">
          <div className="text-center py-16">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Post não encontrado</h1>
            <p className="text-muted-foreground mb-8">
              O post que você está procurando não existe ou foi removido.
            </p>
            <Link to="/posts">
              <Button className="bg-cyber-purple hover:bg-cyber-purple-dark">
                Ver todos os posts
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  const handleSaveClick = () => {
    if (!user) {
      toast({
        title: 'Login necessário',
        description: 'Você precisa estar logado para salvar posts.',
        variant: 'destructive',
      });
      return;
    }
    
    toggleSave();
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img 
          src={post.coverImage} 
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cyber-black/70 to-cyber-black/30"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto">
            <Link 
              to={`/category/${post.category.slug}`}
              className="inline-block mb-4"
            >
              <Badge className="bg-cyber-purple/80 hover:bg-cyber-purple">
                {post.category.name}
              </Badge>
            </Link>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 max-w-4xl">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <span>{post.author.name}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{post.publishedAt}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>{post.readTime} min de leitura</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-3/4">
            <div className="cyber-card p-6 md:p-8">
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content || post.excerpt }}
              />
            </div>
            
            {/* Tags */}
            {post.tags && (
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link key={tag} to={`/tags/${tag}`}>
                      <Badge variant="outline" className="border-cyber-purple/30 hover:bg-cyber-purple/10">
                        #{tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Author bio */}
            <div className="mt-8 cyber-card p-6">
              <div className="flex items-center">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback className="bg-cyber-purple/20 text-cyber-purple text-xl">
                    {post.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">{post.author.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    Especialista em segurança cibernética com mais de 5 anos de experiência em testes de penetração e análise de vulnerabilidades.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Comments Section */}
            <CommentSection postId={post.id} />
          </div>
          
          <div className="md:w-1/4">
            <div className="sticky top-24 space-y-6">
              {/* Post actions */}
              <div className="cyber-card p-6">
                <div className="flex flex-col space-y-4">
                  <Button 
                    variant="outline" 
                    className={`w-full ${isSaved ? 'bg-cyber-purple/20 border-cyber-purple' : 'border-cyber-purple/30 hover:bg-cyber-purple/10'} flex items-center justify-center`}
                    onClick={handleSaveClick}
                    disabled={isSavedLoading || isSaving}
                  >
                    <BookmarkIcon className="mr-2 h-4 w-4" />
                    {isSaved ? 'Salvo' : 'Salvar'}
                  </Button>
                  
                  <SharePost postTitle={post.title} postUrl={currentUrl} />
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-cyber-purple/30 hover:bg-cyber-purple/10 flex items-center justify-center"
                    onClick={() => document.querySelector('#comments')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Comentar
                  </Button>
                </div>
              </div>
              
              {/* Related posts */}
              {relatedPosts.length > 0 && (
                <div className="cyber-card p-6">
                  <h3 className="font-medium mb-4">Posts relacionados</h3>
                  <div className="space-y-4">
                    {relatedPosts.map((related) => related && (
                      <Link to={`/post/${related.slug}`} key={related.id} className="block group">
                        <div className="flex items-center">
                          <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={related.coverImage}
                              alt={related.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium line-clamp-2 group-hover:text-cyber-purple transition-colors">
                              {related.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {related.readTime} min de leitura
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PostPage;

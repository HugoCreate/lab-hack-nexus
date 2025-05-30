import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });

      navigate('/');
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-cyber-black cyber-grid">
      <div className="container mx-auto px-4 py-16 flex-grow flex items-center justify-center">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
            <Shield className="h-8 w-8 text-cyber-purple" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyber-purple to-cyber-blue bg-clip-text text-transparent">
              Lab<span className="text-cyber-purple-light">Hack</span>
            </span>
          </Link>
          
          <div className="cyber-card p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Bem-vindo de volta</h1>
              <p className="text-muted-foreground">
                Entre para continuar sua jornada no Lab Hack
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10 border-cyber-purple/20 focus:border-cyber-purple"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm">
                    Senha
                  </Label>
{/*                   <Link 
                    to="/forgot-password" 
                    className="text-xs text-cyber-blue hover:text-cyber-purple transition-colors"
                  >
                    Esqueceu sua senha?
                  </Link> */}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 border-cyber-purple/20 focus:border-cyber-purple"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-cyber-purple hover:bg-cyber-purple-dark"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Não tem uma conta? </span>
              <Link to="/register" className="text-cyber-purple hover:text-cyber-blue transition-colors">
                Registre-se agora
              </Link>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/" className="text-muted-foreground text-sm hover:text-cyber-purple transition-colors">
              &larr; Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

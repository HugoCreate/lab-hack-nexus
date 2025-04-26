
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Lock, Bell, Shield, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AccountSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Mock user data
  const [userData, setUserData] = useState({
    username: '',
    displayName: '',
    email: '',
    bio: '',
    avatar: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: {
      email: true,
      newPosts: true,
      replies: true,
      mentions: false
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setUserData(prevData => ({
          ...prevData,
          ...data
        }));
      } catch (error: any) {
        toast({
          title: "Erro ao carregar perfil",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };
  
  const handleNotificationChange = (name: string, checked: boolean) => {
    setUserData({
      ...userData,
      notifications: {
        ...userData.notifications,
        [name]: checked
      }
    });
  };
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: userData.username,
          bio: userData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userData.newPassword !== userData.confirmPassword) {
      toast({
        title: "Erro ao atualizar senha",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: userData.newPassword
      });

      if (error) throw error;

      setUserData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar senha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNotificationsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Preferências atualizadas",
        description: "Suas preferências de notificação foram salvas.",
      });
    }, 1000);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Configurações da <span className="text-cyber-purple">Conta</span>
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e preferências
            </p>
          </div>
          
          <div className="cyber-card p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="profile" className="data-[state=active]:text-cyber-purple">
                  <User className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Perfil</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:text-cyber-purple">
                  <Lock className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Segurança</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:text-cyber-purple">
                  <Bell className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Notificações</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="flex flex-col items-center space-y-4 mb-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={userData.avatar || ''} alt={userData.displayName} />
                      <AvatarFallback className="bg-cyber-purple/20 text-cyber-purple text-xl">
                        {userData.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <Button variant="outline" size="sm" type="button" className="flex items-center">
                      <Upload className="mr-2 h-4 w-4" />
                      Alterar foto
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Nome de usuário</Label>
                      <Input
                        id="username"
                        name="username"
                        value={userData.username}
                        onChange={handleProfileChange}
                        className="border-cyber-purple/20 focus:border-cyber-purple"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Nome de exibição</Label>
                      <Input
                        id="displayName"
                        name="displayName"
                        value={userData.displayName}
                        onChange={handleProfileChange}
                        className="border-cyber-purple/20 focus:border-cyber-purple"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={userData.email}
                      onChange={handleProfileChange}
                      className="border-cyber-purple/20 focus:border-cyber-purple"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={userData.bio}
                      onChange={handleProfileChange}
                      rows={4}
                      className="border-cyber-purple/20 focus:border-cyber-purple resize-none"
                    />
                    <p className="text-muted-foreground text-xs">
                      Descreva-se em algumas palavras. Isso aparecerá no seu perfil público.
                    </p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-cyber-purple hover:bg-cyber-purple-dark"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Salvando...' : 'Salvar alterações'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="security">
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha atual</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={userData.currentPassword}
                      onChange={handlePasswordChange}
                      className="border-cyber-purple/20 focus:border-cyber-purple"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova senha</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={userData.newPassword}
                        onChange={handlePasswordChange}
                        className="border-cyber-purple/20 focus:border-cyber-purple"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={userData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="border-cyber-purple/20 focus:border-cyber-purple"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-cyber-purple/10">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-cyber-purple" />
                      Segurança da conta
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Recomendamos utilizar uma senha forte e única que você não use em outros sites.
                    </p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-cyber-purple hover:bg-cyber-purple-dark"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Atualizando...' : 'Atualizar senha'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="notifications">
                <form onSubmit={handleNotificationsSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Preferências de Email</h3>
                    
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">Emails de notificação</p>
                        <p className="text-muted-foreground text-sm">
                          Receba emails sobre sua atividade na plataforma
                        </p>
                      </div>
                      <Switch
                        checked={userData.notifications.email}
                        onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                        className="data-[state=checked]:bg-cyber-purple"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-t border-cyber-purple/10">
                      <div>
                        <p className="font-medium">Novos posts</p>
                        <p className="text-muted-foreground text-sm">
                          Seja notificado quando novos posts forem publicados nas categorias que você segue
                        </p>
                      </div>
                      <Switch
                        checked={userData.notifications.newPosts}
                        onCheckedChange={(checked) => handleNotificationChange('newPosts', checked)}
                        className="data-[state=checked]:bg-cyber-purple"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-t border-cyber-purple/10">
                      <div>
                        <p className="font-medium">Respostas aos seus comentários</p>
                        <p className="text-muted-foreground text-sm">
                          Seja notificado quando alguém responder seus comentários
                        </p>
                      </div>
                      <Switch
                        checked={userData.notifications.replies}
                        onCheckedChange={(checked) => handleNotificationChange('replies', checked)}
                        className="data-[state=checked]:bg-cyber-purple"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-t border-cyber-purple/10">
                      <div>
                        <p className="font-medium">Menções</p>
                        <p className="text-muted-foreground text-sm">
                          Seja notificado quando alguém mencionar você em um post ou comentário
                        </p>
                      </div>
                      <Switch
                        checked={userData.notifications.mentions}
                        onCheckedChange={(checked) => handleNotificationChange('mentions', checked)}
                        className="data-[state=checked]:bg-cyber-purple"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-cyber-purple hover:bg-cyber-purple-dark"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Salvando...' : 'Salvar preferências'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/" className="text-muted-foreground text-sm hover:text-cyber-purple transition-colors">
              &larr; Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AccountSettings;

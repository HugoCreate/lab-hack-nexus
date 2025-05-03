
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, Mail, Lock, Upload, X, Save } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

const AccountSettings = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatar: null as File | null,
    avatarUrl: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [savedPosts, setSavedPosts] = useState([]);
  
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        toast({
          title: "Acesso negado",
          description: "Você precisa estar logado para acessar esta página.",
          variant: "destructive",
        });
        navigate('/login');
      } else {
        fetchProfile();
      }
    }
  }, [user, isLoading, navigate, toast]);
  
  const fetchProfile = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setProfile(data);
        setFormData({
          ...formData,
          username: data.username || '',
          bio: data.bio || '',
          avatarUrl: data.avatar_url || '',
        });
      }
      
      // Fetch saved posts (to be implemented)
      // const { data: savedPostsData } = await supabase...
      
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Erro ao carregar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors({
          ...errors,
          avatar: 'A imagem deve ter no máximo 2MB',
        });
        return;
      }
      
      setFormData({
        ...formData,
        avatar: file,
        avatarUrl: URL.createObjectURL(file),
      });
      
      if (errors.avatar) {
        setErrors({
          ...errors,
          avatar: '',
        });
      }
    }
  };
  
  const clearAvatar = () => {
    setFormData({
      ...formData,
      avatar: null,
      avatarUrl: '',
    });
  };
  
  const validateProfile = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Nome de usuário é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validatePassword = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const updateProfile = async () => {
    if (!validateProfile()) return;
    
    setUpdating(true);
    
    try {
      if (!user) return;
      
      let avatarUrl = profile?.avatar_url || null;
      
      // Upload new avatar if selected
      if (formData.avatar) {
        const fileExt = formData.avatar.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, formData.avatar);
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        avatarUrl = data.publicUrl;
      }
      
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          bio: formData.bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
      
      // Refresh profile data
      await fetchProfile();
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };
  
  const updatePassword = async () => {
    if (!validatePassword()) return;
    
    setUpdating(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso.",
      });
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "Erro ao atualizar senha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };
  
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center space-y-4">
            <div className="h-20 w-20 bg-cyber-purple/20 rounded-full"></div>
            <div className="h-6 w-48 bg-cyber-purple/20 rounded"></div>
            <div className="h-4 w-32 bg-cyber-purple/10 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Configurações da Conta</h1>
            <p className="text-muted-foreground mb-8">
              Gerencie seu perfil e preferências
            </p>
            
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="profile" className="data-[state=active]:bg-cyber-purple/10 data-[state=active]:text-cyber-purple">
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-cyber-purple/10 data-[state=active]:text-cyber-purple">
                  Segurança
                </TabsTrigger>
                <TabsTrigger value="saved" className="data-[state=active]:bg-cyber-purple/10 data-[state=active]:text-cyber-purple">
                  Posts Salvos
                </TabsTrigger>
              </TabsList>
              
              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="cyber-card">
                  <CardHeader>
                    <CardTitle>Informações do Perfil</CardTitle>
                    <CardDescription>
                      Atualize suas informações pessoais
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div>
                      <Label htmlFor="avatar" className="block mb-2 text-sm font-medium">
                        Foto de Perfil
                      </Label>
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-24 w-24 border-2 border-cyber-purple">
                          <AvatarImage src={formData.avatarUrl} />
                          <AvatarFallback className="text-lg bg-cyber-purple/10 text-cyber-purple">
                            {user?.email?.substring(0, 2).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-2">
                          <Input
                            id="avatar"
                            name="avatar"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('avatar')?.click()}
                              className="border-cyber-purple/30"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Escolher imagem
                            </Button>
                            {formData.avatarUrl && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={clearAvatar}
                                className="border-red-500/30 text-red-500"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Remover
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG ou GIF (máximo 2MB)
                          </p>
                          {errors.avatar && (
                            <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Username Field */}
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm">
                        Nome de usuário
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="Seu nome de usuário"
                          className="pl-10 border-cyber-purple/20 focus:border-cyber-purple"
                        />
                      </div>
                      {errors.username && (
                        <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                      )}
                    </div>
                    
                    {/* Email Field (readonly) */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          value={user?.email || ''}
                          readOnly
                          disabled
                          className="pl-10 bg-cyber-purple/5 border-cyber-purple/20 text-muted-foreground"
                        />
                      </div>
                    </div>
                    
                    {/* Bio Field */}
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm">
                        Biografia
                      </Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Conte um pouco sobre você..."
                        rows={4}
                        className="border-cyber-purple/20 focus:border-cyber-purple resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        Máximo de 300 caracteres
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={updateProfile}
                      disabled={updating}
                      className="bg-cyber-purple hover:bg-cyber-purple-dark"
                    >
                      {updating ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Security Tab */}
              <TabsContent value="security">
                <Card className="cyber-card">
                  <CardHeader>
                    <CardTitle>Segurança</CardTitle>
                    <CardDescription>
                      Atualize sua senha
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-sm">
                        Senha atual
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className="pl-10 border-cyber-purple/20 focus:border-cyber-purple"
                        />
                      </div>
                      {errors.currentPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
                      )}
                    </div>
                    
                    {/* New Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm">
                        Nova senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className="pl-10 border-cyber-purple/20 focus:border-cyber-purple"
                        />
                      </div>
                      {errors.newPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
                      )}
                    </div>
                    
                    {/* Confirm New Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm">
                        Confirmar nova senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className="pl-10 border-cyber-purple/20 focus:border-cyber-purple"
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={updatePassword}
                      disabled={updating}
                      className="bg-cyber-purple hover:bg-cyber-purple-dark"
                    >
                      {updating ? 'Atualizando...' : 'Atualizar Senha'}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Saved Posts Tab */}
              <TabsContent value="saved">
                <Card className="cyber-card">
                  <CardHeader>
                    <CardTitle>Posts Salvos</CardTitle>
                    <CardDescription>
                      Gerencie seus posts salvos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {savedPosts.length > 0 ? (
                      <div>
                        {/* Display saved posts here - to be implemented */}
                        <p>Lista de posts salvos será implementada em breve.</p>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">
                          Você ainda não tem posts salvos.
                        </p>
                        <Link to="/posts">
                          <Button variant="outline" className="mt-4 border-cyber-purple/30">
                            Explorar posts
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AccountSettings;

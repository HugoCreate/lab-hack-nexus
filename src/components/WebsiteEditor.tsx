
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, Plus } from 'lucide-react';

const WebsiteEditor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState('');
  const [currentContent, setCurrentContent] = useState<Record<string, any>>({});
  const [newPageName, setNewPageName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setIsAdmin(data?.is_admin || false);
        if (data?.is_admin) {
          fetchPages();
        } else {
          setIsLoading(false);
        }
      } catch (error: any) {
        console.error('Error checking admin status:', error.message);
        toast({
          title: 'Erro',
          description: 'Falha ao verificar status de administrador',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, toast]);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .order('page_name');

      if (error) throw error;

      setPages(data || []);
      if (data && data.length > 0) {
        setSelectedPage(data[0].id);
        setCurrentContent(data[0].content);
      }
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error fetching pages:', error.message);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar páginas',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handlePageChange = (pageId: string) => {
    const selectedPageData = pages.find(page => page.id === pageId);
    if (selectedPageData) {
      setSelectedPage(pageId);
      setCurrentContent(selectedPageData.content);
    }
  };

  const handleContentChange = (key: string, value: string) => {
    setCurrentContent(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('website_content')
        .update({
          content: currentContent,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPage);

      if (error) throw error;

      toast({
        title: 'Salvo com sucesso',
        description: 'Conteúdo da página atualizado',
      });
    } catch (error: any) {
      console.error('Error saving content:', error.message);
      toast({
        title: 'Erro',
        description: 'Falha ao salvar conteúdo',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreatePage = async () => {
    if (!user || !newPageName.trim()) return;
    
    setIsCreating(true);
    try {
      // Simple template for new page
      const initialContent = {
        title: newPageName,
        description: 'Descrição da página',
        sections: [
          {
            heading: 'Título da Seção',
            content: 'Conteúdo da seção'
          }
        ]
      };

      const { data, error } = await supabase
        .from('website_content')
        .insert({
          page_name: newPageName,
          content: initialContent,
          updated_by: user.id
        })
        .select();

      if (error) throw error;

      toast({
        title: 'Página criada com sucesso',
        description: `A página "${newPageName}" foi criada`
      });

      // Update local state
      if (data) {
        setPages([...pages, ...data]);
        setSelectedPage(data[0].id);
        setCurrentContent(data[0].content);
      }

      setNewPageName('');
      setIsCreating(false);
    } catch (error: any) {
      console.error('Error creating page:', error.message);
      toast({
        title: 'Erro',
        description: 'Falha ao criar página',
        variant: 'destructive',
      });
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyber-purple" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-medium mb-2">Acesso Restrito</h2>
        <p className="text-muted-foreground">
          Você precisa ser administrador para acessar esta página.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Editor de Conteúdo</h2>
          <p className="text-muted-foreground">
            Edite o conteúdo das páginas do site
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedPage} onValueChange={handlePageChange}>
            <SelectTrigger className="w-[200px] border-cyber-purple/20">
              <SelectValue placeholder="Selecione uma página" />
            </SelectTrigger>
            <SelectContent>
              {pages.map((page) => (
                <SelectItem key={page.id} value={page.id}>
                  {page.page_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="bg-cyber-purple hover:bg-cyber-purple-dark"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="ml-2">Salvar</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="new">Nova Página</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-6">
          {selectedPage ? (
            <>
              {Object.entries(currentContent).map(([key, value]) => {
                if (typeof value === 'string') {
                  return (
                    <div key={key} className="space-y-2">
                      <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                      {key.toLowerCase().includes('content') || value.length > 100 ? (
                        <Textarea 
                          value={value} 
                          onChange={(e) => handleContentChange(key, e.target.value)}
                          className="min-h-[150px] border-cyber-purple/20"
                        />
                      ) : (
                        <Input 
                          value={value} 
                          onChange={(e) => handleContentChange(key, e.target.value)}
                          className="border-cyber-purple/20"
                        />
                      )}
                    </div>
                  );
                } else if (Array.isArray(value)) {
                  return (
                    <div key={key} className="space-y-2">
                      <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                      <div className="border border-cyber-purple/20 rounded-md p-4 space-y-4">
                        {value.map((item, index) => (
                          <div key={index} className="space-y-2 p-3 border border-cyber-purple/10 rounded">
                            {Object.entries(item).map(([itemKey, itemValue]) => (
                              <div key={itemKey} className="space-y-1">
                                <Label className="text-sm capitalize">{itemKey.replace(/([A-Z])/g, ' $1')}</Label>
                                {typeof itemValue === 'string' && (
                                  itemKey.toLowerCase().includes('content') || (itemValue as string).length > 100 ? (
                                    <Textarea 
                                      value={itemValue as string}
                                      onChange={(e) => {
                                        const newSections = [...value];
                                        newSections[index] = {
                                          ...newSections[index],
                                          [itemKey]: e.target.value
                                        };
                                        handleContentChange(key, newSections);
                                      }}
                                      className="min-h-[100px] border-cyber-purple/20"
                                    />
                                  ) : (
                                    <Input 
                                      value={itemValue as string}
                                      onChange={(e) => {
                                        const newSections = [...value];
                                        newSections[index] = {
                                          ...newSections[index],
                                          [itemKey]: e.target.value
                                        };
                                        handleContentChange(key, newSections);
                                      }}
                                      className="border-cyber-purple/20"
                                    />
                                  )
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhuma página selecionada.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="new" className="space-y-4">
          <div className="cyber-card p-6">
            <h3 className="text-lg font-medium mb-4">Criar nova página</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pageName">Nome da página</Label>
                <Input
                  id="pageName"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  placeholder="ex: sobre, contato, faq"
                  className="border-cyber-purple/20"
                />
              </div>
              
              <Button
                onClick={handleCreatePage}
                disabled={isCreating || !newPageName.trim()}
                className="bg-cyber-purple hover:bg-cyber-purple-dark"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Criar Página
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebsiteEditor;

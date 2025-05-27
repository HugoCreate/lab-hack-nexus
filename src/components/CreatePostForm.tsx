
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Image } from 'lucide-react';

// Utility function to create a URL-friendly slug
const createSlug = (text: string) => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

const CreatePostForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('name');

        if (error) throw error;

        setCategories(data || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error.message);
        toast({
          title: 'Erro ao carregar categorias',
          description: error.message,
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setThumbnailUrl(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const slug = createSlug(title);

      let finalThumbnailUrl = '';
      
      // Upload thumbnail if provided
      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}-${slug}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('post-thumbnails')
          .upload(filePath, thumbnailFile);

        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('post-thumbnails')
          .getPublicUrl(filePath);
          
        finalThumbnailUrl = publicUrlData.publicUrl;
      }

      // Save post to database
      const { error } = await supabase.from('posts').insert({
        title,
        content,
        slug,
        author_id: user.id,
        category_id: categoryId || null,
        thumbnail_url: finalThumbnailUrl || null,
        published: false, // Draft by default
      });

      if (error) throw error;

      toast({
        title: 'Post criado com sucesso',
        description: 'Seu post foi salvo como rascunho.',
      });
      
      navigate('/account/posts');
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: 'Erro ao criar post',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyber-purple" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-cyber-purple/20 focus:border-cyber-purple"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="border-cyber-purple/20 focus:border-cyber-purple">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnail">Imagem de capa</Label>
        <div className="flex items-center space-x-4">
          <Button
            type="button"
            variant="outline"
            className="border-cyber-purple/20 hover:border-cyber-purple"
            onClick={() => document.getElementById('thumbnail')?.click()}
          >
            <Image className="w-4 h-4 mr-2" />
            Escolher imagem
          </Button>
          <input
            id="thumbnail"
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="hidden"
          />
          {thumbnailUrl && (
            <div className="w-16 h-16 bg-cyber-purple/10 rounded overflow-hidden">
              <img
                src={thumbnailUrl}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Conteúdo</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px] border-cyber-purple/20 focus:border-cyber-purple"
          required
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-cyber-purple hover:bg-cyber-purple-dark"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar como rascunho'
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreatePostForm;

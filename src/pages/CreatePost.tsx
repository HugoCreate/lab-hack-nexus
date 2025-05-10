
import React from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CreatePostForm from '@/components/CreatePostForm';
import { useAuth } from '@/contexts/AuthContext';
import { Terminal } from 'lucide-react';

const CreatePost = () => {
  const { user, isLoading } = useAuth();
  
  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center space-x-2 mb-8">
            <div className="p-2 rounded-md bg-cyber-purple/10">
              <Terminal className="h-6 w-6 text-cyber-purple" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Criar novo post</h1>
              <p className="text-muted-foreground">
                Compartilhe conhecimento com a comunidade
              </p>
            </div>
          </div>
          
          <div className="cyber-card p-6">
            <CreatePostForm />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreatePost;

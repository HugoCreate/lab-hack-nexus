
import React from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WebsiteEditor from '@/components/WebsiteEditor';
import { useAuth } from '@/contexts/AuthContext';
import { Shield } from 'lucide-react';

const AdminDashboard = () => {
  const { user, isLoading } = useAuth();
  
  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center space-x-2 mb-8">
            <div className="p-2 rounded-md bg-cyber-purple/10">
              <Shield className="h-6 w-6 text-cyber-purple" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Painel de Administração</h1>
              <p className="text-muted-foreground">
                Gerenciar o conteúdo do site
              </p>
            </div>
          </div>
          
          <div className="cyber-card p-6">
            <WebsiteEditor />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;

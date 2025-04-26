
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Privacidade = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          Política de <span className="text-cyber-purple">Privacidade</span>
        </h1>
        
        <div className="space-y-6 text-muted-foreground">
          <p>
            Sua privacidade é importante para nós. Esta Política de Privacidade explica como o Lab Hack
            coleta, usa, armazena e protege suas informações pessoais quando você utiliza nossa plataforma.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Informações Coletadas</h2>
          
          <p>
            Coletamos informações que você nos fornece diretamente, como nome, endereço de e-mail e
            detalhes do perfil ao criar uma conta. Também coletamos dados de uso para melhorar
            nossa plataforma e personalizar sua experiência.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Uso das Informações</h2>
          
          <p>
            Utilizamos suas informações para fornecer, manter e melhorar nossa plataforma,
            personalizar sua experiência, comunicar-nos com você e garantir a segurança do site.
            Nunca vendemos suas informações pessoais a terceiros.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Proteção de Dados</h2>
          
          <p>
            Implementamos medidas técnicas e organizacionais para proteger suas informações pessoais
            contra acesso não autorizado, perda acidental ou alteração. Seus dados são armazenados
            em servidores seguros e criptografados.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Cookies</h2>
          
          <p>
            Utilizamos cookies para melhorar sua experiência de navegação. Você pode configurar seu
            navegador para recusar todos os cookies ou indicar quando um cookie está sendo enviado.
            No entanto, algumas funcionalidades do site podem não funcionar corretamente sem cookies.
          </p>
          
          <p className="mt-8 italic">
            Última atualização: 26 de Abril de 2025
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacidade;

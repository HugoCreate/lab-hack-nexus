
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Termos = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          Termos de <span className="text-cyber-purple">Uso</span>
        </h1>
        
        <div className="space-y-6 text-muted-foreground">
          <p>
            Bem-vindo ao Lab Hack. Ao acessar e usar este site, você concorda em cumprir
            estes termos de serviço, todas as leis e regulamentos aplicáveis, e concorda
            que é responsável pelo cumprimento de todas as leis locais aplicáveis.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Uso da Plataforma</h2>
          
          <p>
            O conteúdo do Lab Hack é fornecido exclusivamente para fins educacionais e informativos
            na área de segurança cibernética e hacking ético. Todo o conhecimento e técnicas
            compartilhados devem ser utilizados apenas em ambientes autorizados e legais.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Responsabilidade do Usuário</h2>
          
          <p>
            Os usuários são inteiramente responsáveis pelo uso que fazem das informações
            disponibilizadas na plataforma. Qualquer uso indevido dessas informações para
            atividades ilegais ou antiéticas não é apoiado nem endossado pelo Lab Hack.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Conteúdo do Usuário</h2>
          
          <p>
            Ao submeter conteúdo para publicação no Lab Hack, você garante que possui os direitos
            necessários sobre esse material e concede à plataforma uma licença não-exclusiva para
            usar, reproduzir e distribuir esse conteúdo no contexto do site.
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

export default Termos;

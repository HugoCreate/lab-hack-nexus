
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Sobre = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          Sobre o <span className="text-cyber-purple">Lab Hack</span>
        </h1>
        
        <div className="space-y-6 text-muted-foreground">
          <p>
            O Lab Hack é uma comunidade dedicada a entusiastas e profissionais de segurança cibernética
            e hacking ético. Nossa missão é promover o conhecimento, as melhores práticas e a ética
            na área de segurança da informação.
          </p>
          
          <p>
            Fundado em 2023, o Lab Hack surgiu da necessidade de um espaço onde pessoas interessadas
            em segurança cibernética pudessem compartilhar experiências, aprender novas técnicas e
            crescer profissionalmente em um ambiente colaborativo e ético.
          </p>
          
          <p>
            Nossos valores fundamentais incluem:
          </p>
          
          <ul className="list-disc pl-6 space-y-2">
            <li>Ética em todas as atividades relacionadas à segurança</li>
            <li>Compartilhamento aberto de conhecimento</li>
            <li>Respeito à privacidade e às leis</li>
            <li>Aprendizado contínuo e colaboração</li>
            <li>Diversidade e inclusão na comunidade tech</li>
          </ul>
          
          <p>
            Através de tutoriais detalhados, artigos informativos e desafios práticos,
            buscamos capacitar nossa comunidade com habilidades relevantes e atualizadas
            em um campo que evolui rapidamente.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Sobre;

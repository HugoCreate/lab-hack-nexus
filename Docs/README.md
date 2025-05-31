## 📁 Estrutura da Documentação

```
/
├─ Docs/                                      # Documentação técnica do projeto
│   ├── README.md                             # Guia rápido sobre os diagramas
│   ├── documentacao-completa.md              # Documentação técnica completa
│   ├── plantuml-system-architecture.puml     # Arquitetura geral
│   ├── plantuml-component-diagram.puml       # Componentes React
│   ├── plantuml-api-sequence.puml            # Sequência da API
│   ├── plantuml-user-journey.puml            # Jornada do usuário
│   ├── plantuml-authentication-flow.puml     # Fluxo de autenticação
│   ├── plantuml-database-schema.puml         # Schema do banco
│   ├── plantuml-data-flow.puml               # Fluxo de dados
│   ├── plantuml-infrastructure.puml          # Infraestrutura
│   ├── plantuml-deployment.puml              # Deployment
│   ├── plantuml-security-model.puml          # Modelo de segurança
│   └── *.png                                 # Imagens geradas automaticamente
│
├─ node_modules/                              # Pacotes e dependências instaladas
├─ public/                                    # Arquivos estáticos públicos
├─ src/                                       # Código-fonte principal do projeto
│   ├── components/                           # Componentes reutilizáveis (botões, inputs, etc.)
│   ├── contexts/                             # Contextos globais (auth, tema, etc.)
│   ├── hooks/                                # Hooks personalizados (ex: `useSupabase`)
│   ├── integrations/                         # Integrações externas (ex: Supabase)
│   ├── lib/                                  # Funções utilitárias e lógica compartilhada
│   ├── pages/                                # Páginas e rotas principais da aplicação
│
├─ supabase/                                  # Estrutura e scripts do banco de dados Supabase
│
├─ .gitignore                                 # Arquivos ignorados pelo Git
├─ bun.lockb                                  # Lockfile do Bun (gerenciador de pacotes)
├─ components.json                            # Registro de componentes (autoimportações/tooling)
├─ eslint.config.js                           # Configuração do ESLint
├─ index.html                                 # HTML base usado pelo Vite
├─ package.json                               # Dependências e scripts do projeto
├─ postcss.config.js                          # Configurações do PostCSS
├─ tailwind.config.ts                         # Configuração do Tailwind CSS
├─ tsconfig.app.json                          # Configuração TypeScript para app
├─ tsconfig.json                              # Configuração base do TypeScript
├─ tsconfig.node.json                         # Configuração TypeScript para Node
├─ vite.config.ts                             # Configuração do Vite (build, dev, plugins)

```


### ActionTypes
Uma ação para um ToasterToast é nada mais nada menos do que a maneira com que ele deve aparecer no documento. 
```TypeScript
type actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST",
}
```

---
## useSavedPost.tsx
Adiciona ou remove um post da tabela de posts salvos. 

### Descrição
Verifica se o post já foi salvo, tendo o usuário logado e o posto adicion, caso tenha sido ele é "de-salvo" e é deletado da tabela no supabase. Mostra um toast quando remove o post. Caso contrário adicionada o posta na tabela de posts salvos e mostra um toast no sucesso. 

# `intregations/`
- [ ] documentar integrações

# `lib/`
- [ ] documentar bibliotecas

# `supabase/`
- [ ] documentar conexao com supabase

Migrações do supabase
<!-- Ler sobre migration no supabase, npm supabase.js -->
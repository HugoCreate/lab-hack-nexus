# Documentação Completa - Lab Hack Nexus

## Visão Geral do Projeto

O **Lab Hack Nexus** é uma plataforma web de comunidade voltada para entusiastas e profissionais de segurança cibernética e hacking ético. A aplicação permite que usuários compartilhem conhecimento através de posts categorizados, comentários e interações sociais.

## Arquitetura do Sistema

### Stack Tecnológico

**Frontend:**
- React 18.3.1 com TypeScript
- Vite como build tool
- TailwindCSS para estilização
- shadcn/ui para componentes UI
- React Router DOM para navegação
- React Query para gerenciamento de estado
- React Hook Form para formulários

**Backend:**
- FastAPI (Python) - API REST
- Supabase como BaaS (Backend as a Service)
- PostgreSQL (através do Supabase)
- Supabase Auth para autenticação
- Supabase Storage para arquivos

**DevOps & Deployment:**
- Docker e Docker Compose
- Nginx como proxy reverso

## Estrutura do Banco de Dados

### Tabelas Principais

1. **profiles** - Perfis de usuários
   - id (string, PK)
   - username (string, unique)
   - avatar_url (string, nullable)
   - bio (string, nullable)
   - is_admin (boolean, default: false)
   - created_at (timestamp)
   - updated_at (timestamp)

2. **categories** - Categorias dos posts
   - id (string, PK)
   - name (string)
   - slug (string, unique)
   - description (string, nullable)
   - created_at (timestamp)
   - updated_at (timestamp)

3. **posts** - Posts do blog
   - id (string, PK)
   - title (string)
   - content (string)
   - slug (string, unique)
   - author_id (string, FK -> profiles.id)
   - category_id (string, FK -> categories.id, nullable)
   - published (boolean, default: false)
   - thumbnail_url (string, nullable)
   - created_at (timestamp)
   - updated_at (timestamp)

4. **comments** - Comentários nos posts
   - id (string, PK)
   - content (string)
   - post_id (string, FK -> posts.id)
   - user_id (string, FK -> profiles.id)
   - created_at (timestamp)
   - updated_at (timestamp)

5. **saved_posts** - Posts salvos pelos usuários
   - id (string, PK)
   - post_id (string, FK -> posts.id)
   - user_id (string, FK -> profiles.id)
   - created_at (timestamp)

6. **website_content** - Conteúdo editável do site
   - id (string, PK)
   - page_name (string)
   - content (JSON)
   - updated_by (string, FK -> profiles.id)
   - created_at (timestamp)
   - updated_at (timestamp)

### Storage Buckets

1. **avatars** - Armazenamento de avatares de usuários
2. **post-thumbnails** - Armazenamento de thumbnails de posts

## API Endpoints

### Autenticação
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login de usuário

### Posts
- `GET /posts` - Listar posts (com filtros)
- `POST /posts` - Criar post (auth required)
- `GET /posts/{post_id}` - Obter post específico
- `PUT /posts/{post_id}` - Atualizar post (auth required)
- `DELETE /posts/{post_id}` - Deletar post (auth required)

### Comentários
- `GET /posts/{post_id}/comments` - Listar comentários de um post
- `POST /posts/{post_id}/comments` - Criar comentário (auth required)

### Categorias
- `GET /categories` - Listar categorias
- `POST /categories` - Criar categoria (auth required)

### Perfis
- `GET /profiles/{user_id}` - Obter perfil de usuário
- `PUT /profiles/{user_id}` - Atualizar perfil (auth required)

### Posts Salvos
- `POST /posts/{post_id}/save` - Salvar post (auth required)
- `DELETE /posts/{post_id}/unsave` - Remover post salvo (auth required)
- `GET /saved-posts` - Listar posts salvos (auth required)

### Conteúdo do Site
- `GET /website-content/{page_name}` - Obter conteúdo de página
- `POST /website-content` - Criar/atualizar conteúdo (admin required)

## Funcionalidades Principais

### Sistema de Autenticação
- Registro e login de usuários
- Gestão de perfis de usuário
- Sistema de permissões (admin/usuário)
- Upload de avatar

### Sistema de Posts
- Criação, edição e exclusão de posts
- Sistema de categorias
- Publicação/rascunho
- Upload de thumbnails
- Slugs amigáveis para SEO

### Sistema de Interação Social
- Comentários em posts
- Sistema de posts salvos/favoritos
- Compartilhamento de posts

### Painel Administrativo
- Gestão de conteúdo do site
- Moderação de posts e comentários
- Gestão de categorias

### Recursos de UX/UI
- Tema claro/escuro
- Design responsivo
- Interface cyberpunk
- Loading states e feedback visual

## Arquitetura de Componentes React

### Páginas Principais
- `Index` - Página inicial
- `Posts` - Lista de posts
- `PostPage` - Visualização de post individual
- `Categories` - Lista de categorias
- `CategoryPage` - Posts de uma categoria
- `Login/Register` - Autenticação
- `AccountSettings` - Configurações da conta
- `CreatePost` - Criação de posts
- `UserPosts` - Posts do usuário
- `AdminDashboard` - Painel administrativo
- `SavedPosts` - Posts salvos

### Componentes Reutilizáveis
- `Navbar` - Navegação principal
- `Footer` - Rodapé
- `PostCard` - Card de post
- `CategoryCard` - Card de categoria
- `CommentSection` - Seção de comentários
- `CreatePostForm` - Formulário de criação de post
- `WebsiteEditor` - Editor de conteúdo do site
- `SharePost` - Compartilhamento de posts
- `ThemeToggle` - Alternador de tema

### Contextos
- `AuthContext` - Gerenciamento de autenticação
- `ThemeContext` - Gerenciamento de tema

### Hooks Customizados
- `useSavedPosts` - Gestão de posts salvos
- `use-toast` - Sistema de notificações

## Fluxos de Dados

### Fluxo de Autenticação
1. Usuário faz login/registro
2. Supabase Auth processa credenciais
3. AuthContext atualiza estado global
4. Redirecionamento para página apropriada

### Fluxo de Criação de Post
1. Usuário acessa `/create-post`
2. Preenche formulário
3. Upload de thumbnail (opcional)
4. Envio para API
5. Criação no banco de dados
6. Redirecionamento para post criado

### Fluxo de Comentários
1. Usuário visualiza post
2. Carregamento automático de comentários
3. Adição de novo comentário
4. Atualização em tempo real da lista

## Configuração e Deploy

### Variáveis de Ambiente
```env
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Docker
O projeto inclui configuração completa do Docker:
- `Dockerfile` para o frontend
- `docker-compose.yml` para orquestração
- Nginx como proxy reverso

### Estrutura de Pastas
```
lab-hack-nexus/
├── api/                    # Backend FastAPI
│   ├── database.py         # Configuração Supabase
│   ├── main.py            # Rotas da API
│   ├── models.py          # Modelos Pydantic
│   └── requirements.txt   # Dependências Python
├── src/                   # Frontend React
│   ├── components/        # Componentes React
│   ├── contexts/          # Contextos React
│   ├── hooks/            # Hooks customizados
│   ├── integrations/     # Integrações (Supabase)
│   ├── lib/              # Utilitários
│   └── pages/            # Páginas da aplicação
├── supabase/             # Configurações Supabase
│   └── migrations/       # Migrações do banco
├── Docs/                 # Documentação
├── docker-compose.yml    # Configuração Docker
└── package.json          # Dependências Node.js
```

## Segurança

### Autenticação e Autorização
- JWT tokens via Supabase Auth
- Row Level Security (RLS) no banco
- Validação de permissões na API
- Proteção de rotas sensíveis

### Validação de Dados
- Validação frontend com React Hook Form + Zod
- Validação backend com Pydantic
- Sanitização de inputs
- Proteção contra XSS e SQL Injection

### Upload de Arquivos
- Tipos de arquivo permitidos
- Limites de tamanho
- Storage policies no Supabase

## Monitoramento e Logging

### Logs da Aplicação
- Logs de erro no console
- Tracking de navegação
- Logs de autenticação

### Performance
- Lazy loading de componentes
- Otimização de queries
- Cache de dados com React Query

## Roadmap Futuro

### Funcionalidades Planejadas
- Sistema de notificações em tempo real
- Chat/mensagens privadas
- Sistema de reputação/pontuação
- Busca avançada
- Tags para posts
- Sistema de likes/dislikes
- API pública com rate limiting
- Integração com redes sociais
- PWA (Progressive Web App)

### Melhorias Técnicas
- Testes automatizados (Jest, Cypress)
- CI/CD pipeline
- Monitoramento com Sentry
- Analytics com Google Analytics
- SEO otimizado
- Internacionalização (i18n)

## Licença e Contribuição

Este projeto é open source e aceita contribuições da comunidade. Consulte os arquivos de termos de uso e política de privacidade para mais informações sobre uso e políticas de dados.

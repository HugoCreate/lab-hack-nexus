# Lab Hack
# Paginas `pages/`

Segue a lista de todas as páginas em ordem alfabética.

## ``Account Settings.tsx``
## ``Admin Dashboard.tsx``
## ``Categories.tsx``
## ``CategoryPage.tsx``
## ``CreatePost.tsx``
## ``Index.tsx``
## ``Login.tsx``
## ``NotFound.tsx``
## ``PostPage.tsx``
## ``Posts.tsx``
## ``Privacidade.tsx``
## ``Register.tsx``
## ``SavedPosts.tsx``
## ``Sobre.tsx``
## ``Termos.tsx``
## ``UserPosts.tsx``

# Componentes `components/`

Todos os componentes do projeto

## ``CategoryCard.tsx``
## ``CommentsSection.tsx``
## ``CreatePostForm.tsx``
## ``Footer.tsx``
## ``HeroSection.tsx``
## ``Navbar.tsx``
## ``PostCard.tsx``
## ``SharePost.tsx``
## ``ThemeToggle.tsx``
## ``WebsiteEditor.tsx``

## UI `components/ui`
Eu não abro mais essa pasta nem me pagando.
### `toast.tsx`

# Contexts

<!-- ler sobre useContext, Context e AuthContext -->

# Hooks
Hooks customizados feitos para facilitar algumas funções ou busca por variáveis que acontecem no programa todo. 
## use-mobile.tsx

Um hook que verifica se o aplicativo está rodando mobile ou não.

### Descrição
Salva um breakpoint genérico para tamanho de celular. Nisso ele cria um `MediaQueryList` com mais ou menos esse tamanho. E se o a largura da tela for menor od que isso, entao ele adicioana o event listener ao MediaQueryList, onChange. Atribui um estado para se é mobile ou não. **em resumo:** Retorna se é mobile ou não. 

### `window.matchMedia(mediaQueryString)`

#### ``return``
**Retorna** `MediaQueryList` 

#### propriedades
* `matches` retorna um boleano que é true se o document atual bate com o media query list.
* `media` um string representando uma media query 
Ambas propriedades são `read-only` por motivos óbvios.
#### métodos
Herda os métodos do seu pai, `EventTarget`.

---

## use-toast.ts
Um hook que permite voce criar um componente TSX de um Toast com poucas variáveis.

### ToasterToast
ToasterToast será o tipo que deve ser passado como parametro para a construção de um toast. Basta um id, titulo do toast, descrição que será o texto do componente e uma ação.

- [ ] ler sobre ToastProps em `src/components/ui/toast.tsx`
- [ ] documentar ou apagar `toast.tsx`

```TypeScript
type ToasterToast = ToastProps & (
    id: string
    title?: React.ReactNode
    description?: React.ReactNode
    action?: ToastActionElement
)
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
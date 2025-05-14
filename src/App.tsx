
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import Posts from "./pages/Posts";
import CategoryPage from "./pages/CategoryPage";
import PostPage from "./pages/PostPage";
import SavedPosts from "./pages/SavedPosts";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AccountSettings from "./pages/AccountSettings";
import CreatePost from "./pages/CreatePost";
import UserPosts from "./pages/UserPosts";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Sobre from "./pages/Sobre";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/post/:slug" element={<PostPage />} />
            <Route path="/saved-posts" element={<SavedPosts />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/account/settings" element={<AccountSettings />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/account/posts" element={<UserPosts />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

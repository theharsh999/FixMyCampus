import { useState } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentUser } from '@/lib/store';
import { ThemeProvider } from '@/hooks/use-theme';
import AppHeader from '@/components/AppHeader';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import StudentDashboard from '@/pages/StudentDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import SubmitComplaint from '@/pages/SubmitComplaint';
import RegisterPage from '@/pages/RegisterPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFound from "./pages/NotFound.jsx";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState(getCurrentUser());

  const refresh = () => setUser(getCurrentUser());

  return (
    <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {user && <AppHeader user={user} onLogout={refresh} />}
          <Routes>
            <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <LandingPage />} />
            <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <LoginPage onLogin={refresh} />} />
            <Route path="/register" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <RegisterPage />} />
            <Route path="/dashboard" element={user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} />
            <Route path="/submit" element={user?.role === 'student' ? <SubmitComplaint /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <ProfilePage onProfileUpdate={refresh} /> : <Navigate to="/login" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;

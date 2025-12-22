import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "@/contexts/ThemeContext";
<<<<<<< Updated upstream

// New Imports ⬇⬇
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
=======
import { AuthProvider } from "@/contexts/AuthContext";
>>>>>>> Stashed changes

import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const App = () => {
<<<<<<< Updated upstream
  // Create QueryClient inside component to avoid hot reload issues
=======
>>>>>>> Stashed changes
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
<<<<<<< Updated upstream
          queries: {
            refetchOnWindowFocus: false,
          },
=======
          queries: { refetchOnWindowFocus: false },
>>>>>>> Stashed changes
        },
      })
  );

  return (
<<<<<<< Updated upstream
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <UserProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />

              <BrowserRouter>
                <Routes>
                  {/* ---------- Main App ---------- */}
                  <Route path="/" element={<Index />} />

                  {/* ---------- Auth Pages ---------- */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/profile" element={<Profile />} />

                  {/* ---------- Admin Page ---------- */}
                  <Route path="/admin" element={<Admin />} />

                  {/* ---------- Fallback ---------- */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </UserProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
=======
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
>>>>>>> Stashed changes
  );
};

export default App;
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Index from "./pages/Index";
import Hospitals from "./pages/Hospitals";
import AlertsPage from "./pages/Alerts";
import NotFound from "./pages/NotFound";
import ArduinoConnect from "./components/ArduinoConnect";
import Header from "./components/Header";

const queryClient = new QueryClient();

const App = () => {
  return (
    <div className="dark bg-neutral-900 text-white min-h-screen transition-all duration-300">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          {/* 🔴 Router MUST wrap AuthProvider */}
          <BrowserRouter>
            <AuthProvider>
              <AppShell />
            </AuthProvider>
          </BrowserRouter>

        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
};

const AppShell = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <>
      {user && <Header />}

      <main
        id="main"
        role="main"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <Routes>
          <Route path="/login" element={<Login />} />

          {user ? (
            <>
              <Route path="/" element={<Index />} />
              <Route path="/arduino" element={<ArduinoConnect />} />
              <Route path="/hospitals" element={<Hospitals />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="*" element={<NotFound />} />
            </>
          ) : (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Login />} />
            </>
          )}
        </Routes>
      </main>
    </>
  );
};

export default App;
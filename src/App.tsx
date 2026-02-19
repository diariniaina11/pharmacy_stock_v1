import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import MainLayout from "@/components/layout/MainLayout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Sales from "@/pages/Sales";
import Expirations from "@/pages/Expirations";
import Requests from "@/pages/Requests";
import Validation from "@/pages/Validation";
import History from "@/pages/History";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "@/authguard/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Routes publiques */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Routes protégées */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/produits" element={<Products />} />
                <Route path="/ventes" element={<Sales />} />
                <Route path="/peremptions" element={<Expirations />} />
                <Route path="/demandes" element={<Requests />} />
                <Route path="/validation" element={<Validation />} />
                <Route path="/historique" element={<History />} />
              </Route>

              {/* Redirection par défaut */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;

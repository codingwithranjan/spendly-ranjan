import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Categories from "@/pages/Categories";
import Budgets from "@/pages/Budgets";
import Recurring from "@/pages/Recurring";
import SavingsGoals from "@/pages/SavingsGoals";
import Insights from "@/pages/Insights";
import Profile from "@/pages/Profile";
import Export from "@/pages/Export";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
              <Route path="/transactions" element={<ProtectedPage><Transactions /></ProtectedPage>} />
              <Route path="/categories" element={<ProtectedPage><Categories /></ProtectedPage>} />
              <Route path="/budgets" element={<ProtectedPage><Budgets /></ProtectedPage>} />
              <Route path="/recurring" element={<ProtectedPage><Recurring /></ProtectedPage>} />
              <Route path="/savings" element={<ProtectedPage><SavingsGoals /></ProtectedPage>} />
              <Route path="/insights" element={<ProtectedPage><Insights /></ProtectedPage>} />
              <Route path="/profile" element={<ProtectedPage><Profile /></ProtectedPage>} />
              <Route path="/export" element={<ProtectedPage><Export /></ProtectedPage>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

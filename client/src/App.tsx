import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";

// Pages
import ReceptionPage from "@/pages/reception";
import LoginPage from "@/pages/login";
import OverviewPage from "@/pages/admin/overview";
import ProductsPage from "@/pages/admin/products";
import OrdersPage from "@/pages/admin/orders";
import AppointmentsPage from "@/pages/admin/appointments";
import NotFound from "@/pages/not-found";

// Protected Route Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Redirect to="/login" />;
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={ReceptionPage} />
      <Route path="/login" component={LoginPage} />

      {/* Admin Protected Routes */}
      <Route path="/admin">
        {() => <ProtectedRoute component={OverviewPage} />}
      </Route>
      <Route path="/admin/products">
        {() => <ProtectedRoute component={ProductsPage} />}
      </Route>
      <Route path="/admin/orders">
        {() => <ProtectedRoute component={OrdersPage} />}
      </Route>
      <Route path="/admin/appointments">
        {() => <ProtectedRoute component={AppointmentsPage} />}
      </Route>

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

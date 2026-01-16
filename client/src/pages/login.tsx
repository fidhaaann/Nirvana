import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user) return <Redirect to="/admin" />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-purple-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-blue-200 rounded-full blur-3xl opacity-30" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-gray-200 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary font-bold text-2xl">
              R
            </div>
            <h1 className="font-display font-bold text-2xl text-gray-900">Admin Portal</h1>
            <p className="text-sm text-muted-foreground">Sign in to manage your reception AI</p>
          </CardHeader>
          <CardContent className="pt-6">
            <Button 
              className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30" 
              onClick={() => window.location.href = "/api/login"}
            >
              Sign In with Replit
            </Button>
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Protected area. Authorized personnel only.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

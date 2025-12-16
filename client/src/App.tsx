import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { usePageTransition } from "@/hooks/use-page-transition";
import { WhatsAppButton } from "./components/WhatsAppButton";

// Critical pages loaded immediately
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load other pages for better performance
const Features = lazy(() => import("./pages/Features"));
const Industries = lazy(() => import("./pages/Industries"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const FreeTrial = lazy(() => import("./pages/FreeTrial"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Login = lazy(() => import("./pages/Login"));

// Admin pages - lazy loaded
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminArticleList = lazy(() => import("./pages/admin/ArticleList"));
const AdminArticleForm = lazy(() => import("./pages/admin/ArticleForm"));
const AdminContactsList = lazy(() => import("./pages/admin/ContactsList"));
const AdminTrialsList = lazy(() => import("./pages/admin/TrialsList"));
const AdminUsersList = lazy(() => import("./pages/admin/UsersList"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as any,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as any,
    },
  },
};

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {children}
    </motion.div>
  );
}

function Router() {
  const [location] = useLocation();
  
  const routeElement = (
    <Switch>
      <Route path="/" component={Index} />
      <Route path="/features" component={Features} />
      <Route path="/industries" component={Industries} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/contact" component={Contact} />
      <Route path="/about" component={About} />
      <Route path="/free-trial" component={FreeTrial} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/contacts" component={AdminContactsList} />
      <Route path="/admin/trials" component={AdminTrialsList} />
      <Route path="/admin/users" component={AdminUsersList} />
      <Route path="/admin/articles" component={AdminArticleList} />
      <Route path="/admin/articles/new" component={AdminArticleForm} />
      <Route path="/admin/articles/:id/edit" component={AdminArticleForm} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route component={NotFound} />
    </Switch>
  );
  
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location}>
        {routeElement}
      </PageTransition>
    </AnimatePresence>
  );
}

function AppContent() {
  usePageTransition();
  
  return (
    <>
      <Toaster />
      <Sonner />
      <Suspense fallback={<PageLoader />}>
        <Router />
      </Suspense>
      <WhatsAppButton />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

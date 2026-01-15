import { renderToString } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, Router } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import Features from "./pages/Features";
import Industries from "./pages/Industries";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import About from "./pages/About";
import FreeTrial from "./pages/FreeTrial";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";

interface HelmetData {
  title?: { toString(): string };
  meta?: { toString(): string };
  link?: { toString(): string };
  script?: { toString(): string };
}

interface SSRResult {
  html: string;
  helmet: {
    title: string;
    meta: string;
    link: string;
    script: string;
  };
}

function AppRoutes() {
  return (
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
      <Route component={NotFound} />
    </Switch>
  );
}

export function render(url: string, initialData?: Record<string, unknown>): SSRResult {
  const helmetContext: Record<string, any> = {};
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: false,
      },
    },
  });

  if (initialData) {
    Object.entries(initialData).forEach(([key, data]) => {
      queryClient.setQueryData([key], data);
    });
  }

  const useStaticLocation = (): [string, (to: string) => void] => {
    return [url, () => {}];
  };

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router hook={useStaticLocation}>
            <div className="min-h-screen" dir="rtl">
              <AppRoutes />
            </div>
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );

  const helmet = helmetContext.helmet;

  return {
    html,
    helmet: {
      title: helmet?.title?.toString() || "",
      meta: helmet?.meta?.toString() || "",
      link: helmet?.link?.toString() || "",
      script: helmet?.script?.toString() || "",
    },
  };
}

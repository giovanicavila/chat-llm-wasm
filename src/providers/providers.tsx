import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/contexts/theme-context";
import { AppRoutes } from "@/routes/routes";

const queryClient = new QueryClient();

export function Providers() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <SidebarProvider>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <AppRoutes />
          </ThemeProvider>
        </SidebarProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

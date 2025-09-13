import React, { ReactElement } from "react";
import { render, RenderOptions, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";

// Mock auth context
const mockAuthContext = {
  token: null,
  user: null,
  login: jest.fn(),
  logout: jest.fn(),
  isLoading: false,
  refreshUser: jest.fn(),
  hasPermission: jest.fn(() => false),
};

jest.mock("@/contexts/auth-context", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => mockAuthContext,
}));

// Mock providers
const Providers = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>{children}</SidebarProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: Providers, ...options });

// Export configured modules
export * from "@testing-library/react";
export { customRender as render, screen, waitFor };

export { mockAuthContext };

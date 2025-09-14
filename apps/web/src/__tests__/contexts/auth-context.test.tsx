import React from "react";
import { render as rtlRender, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import api from "@/lib/api";

// Mock API module
jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Custom render function with ONLY query client
const render = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return rtlRender(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

const getMockToken = () => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      sub: "1",
    })
  );
  const signature = "mock-signature";
  return `${header}.${payload}.${signature}`;
};

// Test component with access to auth context
const TestProbe = () => {
  const { token, user, isLoading, hasPermission } = useAuth();

  return (
    <div>
      <div data-testid="token">{token || "null"}</div>
      <div data-testid="user">{user ? user.email : "null"}</div>
      <div data-testid="isLoading">{isLoading.toString()}</div>
      <div data-testid="hasPermission">
        {hasPermission("patient:list").toString()}
      </div>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("provides initial state correctly", async () => {
    render(
      <AuthProvider>
        <TestProbe />
      </AuthProvider>
    );

    // Wait for the initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId("isLoading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("token")).toHaveTextContent("null");
    expect(screen.getByTestId("user")).toHaveTextContent("null");
    expect(screen.getByTestId("hasPermission")).toHaveTextContent("false");
  });

  it("loads token from local storage on mount", async () => {
    const mockToken = getMockToken();

    localStorage.setItem("token", mockToken);

    // Mock successful profile fetch
    mockApi.get.mockResolvedValue({
      data: {
        id: 1,
        email: "test@example.com",
        role: "USER",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });

    render(
      <AuthProvider>
        <TestProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("token")).toHaveTextContent(mockToken);
    });
  });

  it("handles profile fetch error gracefully", async () => {
    const mockToken = getMockToken();

    localStorage.setItem("token", mockToken);

    // Mock failed profile fetch
    mockApi.get.mockRejectedValue({
      response: { status: 401 },
    });

    render(
      <AuthProvider>
        <TestProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("null");
    });
  });
});

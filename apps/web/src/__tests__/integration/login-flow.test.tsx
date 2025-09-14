import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import LoginPage from "@/app/(auth)/login/page";
import api from "@/lib/api";

const mockedApi = api as unknown as {
  post: jest.Mock;
  get: jest.Mock;
};

const TestProbe = () => {
  const { user } = useAuth();
  return <div data-testid="user-email">{user?.email ?? "no-user"}</div>;
};

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {ui}
        <TestProbe />
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe("Login flow integration", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
    mockedApi.post.mockReset();
    mockedApi.get.mockReset();
  });

  it("logs in successfully, stores token, and fetches profile", async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 60 * 60;
    const payload = btoa(JSON.stringify({ exp: futureExp }));
    const token = `header.${payload}.signature`;

    // Mock API calls
    mockedApi.post.mockResolvedValueOnce({
      data: { access_token: token },
    });
    mockedApi.get.mockResolvedValueOnce({
      data: {
        id: 1,
        email: "test@example.com",
        role: "ADMIN",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    renderWithProviders(<LoginPage />);

    // Perform user actions
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@example.com",
        password: "password123",
      });
    });

    // Token should be stored
    expect(localStorage.getItem("token")).toBe(token);

    // Profile should be fetched after token is set
    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith("/auth/profile");
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "test@example.com"
      );
    });
  });

  it("shows error on invalid credentials (401)", async () => {
    // Mock API calls
    mockedApi.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 401 },
    });

    renderWithProviders(<LoginPage />);

    // Perform user actions
    await user.type(screen.getByLabelText("Email"), "wrong@example.com");
    await user.type(screen.getByLabelText("Password"), "wrongpass");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });

    expect(localStorage.getItem("token")).toBeNull();
    expect(mockedApi.get).not.toHaveBeenCalled();
    expect(screen.getByTestId("user-email")).toHaveTextContent("no-user");
  });
});

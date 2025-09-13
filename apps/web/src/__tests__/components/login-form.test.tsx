import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render, mockAuthContext } from "../../utils/test-utils";
import { LoginForm } from "@/components/features/auth/login-form";
import api from "@/lib/api";

// Mock API module
const mockApi = api as jest.Mocked<typeof api>;

// Mock auth context
jest.mock("@/contexts/auth-context", () => ({
  useAuth: () => mockAuthContext,
}));

describe("LoginForm", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock
    mockApi.post.mockResolvedValue({
      data: { access_token: "mock-token" },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });
  });

  describe("Form Rendering", () => {
    it("renders the login form with all required elements", () => {
      render(<LoginForm />);

      expect(screen.getByText("Welcome back")).toBeInTheDocument();
      expect(
        screen.getByText("Please login with your email and password")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    });

    it("has correct input types and attributes", () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("placeholder", "user@example.com");
      expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  describe("Form Validation", () => {
    it("shows validation error for invalid email", async () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const submitButton = screen.getByRole("button", { name: "Login" });

      await user.type(emailInput, "invalid-email");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
      });
    });

    it("shows validation error for empty email", async () => {
      render(<LoginForm />);

      const submitButton = screen.getByRole("button", { name: "Login" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
      });
    });

    it("shows validation error for empty password", async () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const submitButton = screen.getByRole("button", { name: "Login" });

      await user.type(emailInput, "test@example.com");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Password is required")).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("calls API with correct data on valid submission", async () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Login" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/auth/login", {
          email: "test@example.com",
          password: "password123",
        });
      });
    });

    it("calls login function with token on successful submission", async () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Login" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthContext.login).toHaveBeenCalledWith("mock-token");
      });
    });

    it("disables submit button while submitting", async () => {
      // Mock delayed API response
      mockApi.post.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: { access_token: "mock-token" },
                  status: 200,
                  statusText: "OK",
                  headers: {},
                  config: {},
                }),
              100
            )
          )
      );

      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Login" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it("does not submit form with invalid data", async () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const submitButton = screen.getByRole("button", { name: "Login" });

      await user.type(emailInput, "invalid-email");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).not.toHaveBeenCalled();
      });
    });
  });

  describe("Error Handling", () => {
    it("displays server error for 401 status", async () => {
      mockApi.post.mockRejectedValue({
        response: { status: 401 },
        isAxiosError: true,
      });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Login" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });
    });

    it("displays generic error for other API errors", async () => {
      mockApi.post.mockRejectedValue({
        response: { status: 500 },
        isAxiosError: true,
      });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Login" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      });
    });

    it("clears server error when user submits again", async () => {
      // First submission fails
      mockApi.post
        .mockRejectedValueOnce({
          response: { status: 401 },
          isAxiosError: true,
        })
        .mockResolvedValueOnce({
          data: { access_token: "mock-token" },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {},
        });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Login" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      // First submission
      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });

      // Second submission
      await user.click(submitButton);
      await waitFor(() => {
        expect(
          screen.queryByText("Invalid credentials")
        ).not.toBeInTheDocument();
        expect(mockAuthContext.login).toHaveBeenCalledWith("mock-token");
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes for form validation", async () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Login" });

      // Trigger validation
      await user.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toHaveAttribute("aria-invalid", "true");
        expect(passwordInput).toHaveAttribute("aria-invalid", "true");
      });
    });

    it("has proper form labels and associations", () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      expect(emailInput).toHaveAttribute("id", "email");
      expect(passwordInput).toHaveAttribute("id", "password");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty form submission", async () => {
      render(<LoginForm />);

      const submitButton = screen.getByRole("button", { name: "Login" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
        expect(screen.getByText("Password is required")).toBeInTheDocument();
        expect(mockApi.post).not.toHaveBeenCalled();
      });
    });
  });
});

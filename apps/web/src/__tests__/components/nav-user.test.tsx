import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render, mockAuthContext } from "../../utils/test-utils";
import { NavUser } from "@/components/features/dashboard/nav-user";

describe("NavUser", () => {
  const user = userEvent.setup();

  const mockUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://example.com/avatar.jpg",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("User Display", () => {
    it("renders user information correctly", () => {
      render(<NavUser user={mockUser} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
    });

    it("displays user information in dropdown menu", async () => {
      render(<NavUser user={mockUser} />);

      // Click to open dropdown
      const trigger = screen.getByRole("button");
      await user.click(trigger);

      await waitFor(() => {
        // Check that user info appears twice - once in trigger, once in dropdown
        const nameElements = screen.getAllByText("John Doe");
        const emailElements = screen.getAllByText("john.doe@example.com");

        expect(nameElements).toHaveLength(2);
        expect(emailElements).toHaveLength(2);
      });
    });
  });

  describe("Logout Functionality", () => {
    it("calls logout function when logout button is clicked", async () => {
      render(<NavUser user={mockUser} />);

      // Click to open dropdown
      const trigger = screen.getByRole("button");
      await user.click(trigger);

      // Wait for dropdown to open and click logout
      await waitFor(() => {
        const logoutButton = screen.getByText("Log out");
        expect(logoutButton).toBeInTheDocument();
      });

      const logoutButton = screen.getByText("Log out");
      await user.click(logoutButton);

      expect(mockAuthContext.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe("Logout behaviour", () => {
    it("handles auth context logout function calls", async () => {
      render(<NavUser user={mockUser} />);

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      await waitFor(() => {
        const logoutButton = screen.getByText("Log out");
        expect(logoutButton).toBeInTheDocument();
      });

      const logoutButton = screen.getByText("Log out");
      await user.click(logoutButton);

      expect(mockAuthContext.logout).toHaveBeenCalledTimes(1);
    });
  });
});

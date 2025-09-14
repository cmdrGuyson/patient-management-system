/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render, mockAuthContext } from "../../utils/test-utils";
import { PatientTable } from "@/components/features/dashboard/patient-table";
import { usePatients, useDeletePatient } from "@/hooks/use-patients";
import { Patient } from "@/types";
import { PERMISSIONS } from "@/lib/auth";
import { toast } from "sonner";

// Mock the hooks
jest.mock("@/hooks/use-patients");
const mockUsePatients = usePatients as jest.MockedFunction<typeof usePatients>;
const mockUseDeletePatient = useDeletePatient as jest.MockedFunction<
  typeof useDeletePatient
>;

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock data
const mockPatients: Patient[] = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phoneNumber: "+1234567890",
    dob: "1990-01-01",
    additionalInformation: "Allergic to penicillin",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phoneNumber: "+1234567891",
    dob: "1985-05-15",
    additionalInformation: "No known allergies",
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
  },
  {
    id: 3,
    firstName: "Bob",
    lastName: "Johnson",
    email: "bob.johnson@example.com",
    phoneNumber: "+1234567892",
    dob: "1992-12-25",
    createdAt: "2025-01-03T00:00:00Z",
    updatedAt: "2025-01-03T00:00:00Z",
  },
];

const mockDeleteMutation = {
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  isPending: false,
  error: null,
};

describe("PatientTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePatients.mockReturnValue({
      data: mockPatients,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      refetch: jest.fn(),
    } as any);
    mockUseDeletePatient.mockReturnValue(mockDeleteMutation as any);
  });

  describe("Data Display", () => {
    it("renders patient data correctly", () => {
      render(<PatientTable />);

      // Check if all patients are rendered
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("Doe")).toBeInTheDocument();
      expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
      expect(screen.getByText("+1234567890")).toBeInTheDocument();

      expect(screen.getByText("Jane")).toBeInTheDocument();
      expect(screen.getByText("Smith")).toBeInTheDocument();
      expect(screen.getByText("jane.smith@example.com")).toBeInTheDocument();
      expect(screen.getByText("+1234567891")).toBeInTheDocument();

      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Johnson")).toBeInTheDocument();
      expect(screen.getByText("bob.johnson@example.com")).toBeInTheDocument();
      expect(screen.getByText("+1234567892")).toBeInTheDocument();
    });

    it("renders table headers correctly", () => {
      render(<PatientTable />);

      expect(screen.getByText("First Name")).toBeInTheDocument();
      expect(screen.getByText("Last Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Phone")).toBeInTheDocument();
      expect(screen.getByText("Date of Birth")).toBeInTheDocument();
      // Actions column header is not always visible, so we'll check for action buttons instead
      const actionButtons = screen.getAllByRole("button", {
        name: /open menu/i,
      });
      expect(actionButtons.length).toBeGreaterThan(0);
    });

    it("displays loading skeleton when data is loading", () => {
      mockUsePatients.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        isSuccess: false,
        refetch: jest.fn(),
      } as any);

      render(<PatientTable />);

      // Check for skeleton loading state
      const skeletons = screen
        .getAllByRole("generic")
        .filter(
          (el) =>
            el.className.includes("animate-pulse") &&
            el.className.includes("bg-accent")
        );
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("handles empty data gracefully", () => {
      mockUsePatients.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        refetch: jest.fn(),
      } as any);

      render(<PatientTable />);

      // Table should still render with headers but no data rows
      expect(screen.getByText("First Name")).toBeInTheDocument();
      expect(screen.queryByText("John")).not.toBeInTheDocument();
    });
  });

  describe("Sorting Functionality", () => {
    it("sorts by first name ascending", async () => {
      const user = userEvent.setup();
      render(<PatientTable />);

      const firstNameHeader = screen.getByText("First Name");
      await user.click(firstNameHeader);

      // Check that sort icon changes to ascending
      const sortIcon = firstNameHeader.querySelector("svg");
      expect(sortIcon).toBeInTheDocument();

      // Verify data is sorted
      const rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("Bob");
      expect(rows[2]).toHaveTextContent("Jane");
      expect(rows[3]).toHaveTextContent("John");
    });

    it("sorts by first name descending", async () => {
      const user = userEvent.setup();
      render(<PatientTable />);

      const firstNameHeader = screen.getByText("First Name");

      // Click twice to get descending order
      await user.click(firstNameHeader);
      await user.click(firstNameHeader);

      // Verify data is sorted in descending order
      const rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("John");
      expect(rows[2]).toHaveTextContent("Jane");
      expect(rows[3]).toHaveTextContent("Bob");
    });

    it("sorts by last name", async () => {
      const user = userEvent.setup();
      render(<PatientTable />);

      const lastNameHeader = screen.getByText("Last Name");
      await user.click(lastNameHeader);

      // Verify data is sorted by last name
      const rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("Doe");
      expect(rows[2]).toHaveTextContent("Johnson");
      expect(rows[3]).toHaveTextContent("Smith");
    });

    it("sorts by email", async () => {
      const user = userEvent.setup();
      render(<PatientTable />);

      const emailHeader = screen.getByText("Email");
      await user.click(emailHeader);

      // Verify data is sorted by email
      const rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("bob.johnson@example.com");
      expect(rows[2]).toHaveTextContent("jane.smith@example.com");
      expect(rows[3]).toHaveTextContent("john.doe@example.com");
    });

    it("sorts by phone number", async () => {
      const user = userEvent.setup();
      render(<PatientTable />);

      const phoneHeader = screen.getByText("Phone");
      await user.click(phoneHeader);

      // Verify data is sorted by phone number
      const rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("+1234567890");
      expect(rows[2]).toHaveTextContent("+1234567891");
      expect(rows[3]).toHaveTextContent("+1234567892");
    });

    it("sorts by date of birth", async () => {
      const user = userEvent.setup();
      render(<PatientTable />);

      const dobHeader = screen.getByText("Date of Birth");
      await user.click(dobHeader);

      // Verify data is sorted by date of birth
      const rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("May 15, 1985");
      expect(rows[2]).toHaveTextContent("Jan 1, 1990");
      expect(rows[3]).toHaveTextContent("Dec 25, 1992");
    });
  });

  describe("Filtering Functionality", () => {
    it("filters by first name", async () => {
      const user = userEvent.setup();
      render(<PatientTable />);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "jane");

      // Should only show Jane Smith
      expect(screen.getByText("Jane")).toBeInTheDocument();
      expect(screen.getByText("Smith")).toBeInTheDocument();
      expect(screen.queryByText("John")).not.toBeInTheDocument();
      expect(screen.queryByText("Bob")).not.toBeInTheDocument();
    });

    it("filters by email", async () => {
      const user = userEvent.setup();
      render(<PatientTable />);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "bob.johnson");

      // Should only show Bob Johnson
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Johnson")).toBeInTheDocument();
      expect(screen.queryByText("John")).not.toBeInTheDocument();
      expect(screen.queryByText("Jane")).not.toBeInTheDocument();
    });

    it("filters by phone number", async () => {
      const user = userEvent.setup();
      render(<PatientTable />);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "7891");

      // Should only show Jane Smith
      expect(screen.getByText("Jane")).toBeInTheDocument();
      expect(screen.getByText("Smith")).toBeInTheDocument();
      expect(screen.queryByText("John")).not.toBeInTheDocument();
      expect(screen.queryByText("Bob")).not.toBeInTheDocument();
    });

    it("clears filter when search is cleared", async () => {
      const user = userEvent.setup();
      render(<PatientTable />);

      const searchInput = screen.getByPlaceholderText("Search...");

      // Filter by john
      await user.type(searchInput, "john");
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.queryByText("Jane")).not.toBeInTheDocument();

      // Clear search
      await user.clear(searchInput);

      // All patients should be visible again
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("Jane")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });

    it("shows no results message when no matches found", async () => {
      const user = userEvent.setup();
      render(<PatientTable />);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "nonexistent");

      // Should show no results
      expect(screen.getByText("No results.")).toBeInTheDocument();
    });
  });

  describe("Role-based Rendering", () => {
    it("shows all actions for admin users", async () => {
      const user = userEvent.setup();
      mockAuthContext.hasPermission.mockImplementation((permission: string) => {
        const adminPermissions = [
          PERMISSIONS.PATIENT_LIST,
          PERMISSIONS.PATIENT_VIEW,
          PERMISSIONS.PATIENT_CREATE,
          PERMISSIONS.PATIENT_UPDATE,
          PERMISSIONS.PATIENT_DELETE,
        ];
        return adminPermissions.includes(permission);
      });

      render(<PatientTable />);

      // Check that action buttons are visible for admin
      const actionButtons = screen.getAllByRole("button", {
        name: /open menu/i,
      });
      expect(actionButtons).toHaveLength(3); // One for each patient

      // Click on first action button to see dropdown
      const firstActionButton = actionButtons[0];
      await user.click(firstActionButton);

      // Wait for dropdown to open and check for action options
      await waitFor(() => {
        expect(screen.getByText("View patient details")).toBeInTheDocument();
        expect(screen.getByText("Edit patient")).toBeInTheDocument();
        expect(screen.getByText("Delete patient")).toBeInTheDocument();
      });
    });

    it("shows limited actions for regular users", async () => {
      const user = userEvent.setup();
      mockAuthContext.hasPermission.mockImplementation((permission: string) => {
        const userPermissions = [
          PERMISSIONS.PATIENT_LIST,
          PERMISSIONS.PATIENT_VIEW,
        ];
        return userPermissions.includes(permission);
      });

      render(<PatientTable />);

      // Check that action buttons are visible but with limited options
      const actionButtons = screen.getAllByRole("button", {
        name: /open menu/i,
      });
      expect(actionButtons).toHaveLength(3);

      // Click on first action button to see dropdown
      const firstActionButton = actionButtons[0];
      await user.click(firstActionButton);

      // Wait for dropdown to open and check for limited options
      await waitFor(() => {
        expect(screen.getByText("View patient details")).toBeInTheDocument();
        expect(screen.queryByText("Edit patient")).not.toBeInTheDocument();
        expect(screen.queryByText("Delete patient")).not.toBeInTheDocument();
      });
    });
  });

  describe("Action Buttons", () => {
    beforeEach(() => {
      mockAuthContext.hasPermission.mockImplementation((permission: string) => {
        const adminPermissions = [
          PERMISSIONS.PATIENT_LIST,
          PERMISSIONS.PATIENT_VIEW,
          PERMISSIONS.PATIENT_CREATE,
          PERMISSIONS.PATIENT_UPDATE,
          PERMISSIONS.PATIENT_DELETE,
        ];
        return adminPermissions.includes(permission);
      });
    });

    it("navigates to patient details when view is clicked", async () => {
      const user = userEvent.setup();
      render(<PatientTable />);

      const actionButtons = screen.getAllByRole("button", {
        name: /open menu/i,
      });
      await user.click(actionButtons[0]);

      await waitFor(() => {
        const viewButton = screen.getByText("View patient details");
        expect(viewButton).toBeInTheDocument();
      });

      const viewButton = screen.getByText("View patient details");
      await user.click(viewButton);

      expect(mockPush).toHaveBeenCalledWith("/patients/1");
    });

    it("navigates to edit page when edit is clicked", async () => {
      const user = userEvent.setup();
      render(<PatientTable />);

      const actionButtons = screen.getAllByRole("button", {
        name: /open menu/i,
      });
      await user.click(actionButtons[0]);

      await waitFor(() => {
        const editButton = screen.getByText("Edit patient");
        expect(editButton).toBeInTheDocument();
      });

      const editButton = screen.getByText("Edit patient");
      await user.click(editButton);

      expect(mockPush).toHaveBeenCalledWith("/patients/1?edit=true");
    });

    it("shows delete confirmation when delete is clicked", async () => {
      const user = userEvent.setup();
      render(<PatientTable />);

      const actionButtons = screen.getAllByRole("button", {
        name: /open menu/i,
      });
      await user.click(actionButtons[0]);

      await waitFor(() => {
        const deleteButton = screen.getByText("Delete patient");
        expect(deleteButton).toBeInTheDocument();
      });

      const deleteButton = screen.getByText("Delete patient");
      await user.click(deleteButton);

      // Wait for confirmation dialog to open
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(
          screen.getByText(
            "Are you sure you want to delete this patient? This action cannot be undone."
          )
        ).toBeInTheDocument();
      });
    });

    it("calls delete mutation when confirmed", async () => {
      const user = userEvent.setup();
      render(<PatientTable />);

      const actionButtons = screen.getAllByRole("button", {
        name: /open menu/i,
      });
      await user.click(actionButtons[0]);

      await waitFor(() => {
        const deleteButton = screen.getByText("Delete patient");
        expect(deleteButton).toBeInTheDocument();
      });

      const deleteButton = screen.getByText("Delete patient");
      await user.click(deleteButton);

      // Wait for confirmation dialog to open
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Confirm deletion - the actual implementation calls mutateAsync, not mutate
      const confirmButton = screen.getByRole("button", { name: /delete/i });
      await user.click(confirmButton);

      // The actual implementation calls mutateAsync, so we need to check for that
      expect(mockDeleteMutation.mutateAsync).toHaveBeenCalledWith({ id: 1 });
    });

    it("shows success toast after successful deletion", async () => {
      const user = userEvent.setup();
      mockDeleteMutation.mutateAsync.mockResolvedValue(undefined);

      render(<PatientTable />);

      const actionButtons = screen.getAllByRole("button", {
        name: /open menu/i,
      });
      await user.click(actionButtons[0]);

      await waitFor(() => {
        const deleteButton = screen.getByText("Delete patient");
        expect(deleteButton).toBeInTheDocument();
      });

      const deleteButton = screen.getByText("Delete patient");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole("button", { name: /delete/i });
      await user.click(confirmButton);

      // Wait for the async operation to complete
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Patient deleted successfully"
        );
      });
    });

    it("shows error toast on deletion failure", async () => {
      const user = userEvent.setup();
      mockDeleteMutation.mutateAsync.mockRejectedValue(
        new Error("Delete failed")
      );

      render(<PatientTable />);

      const actionButtons = screen.getAllByRole("button", {
        name: /open menu/i,
      });
      await user.click(actionButtons[0]);

      await waitFor(() => {
        const deleteButton = screen.getByText("Delete patient");
        expect(deleteButton).toBeInTheDocument();
      });

      const deleteButton = screen.getByText("Delete patient");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole("button", { name: /delete/i });
      await user.click(confirmButton);

      // Wait for the async operation to complete
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to delete patient");
      });
    });
  });

  describe("Pagination", () => {
    it("shows pagination controls when there are many patients", () => {
      const manyPatients = Array.from({ length: 25 }, (_, i) => ({
        ...mockPatients[0],
        id: i + 1,
        firstName: `Patient${i + 1}`,
        lastName: `Last${i + 1}`,
        email: `patient${i + 1}@example.com`,
      }));

      mockUsePatients.mockReturnValue({
        data: manyPatients,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        refetch: jest.fn(),
      } as any);

      render(<PatientTable />);

      // Should show pagination controls
      expect(screen.getByText("Rows per page")).toBeInTheDocument();
      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument(); // 25 patients, 10 per page
    });

    it("navigates between pages correctly", async () => {
      const user = userEvent.setup();
      const manyPatients = Array.from({ length: 25 }, (_, i) => ({
        ...mockPatients[0],
        id: i + 1,
        firstName: `Patient${i + 1}`,
        lastName: `Last${i + 1}`,
        email: `patient${i + 1}@example.com`,
      }));

      mockUsePatients.mockReturnValue({
        data: manyPatients,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        refetch: jest.fn(),
      } as any);

      render(<PatientTable />);

      // Click next page
      const nextButton = screen.getByRole("button", { name: /next page/i });
      await user.click(nextButton);

      // Should show page 2
      expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
    });
  });

  describe("Column Visibility", () => {
    it("allows toggling column visibility", async () => {
      const user = userEvent.setup();
      render(<PatientTable />);

      // Find and click the column visibility toggle
      const visibilityButton = screen.getByRole("button", { name: /columns/i });
      await user.click(visibilityButton);

      // Should see column visibility options
      const dropdownMenu = screen.getByRole("menu");
      expect(dropdownMenu).toBeInTheDocument();

      // Check for specific column checkboxes
      expect(
        screen.getByRole("menuitemcheckbox", { name: /first name/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("menuitemcheckbox", { name: /last name/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("menuitemcheckbox", { name: /email/i })
      ).toBeInTheDocument();
    });
  });
});

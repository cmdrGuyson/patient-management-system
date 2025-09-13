import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render, mockAuthContext } from "../../utils/test-utils";
import PatientDetails from "@/components/features/dashboard/patient-details";
import {
  usePatients,
  useUpdatePatient,
  useDeletePatient,
} from "@/hooks/use-patients";
import { Patient } from "@/types";
import { PERMISSIONS } from "@/lib/auth";
import { toast } from "sonner";

// Mock the hooks
jest.mock("@/hooks/use-patients");
const mockUsePatients = usePatients as jest.MockedFunction<typeof usePatients>;
const mockUseUpdatePatient = useUpdatePatient as jest.MockedFunction<
  typeof useUpdatePatient
>;
const mockUseDeletePatient = useDeletePatient as jest.MockedFunction<
  typeof useDeletePatient
>;

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();

// Create a mock URLSearchParams that can be reset
const createMockSearchParams = () => {
  const params = new URLSearchParams();
  return {
    get: jest.fn((key: string) => params.get(key)),
    set: jest.fn((key: string, value: string) => params.set(key, value)),
    delete: jest.fn((key: string) => params.delete(key)),
    toString: jest.fn(() => params.toString()),
  };
};

let mockSearchParams = createMockSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock date-fns functions
jest.mock("date-fns", () => ({
  format: jest.fn((date: Date, format: string) => {
    if (format === "PPP") {
      return "January 1, 2000";
    }
    return date.toISOString();
  }),
}));

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock window.location
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (window as any).location;

window.location = {
  href: "http://localhost:3000/patients/1",
  pathname: "/patients/1",
  search: "",
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

describe("PatientDetails", () => {
  const user = userEvent.setup();

  const mockPatient: Patient = {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phoneNumber: "1234567890",
    dob: "1990-01-01T00:00:00.000Z",
    additionalInformation: "Test patient information",
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  };

  const mockPatients: Patient[] = [
    mockPatient,
    {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      phoneNumber: "0987654321",
      dob: "1985-05-15T00:00:00.000Z",
      additionalInformation: "Another patient",
      createdAt: "2023-01-02T00:00:00.000Z",
      updatedAt: "2023-01-02T00:00:00.000Z",
    },
  ];

  let mockUpdatePatient = {
    mutate: jest.fn(),
    isPending: false,
  };

  let mockDeletePatient = {
    mutateAsync: jest.fn(),
    isPending: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset search params
    mockSearchParams = createMockSearchParams();

    // Reset mock objects
    mockUpdatePatient = {
      mutate: jest.fn(),
      isPending: false,
    };

    mockDeletePatient = {
      mutateAsync: jest.fn(),
      isPending: false,
    };

    mockUsePatients.mockReturnValue({
      data: mockPatients,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof usePatients>);

    mockUseUpdatePatient.mockReturnValue(
      mockUpdatePatient as unknown as ReturnType<typeof useUpdatePatient>
    );
    mockUseDeletePatient.mockReturnValue(
      mockDeletePatient as unknown as ReturnType<typeof useDeletePatient>
    );

    // Reset auth context
    mockAuthContext.hasPermission.mockImplementation(() => false);
  });

  describe("Component Rendering", () => {
    it("renders patient details in view mode by default", () => {
      render(<PatientDetails patient={mockPatient} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Patient Details")).toBeInTheDocument();
      expect(screen.getByText("Basic Information")).toBeInTheDocument();
      expect(screen.getByText("Additional Information")).toBeInTheDocument();
      expect(screen.getByText("System Information")).toBeInTheDocument();
    });

    it("displays patient information correctly", () => {
      render(<PatientDetails patient={mockPatient} />);

      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("Doe")).toBeInTheDocument();
      expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
      expect(screen.getByText("1234567890")).toBeInTheDocument();
      expect(screen.getByText("Test patient information")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument(); // Patient ID
    });

    it("shows 'No additional information available' when additionalInformation is empty", () => {
      const patientWithoutInfo = { ...mockPatient, additionalInformation: "" };
      render(<PatientDetails patient={patientWithoutInfo} />);

      expect(
        screen.getByText("No additional information available")
      ).toBeInTheDocument();
    });
  });

  describe("Edit Mode Functionality", () => {
    beforeEach(() => {
      mockAuthContext.hasPermission.mockImplementation(
        (permission: string) => permission === PERMISSIONS.PATIENT_UPDATE
      );
    });

    it("enters edit mode when edit button is clicked", async () => {
      mockAuthContext.hasPermission.mockImplementation(
        (permission: string) => permission === PERMISSIONS.PATIENT_UPDATE
      );

      render(<PatientDetails patient={mockPatient} />);

      const editButton = screen.getByRole("button", {
        name: "Edit Information",
      });
      await user.click(editButton);

      expect(screen.getByText("Editing")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Save Changes" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
    });

    it("shows form inputs in edit mode", async () => {
      render(<PatientDetails patient={mockPatient} />);

      const editButton = screen.getByRole("button", {
        name: "Edit Information",
      });
      await user.click(editButton);

      expect(screen.getByDisplayValue("John")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("john.doe@example.com")
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue("1234567890")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("Test patient information")
      ).toBeInTheDocument();
    });

    it("exits edit mode when cancel button is clicked", async () => {
      render(<PatientDetails patient={mockPatient} />);

      const editButton = screen.getByRole("button", {
        name: "Edit Information",
      });
      await user.click(editButton);

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      await user.click(cancelButton);

      // Check that edit button is back and save/cancel buttons are gone
      expect(
        screen.getByRole("button", { name: "Edit Information" })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Save Changes" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Cancel" })
      ).not.toBeInTheDocument();
    });

    it("enters edit mode when URL has edit=true parameter", () => {
      mockSearchParams.set("edit", "true");
      mockAuthContext.hasPermission.mockImplementation(
        (permission: string) => permission === PERMISSIONS.PATIENT_UPDATE
      );

      render(<PatientDetails patient={mockPatient} />);

      expect(screen.getByText("Editing")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Save Changes" })
      ).toBeInTheDocument();
    });

    it("does not enter edit mode when user lacks permission", () => {
      mockSearchParams.set("edit", "true");
      mockAuthContext.hasPermission.mockReturnValue(false);

      render(<PatientDetails patient={mockPatient} />);

      // Check that edit button is not visible and form inputs are not shown
      expect(
        screen.queryByRole("button", { name: "Edit Information" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Save Changes" })
      ).not.toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    beforeEach(() => {
      mockAuthContext.hasPermission.mockImplementation(
        (permission: string) => permission === PERMISSIONS.PATIENT_UPDATE
      );
    });

    it("shows validation errors for empty required fields", async () => {
      render(<PatientDetails patient={mockPatient} />);

      const editButton = screen.getByRole("button", {
        name: "Edit Information",
      });
      await user.click(editButton);

      // Clear required fields
      const firstNameInput = screen.getByDisplayValue("John");
      const lastNameInput = screen.getByDisplayValue("Doe");
      const emailInput = screen.getByDisplayValue("john.doe@example.com");
      const phoneInput = screen.getByDisplayValue("1234567890");

      await user.clear(firstNameInput);
      await user.clear(lastNameInput);
      await user.clear(emailInput);
      await user.clear(phoneInput);

      const saveButton = screen.getByRole("button", { name: "Save Changes" });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("First name is required")).toBeInTheDocument();
        expect(screen.getByText("Last name is required")).toBeInTheDocument();
        expect(screen.getByText("Email is required")).toBeInTheDocument();
        expect(
          screen.getByText("Phone number is required")
        ).toBeInTheDocument();
      });
    });

    it("validates email format", async () => {
      render(<PatientDetails patient={mockPatient} />);

      const editButton = screen.getByRole("button", {
        name: "Edit Information",
      });
      await user.click(editButton);

      const emailInput = screen.getByDisplayValue("john.doe@example.com");
      await user.clear(emailInput);
      await user.type(emailInput, "invalid-email");

      await waitFor(() => {
        expect(
          screen.getByText("Please enter a valid email address")
        ).toBeInTheDocument();
      });
    });

    it("validates email uniqueness against other patients", async () => {
      render(<PatientDetails patient={mockPatient} />);

      const editButton = screen.getByRole("button", {
        name: "Edit Information",
      });
      await user.click(editButton);

      const emailInput = screen.getByDisplayValue("john.doe@example.com");
      await user.clear(emailInput);
      await user.type(emailInput, "jane.smith@example.com");

      await waitFor(() => {
        expect(screen.getByText("Email already exists")).toBeInTheDocument();
      });
    });

    it("accepts valid email format", async () => {
      render(<PatientDetails patient={mockPatient} />);

      const editButton = screen.getByRole("button", {
        name: "Edit Information",
      });
      await user.click(editButton);

      const emailInput = screen.getByDisplayValue("john.doe@example.com");
      await user.clear(emailInput);
      await user.type(emailInput, "new.email@example.com");

      await waitFor(() => {
        expect(
          screen.queryByText("Please enter a valid email address")
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText("Email already exists")
        ).not.toBeInTheDocument();
      });
    });

    it("validates phone number format - too short", async () => {
      render(<PatientDetails patient={mockPatient} />);

      const editButton = screen.getByRole("button", {
        name: "Edit Information",
      });
      await user.click(editButton);

      const phoneInput = screen.getByDisplayValue("1234567890");
      await user.clear(phoneInput);
      await user.type(phoneInput, "123");

      await waitFor(() => {
        expect(
          screen.getByText(
            "Please enter a valid phone number (8–15 digits, optional +)."
          )
        ).toBeInTheDocument();
      });
    });

    it("validates phone number format - too long", async () => {
      render(<PatientDetails patient={mockPatient} />);

      const editButton = screen.getByRole("button", {
        name: "Edit Information",
      });
      await user.click(editButton);

      const phoneInput = screen.getByDisplayValue("1234567890");
      await user.clear(phoneInput);
      await user.type(phoneInput, "123456789012345678");

      await waitFor(() => {
        expect(
          screen.getByText(
            "Please enter a valid phone number (8–15 digits, optional +)."
          )
        ).toBeInTheDocument();
      });
    });

    it("validates phone number format - contains letters", async () => {
      render(<PatientDetails patient={mockPatient} />);

      const editButton = screen.getByRole("button", {
        name: "Edit Information",
      });
      await user.click(editButton);

      const phoneInput = screen.getByDisplayValue("1234567890");
      await user.clear(phoneInput);
      await user.type(phoneInput, "123abc456");

      await waitFor(() => {
        expect(
          screen.getByText(
            "Please enter a valid phone number (8–15 digits, optional +)."
          )
        ).toBeInTheDocument();
      });
    });

    it("accepts valid phone numbers", async () => {
      render(<PatientDetails patient={mockPatient} />);

      const editButton = screen.getByRole("button", {
        name: "Edit Information",
      });
      await user.click(editButton);

      const phoneInput = screen.getByDisplayValue("1234567890");
      await user.clear(phoneInput);
      await user.type(phoneInput, "9876543210");

      await waitFor(() => {
        expect(
          screen.queryByText(
            "Please enter a valid phone number (8–15 digits, optional +)."
          )
        ).not.toBeInTheDocument();
      });
    });

    it("accepts phone numbers with country code", async () => {
      render(<PatientDetails patient={mockPatient} />);

      const editButton = screen.getByRole("button", {
        name: "Edit Information",
      });
      await user.click(editButton);

      const phoneInput = screen.getByDisplayValue("1234567890");
      await user.clear(phoneInput);
      await user.type(phoneInput, "+1234567890");

      await waitFor(() => {
        expect(
          screen.queryByText(
            "Please enter a valid phone number (8–15 digits, optional +)."
          )
        ).not.toBeInTheDocument();
      });
    });

    it("accepts phone numbers with formatting", async () => {
      render(<PatientDetails patient={mockPatient} />);

      const editButton = screen.getByRole("button", {
        name: "Edit Information",
      });
      await user.click(editButton);

      const phoneInput = screen.getByDisplayValue("1234567890");
      await user.clear(phoneInput);
      await user.type(phoneInput, "(123) 456-7890");

      await waitFor(() => {
        expect(
          screen.queryByText(
            "Please enter a valid phone number (8–15 digits, optional +)."
          )
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    beforeEach(() => {
      mockAuthContext.hasPermission.mockImplementation(
        (permission: string) => permission === PERMISSIONS.PATIENT_UPDATE
      );
    });

    it("calls updatePatient.mutate with correct data on form submission", async () => {
      render(<PatientDetails patient={mockPatient} />);

      const editButton = screen.getByRole("button", {
        name: "Edit Information",
      });
      await user.click(editButton);

      const firstNameInput = screen.getByDisplayValue("John");
      await user.clear(firstNameInput);
      await user.type(firstNameInput, "Johnny");

      const saveButton = screen.getByRole("button", { name: "Save Changes" });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdatePatient.mutate).toHaveBeenCalledWith(
          {
            id: 1,
            updates: {
              firstName: "Johnny",
              lastName: "Doe",
              email: "john.doe@example.com",
              phoneNumber: "1234567890",
              dob: "1990-01-01T00:00:00.000Z",
              additionalInformation: "Test patient information",
            },
          },
          expect.any(Object)
        );
      });
    });

    it("does not submit form when validation fails", async () => {
      render(<PatientDetails patient={mockPatient} />);

      const editButton = screen.getByRole("button", {
        name: "Edit Information",
      });
      await user.click(editButton);

      const firstNameInput = screen.getByDisplayValue("John");
      await user.clear(firstNameInput);

      const saveButton = screen.getByRole("button", { name: "Save Changes" });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("First name is required")).toBeInTheDocument();
      });

      expect(mockUpdatePatient.mutate).not.toHaveBeenCalled();
    });

    it("shows loading state during submission", async () => {
      mockUpdatePatient.isPending = true;
      mockUseUpdatePatient.mockReturnValue(
        mockUpdatePatient as unknown as ReturnType<typeof useUpdatePatient>
      );

      render(<PatientDetails patient={mockPatient} />);

      const editButton = screen.getByRole("button", {
        name: "Edit Information",
      });
      await user.click(editButton);

      const saveButton = screen.getByRole("button", { name: "Saving..." });
      expect(saveButton).toBeDisabled();
    });
  });

  describe("Permission-Based Rendering", () => {
    it("shows edit button when user has PATIENT_UPDATE permission", () => {
      mockAuthContext.hasPermission.mockImplementation(
        (permission: string) => permission === PERMISSIONS.PATIENT_UPDATE
      );

      render(<PatientDetails patient={mockPatient} />);

      expect(
        screen.getByRole("button", { name: "Edit Information" })
      ).toBeInTheDocument();
    });

    it("hides edit button when user lacks PATIENT_UPDATE permission", () => {
      mockAuthContext.hasPermission.mockReturnValue(false);

      render(<PatientDetails patient={mockPatient} />);

      expect(
        screen.queryByRole("button", { name: "Edit Information" })
      ).not.toBeInTheDocument();
    });

    it("shows delete button when user has PATIENT_DELETE permission", () => {
      mockAuthContext.hasPermission.mockImplementation(
        (permission: string) => permission === PERMISSIONS.PATIENT_DELETE
      );

      render(<PatientDetails patient={mockPatient} />);

      expect(
        screen.getByRole("button", { name: "Delete" })
      ).toBeInTheDocument();
    });

    it("hides delete button when user lacks PATIENT_DELETE permission", () => {
      mockAuthContext.hasPermission.mockReturnValue(false);

      render(<PatientDetails patient={mockPatient} />);

      expect(
        screen.queryByRole("button", { name: "Delete" })
      ).not.toBeInTheDocument();
    });

    it("shows both edit and delete buttons when user has both permissions", () => {
      mockAuthContext.hasPermission.mockImplementation(
        (permission: string) =>
          permission === PERMISSIONS.PATIENT_UPDATE ||
          permission === PERMISSIONS.PATIENT_DELETE
      );

      render(<PatientDetails patient={mockPatient} />);

      expect(
        screen.getByRole("button", { name: "Edit Information" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Delete" })
      ).toBeInTheDocument();
    });
  });

  describe("Delete Functionality", () => {
    beforeEach(() => {
      mockAuthContext.hasPermission.mockImplementation(
        (permission: string) => permission === PERMISSIONS.PATIENT_DELETE
      );
    });

    it("shows confirmation dialog when delete button is clicked", async () => {
      render(<PatientDetails patient={mockPatient} />);

      const deleteButton = screen.getByRole("button", { name: "Delete" });
      await user.click(deleteButton);

      expect(screen.getByText("Delete patient")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Are you sure you want to delete this patient? This action cannot be undone."
        )
      ).toBeInTheDocument();
    });

    it("calls deletePatient.mutateAsync when confirmed", async () => {
      mockDeletePatient.mutateAsync.mockResolvedValue(undefined);

      render(<PatientDetails patient={mockPatient} />);

      const deleteButton = screen.getByRole("button", { name: "Delete" });
      await user.click(deleteButton);

      const confirmButton = screen.getByRole("button", { name: "Delete" });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockDeletePatient.mutateAsync).toHaveBeenCalledWith({ id: 1 });
      });
    });

    it("navigates to patients list after successful deletion", async () => {
      mockDeletePatient.mutateAsync.mockResolvedValue(undefined);

      render(<PatientDetails patient={mockPatient} />);

      const deleteButton = screen.getByRole("button", { name: "Delete" });
      await user.click(deleteButton);

      const confirmButton = screen.getByRole("button", { name: "Delete" });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/patients");
      });
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      mockAuthContext.hasPermission.mockImplementation(
        (permission: string) => permission === PERMISSIONS.PATIENT_UPDATE
      );
    });

    it("handles update error gracefully", async () => {
      mockUpdatePatient.mutate.mockImplementation((data, { onError }) => {
        onError?.(new Error("Update failed"));
      });

      render(<PatientDetails patient={mockPatient} />);

      const editButton = screen.getByRole("button", {
        name: "Edit Information",
      });
      await user.click(editButton);

      const saveButton = screen.getByRole("button", { name: "Save Changes" });
      await user.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to update patient");
      });
    });

    it("handles delete error gracefully", async () => {
      mockAuthContext.hasPermission.mockImplementation(
        (permission: string) => permission === PERMISSIONS.PATIENT_DELETE
      );

      mockDeletePatient.mutateAsync.mockRejectedValue(
        new Error("Delete failed")
      );

      render(<PatientDetails patient={mockPatient} />);

      const deleteButton = screen.getByRole("button", { name: "Delete" });
      await user.click(deleteButton);

      const confirmButton = screen.getByRole("button", { name: "Delete" });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to delete patient");
      });
    });
  });
});

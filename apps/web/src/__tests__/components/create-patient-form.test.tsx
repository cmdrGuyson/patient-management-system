import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../../utils/test-utils";
import { CreatePatientForm } from "@/components/features/dashboard/create-patient-form";
import { usePatients } from "@/hooks/use-patients";
import { Patient } from "@/types";

// Mock the usePatients hook
jest.mock("@/hooks/use-patients");
const mockUsePatients = usePatients as jest.MockedFunction<typeof usePatients>;

// Mock date-fns functions
jest.mock("date-fns", () => ({
  format: jest.fn((date: Date, format: string) => {
    if (format === "PPP") {
      return "January 1, 2000";
    }
    return date.toISOString();
  }),
  addYears: jest.fn((date: Date, years: number) => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }),
  subYears: jest.fn((date: Date, years: number) => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() - years);
    return result;
  }),
  startOfYear: jest.fn((date: Date) => {
    const result = new Date(date);
    result.setMonth(0, 1);
    result.setHours(0, 0, 0, 0);
    return result;
  }),
  endOfYear: jest.fn((date: Date) => {
    const result = new Date(date);
    result.setMonth(11, 31);
    result.setHours(23, 59, 59, 999);
    return result;
  }),
  startOfDay: jest.fn((date: Date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }),
  endOfDay: jest.fn((date: Date) => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }),
  startOfMonth: jest.fn((date: Date) => {
    const result = new Date(date);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
  }),
  endOfMonth: jest.fn((date: Date) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1, 0);
    result.setHours(23, 59, 59, 999);
    return result;
  }),
  addMonths: jest.fn((date: Date, months: number) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }),
  subMonths: jest.fn((date: Date, months: number) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() - months);
    return result;
  }),
  addDays: jest.fn((date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }),
  subDays: jest.fn((date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  }),
  isSameDay: jest.fn((date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  }),
  isSameMonth: jest.fn((date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth()
    );
  }),
  isSameYear: jest.fn((date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear();
  }),
  isToday: jest.fn((date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }),
  isAfter: jest.fn((date: Date, dateToCompare: Date) => {
    return date.getTime() > dateToCompare.getTime();
  }),
  isBefore: jest.fn((date: Date, dateToCompare: Date) => {
    return date.getTime() < dateToCompare.getTime();
  }),
  getDay: jest.fn((date: Date) => date.getDay()),
  getDaysInMonth: jest.fn((date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }),
}));

describe("CreatePatientForm", () => {
  const user = userEvent.setup();
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  const mockPatients: Patient[] = [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phoneNumber: "1234567890",
      dob: "1990-01-01T00:00:00.000Z",
      additionalInformation: "Test patient",
      createdAt: "2023-01-01T00:00:00.000Z",
      updatedAt: "2023-01-01T00:00:00.000Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePatients.mockReturnValue({
      data: mockPatients,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      refetch: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as unknown as any);
  });

  describe("Form Rendering", () => {
    it("renders the create patient form with all required elements", () => {
      render(
        <CreatePatientForm onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );

      expect(screen.getByLabelText("First Name *")).toBeInTheDocument();
      expect(screen.getByLabelText("Last Name *")).toBeInTheDocument();
      expect(screen.getByLabelText("Email *")).toBeInTheDocument();
      expect(screen.getByLabelText("Phone Number *")).toBeInTheDocument();
      expect(screen.getByText("Date of Birth *")).toBeInTheDocument();
      expect(
        screen.getByLabelText("Additional Information")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Create Patient" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
    });

    it("has correct input types and attributes", () => {
      render(
        <CreatePatientForm onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );

      const emailInput = screen.getByLabelText("Email *");
      const phoneInput = screen.getByLabelText("Phone Number *");

      expect(emailInput).toHaveAttribute("type", "email");
      expect(phoneInput).toHaveAttribute("type", "tel");
      expect(phoneInput).toHaveAttribute("inputMode", "tel");
    });

    it("shows correct placeholders", () => {
      render(
        <CreatePatientForm onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );

      expect(
        screen.getByPlaceholderText("Enter first name")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter last name")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter email address")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter phone number")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          "Enter any additional information about the patient"
        )
      ).toBeInTheDocument();
    });
  });

  describe("Form Validation - Required Fields", () => {
    it("shows validation errors for empty required fields", async () => {
      render(
        <CreatePatientForm onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );

      const submitButton = screen.getByRole("button", {
        name: "Create Patient",
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("First name is required")).toBeInTheDocument();
        expect(screen.getByText("Last name is required")).toBeInTheDocument();
        expect(screen.getByText("Email is required")).toBeInTheDocument();
        expect(
          screen.getByText("Phone number is required")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Date of birth is required")
        ).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Email Validation", () => {
    it("validates email format", async () => {
      render(
        <CreatePatientForm onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );

      const emailInput = screen.getByLabelText("Email *");
      await user.type(emailInput, "invalid-email");

      await waitFor(() => {
        expect(
          screen.getByText("Please enter a valid email address")
        ).toBeInTheDocument();
      });
    });

    it("accepts valid email format", async () => {
      render(
        <CreatePatientForm onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );

      const emailInput = screen.getByLabelText("Email *");
      await user.type(emailInput, "test@example.com");

      await waitFor(() => {
        expect(
          screen.queryByText("Please enter a valid email address")
        ).not.toBeInTheDocument();
      });
    });

    it("validates email uniqueness against existing patients", async () => {
      render(
        <CreatePatientForm onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );

      const emailInput = screen.getByLabelText("Email *");
      await user.type(emailInput, "john.doe@example.com");

      await waitFor(() => {
        expect(screen.getByText("Email already exists")).toBeInTheDocument();
      });
    });

    it("accepts unique email addresses", async () => {
      render(
        <CreatePatientForm onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );

      const emailInput = screen.getByLabelText("Email *");
      await user.type(emailInput, "unique@example.com");

      await waitFor(() => {
        expect(
          screen.queryByText("Email already exists")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Phone Number Validation", () => {
    it("validates phone number format - too short", async () => {
      render(
        <CreatePatientForm onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );

      const phoneInput = screen.getByLabelText("Phone Number *");
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
      render(
        <CreatePatientForm onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );

      const phoneInput = screen.getByLabelText("Phone Number *");
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
      render(
        <CreatePatientForm onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );

      const phoneInput = screen.getByLabelText("Phone Number *");
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
      render(
        <CreatePatientForm onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );

      const phoneInput = screen.getByLabelText("Phone Number *");
      await user.type(phoneInput, "1234567890");

      await waitFor(() => {
        expect(
          screen.queryByText(
            "Please enter a valid phone number (8–15 digits, optional +)."
          )
        ).not.toBeInTheDocument();
      });
    });

    it("accepts phone numbers with country code", async () => {
      render(
        <CreatePatientForm onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );

      const phoneInput = screen.getByLabelText("Phone Number *");
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
      render(
        <CreatePatientForm onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );

      const phoneInput = screen.getByLabelText("Phone Number *");
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
    it("validates form fields before submission", async () => {
      render(
        <CreatePatientForm onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );

      // Try to submit empty form
      const submitButton = screen.getByRole("button", {
        name: "Create Patient",
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("First name is required")).toBeInTheDocument();
        expect(screen.getByText("Last name is required")).toBeInTheDocument();
        expect(screen.getByText("Email is required")).toBeInTheDocument();
        expect(
          screen.getByText("Phone number is required")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Date of birth is required")
        ).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Form Reset and Close", () => {
    it("calls onClose when cancel button is clicked", async () => {
      render(
        <CreatePatientForm onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});

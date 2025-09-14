import React from "react";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor, mockAuthContext } from "@/utils/test-utils";
import api from "@/lib/api";
import { PatientTable } from "@/components/features/dashboard/patient-table";
import PatientDetails from "@/components/features/dashboard/patient-details";

declare const routerMock: {
  push: jest.Mock;
  replace: jest.Mock;
};

const mockedApi = api as unknown as {
  get: jest.Mock;
  delete: jest.Mock;
};

describe("Delete patient flow integration", () => {
  const user = userEvent.setup();

  const patient = {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phoneNumber: "+1234567890",
    dob: new Date("1990-01-01").toISOString(),
    additionalInformation: "N/A",
    createdAt: new Date("2025-01-01").toISOString(),
    updatedAt: new Date("2025-01-02").toISOString(),
  };

  beforeEach(() => {
    localStorage.clear();
    mockedApi.get.mockReset();
    mockedApi.delete.mockReset();
    mockAuthContext.hasPermission.mockReset();
  });

  it("deletes patient from the table and removes it from the list", async () => {
    // Grant delete permissions
    mockAuthContext.hasPermission.mockImplementation(() => true);

    // Mock API call to get patients
    mockedApi.get.mockImplementation((url: string) => {
      if (url === "/patients") return Promise.resolve({ data: [patient] });
      return Promise.resolve({ data: {} });
    });
    mockedApi.delete.mockResolvedValue({ data: {} });

    render(<PatientTable />);

    // Wait for row to appear
    await waitFor(() => {
      expect(screen.getByText(patient.email)).toBeInTheDocument();
    });

    // Open row actions and click Delete patient
    const menuButtons = screen.getAllByRole("button", { name: /open menu/i });
    await user.click(menuButtons[0]);
    await user.click(await screen.findByText(/delete patient/i));

    // Confirm deletion in dialog
    const confirmButton = await screen.findByRole("button", {
      name: /delete/i,
    });
    await user.click(confirmButton);

    // Expect API call to delete endpoint
    await waitFor(() => {
      expect(mockedApi.delete).toHaveBeenCalledWith(`/patients/${patient.id}`);
    });
  });

  it("deletes patient from details and navigates back to patients list", async () => {
    // Grant delete permissions
    mockAuthContext.hasPermission.mockImplementation(() => true);

    // Mock API call to get patient details
    mockedApi.get.mockImplementation((url: string) => {
      if (url === "/patients") return Promise.resolve({ data: [patient] });
      return Promise.resolve({ data: {} });
    });
    mockedApi.delete.mockResolvedValue({ data: {} });

    render(<PatientDetails patient={patient} />);

    // Trigger delete and confirm
    await user.click(screen.getByRole("button", { name: /delete/i }));
    const confirmButton = await screen.findByRole("button", {
      name: /delete/i,
    });
    await user.click(confirmButton);

    // Expect API call and navigation
    await waitFor(() => {
      expect(mockedApi.delete).toHaveBeenCalledWith(`/patients/${patient.id}`);
      expect(routerMock.push).toHaveBeenCalledWith("/patients");
    });
  });
});

import React from "react";
import userEvent from "@testing-library/user-event";
import {
  render,
  screen,
  waitFor,
  mockAuthContext,
  cleanup,
} from "@/utils/test-utils";

declare const routerMock: {
  push: jest.Mock;
  replace: jest.Mock;
};
import api from "@/lib/api";
import { PatientTable } from "@/components/features/dashboard/patient-table";
import PatientDetails from "@/components/features/dashboard/patient-details";

const mockedApi = api as unknown as {
  get: jest.Mock;
  post: jest.Mock;
};

describe("Patient details flow integration", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
    mockedApi.get.mockReset();
    mockedApi.post.mockReset?.();
    mockAuthContext.hasPermission.mockReset();
  });

  it("shows patient details after clicking 'View patient details' from the table", async () => {
    // Grant permissions for viewing actions
    mockAuthContext.hasPermission.mockImplementation(() => true);

    const patient = {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phoneNumber: "+1234567890",
      dob: new Date("1990-01-01").toISOString(),
      additionalInformation: "N/A",
      createdAt: new Date("2024-01-01").toISOString(),
      updatedAt: new Date("2024-01-02").toISOString(),
    };

    // Mock API calls
    mockedApi.get.mockImplementation((url: string) => {
      if (url === "/patients") return Promise.resolve({ data: [patient] });
      if (url === `/patients/${patient.id}`)
        return Promise.resolve({ data: patient });
      return Promise.resolve({ data: {} });
    });

    const tableRender = render(<PatientTable />);

    // Wait for row to appear
    await waitFor(() => {
      expect(screen.getByText(patient.email)).toBeInTheDocument();
    });

    // Open row actions and click View patient details
    const menuButtons = screen.getAllByRole("button", { name: /open menu/i });
    await user.click(menuButtons[0]);
    await user.click(await screen.findByText(/view patient details/i));

    // Ensure navigation was attempted to patient details route
    expect(routerMock.push).toHaveBeenCalledWith(`/patients/${patient.id}`);

    // Clean up
    tableRender.unmount?.();
    cleanup();

    // Render the details view component for same patient
    render(<PatientDetails patient={patient} />);

    expect(
      await screen.findByRole("heading", {
        name: `${patient.firstName} ${patient.lastName}`,
      })
    ).toBeInTheDocument();
    expect(await screen.findByText(patient.email)).toBeInTheDocument();
    expect(await screen.findByText(patient.phoneNumber)).toBeInTheDocument();
  });
});

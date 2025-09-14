import React from "react";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor, mockAuthContext } from "@/utils/test-utils";
import api from "@/lib/api";

import PatientDetails from "@/components/features/dashboard/patient-details";
import { Patient } from "@/types";

declare const routerMock: {
  push: jest.Mock;
  replace: jest.Mock;
};

const mockedApi = api as unknown as {
  get: jest.Mock;
  patch: jest.Mock;
};

describe("Edit patient flow integration", () => {
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
    mockedApi.patch.mockReset();
    mockAuthContext.hasPermission.mockReset();
  });

  it("updates patient successfully and exits edit mode", async () => {
    // Allow update permission
    mockAuthContext.hasPermission.mockImplementation(() => true);

    // Mock patients list used by details component for validation
    mockedApi.get.mockImplementation((url: string) => {
      if (url === "/patients") return Promise.resolve({ data: [patient] });
      if (url === `/patients/${patient.id}`)
        return Promise.resolve({ data: patient });
      return Promise.resolve({ data: {} });
    });

    const updated = {
      ...patient,
      firstName: "Johnny",
      updatedAt: new Date().toISOString(),
    };

    mockedApi.patch.mockImplementation(
      (url: string, body: Partial<Patient>) => {
        if (url === `/patients/${patient.id}`) {
          return Promise.resolve({ data: { ...updated, ...body } });
        }
        return Promise.resolve({ data: {} });
      }
    );

    render(<PatientDetails patient={patient} />);

    // Enter edit mode
    await user.click(screen.getByRole("button", { name: /edit information/i }));

    // Change first name
    const firstNameInput = screen.getByLabelText(/first name/i);
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Johnny");

    // Save
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    // Expect update API endpoint to be called with correct payload
    await waitFor(() => {
      expect(mockedApi.patch).toHaveBeenCalledWith(
        `/patients/${patient.id}`,
        expect.objectContaining({
          firstName: "Johnny",
          lastName: patient.lastName,
          email: patient.email,
          phoneNumber: patient.phoneNumber,
          dob: expect.any(String),
          additionalInformation: patient.additionalInformation,
        })
      );
    });

    // Ensure that edit mode is exited
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /save changes/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /cancel/i })
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /edit information/i })
      ).toBeInTheDocument();
      expect(routerMock.replace).toHaveBeenCalled();
    });
  });
});

import React from "react";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor, within } from "@/utils/test-utils";
import api from "@/lib/api";
import { CreatePatientModal } from "@/components/features/dashboard/create-patient-modal";
import { Patient } from "@/types";

const mockedApi = api as unknown as { get: jest.Mock; post: jest.Mock };

describe("Create patient flow integration", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
    mockedApi.get.mockReset();
    mockedApi.post.mockReset();
  });

  it("creates patient successfully via modal and closes it", async () => {
    // Mock get patients API call
    mockedApi.get.mockImplementation((url: string) => {
      if (url === "/patients") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: {} });
    });

    const dobDate = new Date("1998-09-11");
    const payload = {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      phoneNumber: "+94771234567",
      dob: dobDate.toISOString(),
      additionalInformation: "Allergic to penicillin",
    };

    // Mock create API route
    mockedApi.post.mockImplementation((url: string, body: Partial<Patient>) => {
      if (url === "/patients") {
        return Promise.resolve({
          data: {
            id: 101,
            ...body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(<CreatePatientModal />);

    // Open modal
    await user.click(screen.getByRole("button", { name: /create patient/i }));

    const dialog = await screen.findByRole("dialog");
    const modal = within(dialog);

    // Perform user actions to fill form
    await user.type(modal.getByLabelText(/first name \*/i), payload.firstName);
    await user.type(modal.getByLabelText(/last name \*/i), payload.lastName);
    await user.type(modal.getByLabelText(/email \*/i), payload.email);
    await user.type(
      modal.getByLabelText(/phone number \*/i),
      payload.phoneNumber
    );
    await user.click(modal.getByRole("button", { name: /pick a date/i }));
    const dayButtons = screen.getAllByRole("button");
    const dayWithDataAttr = dayButtons.find((el) =>
      el.getAttribute("data-day")
    );
    expect(dayWithDataAttr).toBeDefined();
    await user.click(dayWithDataAttr as HTMLElement);
    await user.type(
      modal.getByLabelText(/additional information/i),
      payload.additionalInformation!
    );

    // Submit
    await user.click(modal.getByRole("button", { name: /create patient/i }));

    // Expect create patient endpoint to be called with correct data
    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith(
        "/patients",
        expect.objectContaining({
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          phoneNumber: payload.phoneNumber,
          dob: expect.any(String),
          additionalInformation: payload.additionalInformation,
        })
      );
    });

    // Modal should close on success
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});

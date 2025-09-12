"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import patients from "@/app/(dashboard)/patients/data.json";
import { Patient } from "@/types";

export function PatientBreadcrumbs() {
  const pathname = usePathname();
  const isPatientDetails =
    pathname.includes("/patients/") && pathname !== "/patients";

  // Get patient ID from pathname
  let patient: Patient | undefined;
  if (isPatientDetails) {
    const patientId = pathname.split("/patients/")[1];
    patient = patients.find((p) => p.id.toString() === patientId);
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/">Patient Management System</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          {isPatientDetails ? (
            <BreadcrumbLink href="/patients">Patients</BreadcrumbLink>
          ) : (
            <BreadcrumbPage>Patients</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {isPatientDetails && patient && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {patient.firstName} {patient.lastName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

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
import { ChevronLeft } from "lucide-react";

import { Patient } from "@/types";
import { usePatients } from "@/hooks/use-patients";

export function PatientBreadcrumbs() {
  const pathname = usePathname();
  const isPatientDetails =
    pathname.includes("/patients/") && pathname !== "/patients";

  const { data: patients } = usePatients();

  // Get patient ID from pathname
  let patient: Patient | undefined;
  if (isPatientDetails) {
    const patientId = pathname.split("/patients/")[1];
    patient = patients?.find((p) => p.id.toString() === patientId);
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Mobile view - only show back arrow + Patients when on patient details */}
        {isPatientDetails && (
          <BreadcrumbItem className="md:hidden">
            <BreadcrumbLink
              href="/patients"
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Patients
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}

        {/* Mobile view - just show Patients when on main patients page */}
        {!isPatientDetails && (
          <BreadcrumbItem className="md:hidden">
            <BreadcrumbPage>Patients</BreadcrumbPage>
          </BreadcrumbItem>
        )}

        {/* Desktop view - full breadcrumb trail */}
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/">Patient Management System</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem className="hidden md:block">
          {isPatientDetails ? (
            <BreadcrumbLink href="/patients">Patients</BreadcrumbLink>
          ) : (
            <BreadcrumbPage>Patients</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {isPatientDetails && patient && (
          <>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:block">
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

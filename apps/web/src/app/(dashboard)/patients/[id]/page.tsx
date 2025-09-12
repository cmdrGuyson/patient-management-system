"use client";

import { use } from "react";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

import patients from "@/app/(dashboard)/patients/data.json";
import PatientDetails from "@/components/features/dashboard/patient-details";

interface PatientDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PatientDetailsPage({
  params,
}: PatientDetailsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);

  // TODO: Fetch via API
  const patient = patients.find((p) => p.id.toString() === resolvedParams.id);

  // If patient is not found
  if (!patient) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-2xl font-bold">Patient Not Found</h1>
        <p className="text-muted-foreground">
          The patient you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button onClick={() => router.push("/patients")}>
          Back to Patients
        </Button>
      </div>
    );
  }

  return <PatientDetails patient={patient} />;
}

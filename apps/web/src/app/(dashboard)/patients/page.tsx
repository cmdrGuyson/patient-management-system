import { Can } from "@/components/features/common/can";
import { PatientTable } from "@/components/features/dashboard/patient-table";
import { PERMISSIONS } from "@/lib/auth";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Can perform={PERMISSIONS.PATIENT_LIST}>
        <PatientTable />
      </Can>
    </div>
  );
}

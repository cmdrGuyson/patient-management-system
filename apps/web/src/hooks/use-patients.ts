import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export type Patient = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  additionalInformation?: string;
  createdAt: string;
  updatedAt: string;
};

const fetchPatients = async () => {
  const { data } = await api.get("/patients");
  return data;
};

export const usePatients = () => {
  return useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: fetchPatients,
  });
};

const fetchPatient = async (id: number) => {
  const { data } = await api.get(`/patients/${id}`);
  return data;
};

export const usePatient = (id: number) => {
  return useQuery<Patient>({
    queryKey: ["patient", id],
    queryFn: () => fetchPatient(id),
    enabled: id > 0,
  });
};

type CreatePatientInput = Omit<Patient, "id" | "createdAt" | "updatedAt">;

export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Patient,
    unknown,
    CreatePatientInput,
    { previousPatients: Patient[]; optimisticId: number }
  >({
    mutationFn: async (newPatient: CreatePatientInput) => {
      const { data } = await api.post("/patients", newPatient);
      return data;
    },
    onMutate: async (newPatient) => {
      await queryClient.cancelQueries({ queryKey: ["patients"] });

      const previousPatients =
        queryClient.getQueryData<Patient[]>(["patients"]) || [];

      // Temporary id
      const optimisticId = -Date.now();

      const optimisticPatient: Patient = {
        id: optimisticId,
        firstName: newPatient.firstName,
        lastName: newPatient.lastName,
        email: newPatient.email,
        phoneNumber: newPatient.phoneNumber,
        dob: newPatient.dob,
        additionalInformation: newPatient.additionalInformation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Patient[]>(["patients"], (old) => {
        const current = old || [];
        return [...current, optimisticPatient];
      });

      return { previousPatients, optimisticId } as {
        previousPatients: Patient[];
        optimisticId: number;
      };
    },
    onError: (_err, _variables, context) => {
      if (context && context.previousPatients) {
        queryClient.setQueryData(["patients"], context.previousPatients);
      }
    },
    onSuccess: (created, _variables, context) => {
      if (context) {
        queryClient.setQueryData<Patient[] | undefined>(
          ["patients"],
          (old) =>
            old?.map((p) => (p.id === context.optimisticId ? created : p)) ||
            old
        );
        // Prime the single-patient cache with the created entity
        queryClient.setQueryData(["patient", created.id], created);

        // Clear the optimistic single-patient cache if present
        queryClient.removeQueries({
          queryKey: ["patient", context.optimisticId],
          exact: true,
        });
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
};

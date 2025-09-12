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

      // Optimistically update list cache
      queryClient.setQueryData<Patient[]>(["patients"], (old) => {
        const current = old || [];
        return [...current, optimisticPatient];
      });

      // Optimistically update single cache
      queryClient.setQueryData(["patient", optimisticId], optimisticPatient);

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
        // Replace caches with the server result
        queryClient.setQueryData<Patient[] | undefined>(
          ["patients"],
          (old) =>
            old?.map((p) => (p.id === context.optimisticId ? created : p)) ||
            old
        );

        queryClient.setQueryData(["patient", created.id], created);

        // Clear the optimistic single-patient cache if present
        queryClient.removeQueries({
          queryKey: ["patient", context.optimisticId],
          exact: true,
        });
      }
    },
    onSettled: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["patients"] }),
        data?.id
          ? queryClient.invalidateQueries({ queryKey: ["patient", data.id] })
          : Promise.resolve(),
      ]);
    },
  });
};

type UpdatePatientInput = Partial<
  Omit<Patient, "id" | "createdAt" | "updatedAt">
>;

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Patient,
    unknown,
    { id: number; updates: UpdatePatientInput },
    { previousPatients: Patient[]; previousPatient?: Patient }
  >({
    mutationFn: async ({ id, updates }) => {
      const { data } = await api.patch(`/patients/${id}`, updates);
      return data;
    },
    onMutate: async ({ id, updates }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["patients"] }),
        queryClient.cancelQueries({ queryKey: ["patient", id] }),
      ]);

      const previousPatients =
        queryClient.getQueryData<Patient[]>(["patients"]) || [];
      const previousPatient = queryClient.getQueryData<Patient>([
        "patient",
        id,
      ]);

      // Optimistically update list cache
      queryClient.setQueryData<Patient[] | undefined>(["patients"], (old) => {
        if (!old) return old;
        return old.map((p) =>
          p.id === id
            ? {
                ...p,
                ...updates,
                updatedAt: new Date().toISOString(),
              }
            : p
        );
      });

      // Optimistically update single cache
      queryClient.setQueryData<Patient | undefined>(["patient", id], (old) => {
        if (!old) return old;
        return {
          ...old,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      });

      return { previousPatients, previousPatient };
    },
    onError: (_err, variables, context) => {
      if (!context) return;
      queryClient.setQueryData(["patients"], context.previousPatients);
      if (variables?.id && context.previousPatient) {
        queryClient.setQueryData(
          ["patient", variables.id],
          context.previousPatient
        );
      }
    },
    onSuccess: (updated) => {
      // Replace caches with the server result
      queryClient.setQueryData<Patient[] | undefined>(
        ["patients"],
        (old) => old?.map((p) => (p.id === updated.id ? updated : p)) || old
      );
      queryClient.setQueryData(["patient", updated.id], updated);
    },
    onSettled: async (_data, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["patients"] }),
        variables?.id
          ? queryClient.invalidateQueries({
              queryKey: ["patient", variables.id],
            })
          : Promise.resolve(),
      ]);
    },
  });
};

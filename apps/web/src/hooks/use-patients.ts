import { useQuery } from "@tanstack/react-query";
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
  });
};

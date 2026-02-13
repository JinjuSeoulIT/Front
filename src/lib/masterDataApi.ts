import axios from "axios";
import type {
  ApiResponse,
  DepartmentOption,
  DoctorOption,
  PatientOption,
} from "@/features/Reservations/ReservationTypes";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE ?? "",
});

export const fetchPatientsApi = async (): Promise<PatientOption[]> => {
  const res = await api.get<ApiResponse<PatientOption[]>>("/api/patients");
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch patients failed");
  }
  return res.data.result ?? [];
};

export const fetchDepartmentsApi = async (): Promise<DepartmentOption[]> => {
  const res = await api.get<ApiResponse<DepartmentOption[]>>("/api/departments");
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch departments failed");
  }
  return res.data.result ?? [];
};

export const fetchDoctorsApi = async (
  departmentId?: number | null
): Promise<DoctorOption[]> => {
  const res = await api.get<ApiResponse<DoctorOption[]>>("/api/doctors", {
    params: departmentId ? { departmentId } : undefined,
  });
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch doctors failed");
  }
  return res.data.result ?? [];
};




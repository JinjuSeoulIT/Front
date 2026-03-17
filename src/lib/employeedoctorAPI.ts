import axios from "axios";
import type {
  ApiResponse,
  DoctorCreateRequest,
  DoctorResponse,
  DoctorSearchType,
  DoctorStaffIdParam,
  DoctorUpdateRequest,
  FileUploadResDTO,
} from "../features/employee/doctor/doctortypes";

const doctor_API_BASE_URL = "http://192.168.1.58:8022";

const doctorAPI = axios.create({
  baseURL: doctor_API_BASE_URL,
});


//검색
export async function searchDoctorListApi(search: string,searchType: DoctorSearchType): Promise<ApiResponse<DoctorResponse[]>> {
  const response = await doctorAPI.get("/api/doctor/search", {params: {search,searchType,},});
  console.log(response);
  return response.data;
}

//리스트
export const DoctorProfileListApi = async (): Promise<ApiResponse<DoctorResponse[]>> => {
  const res = await doctorAPI.get<ApiResponse<DoctorResponse[]>>(`/api/doctor/list`);
  return res.data;
};

//상세
export const DoctorProfileDetailApi = async ({ staffId }: DoctorStaffIdParam): Promise<ApiResponse<DoctorResponse>> => {
  const res = await doctorAPI.get<ApiResponse<DoctorResponse>>(`/api/doctor/detail/${staffId}`);
  return res.data;
};

//생성
export const createDoctorApi = async (doctorReq: DoctorCreateRequest): Promise<ApiResponse<DoctorResponse>> => {
  const res = await doctorAPI.post<ApiResponse<DoctorResponse>>(`/api/doctor/create`, doctorReq);
  return res.data;
};

//수정
export const updateDoctorApi = async (staffId: string, doctorReq: DoctorUpdateRequest): Promise<ApiResponse<DoctorResponse>> => {
  const res = await doctorAPI.patch<ApiResponse<DoctorResponse>>(`/api/doctor/update/${staffId}`, doctorReq);
  return res.data;
};

//영구 삭제
export const deleteDoctorApi = async (staffId: string): Promise<ApiResponse<void>> => {
  const res = await doctorAPI.delete<ApiResponse<void>>(`/api/doctor/delete/${staffId}`);
  return res.data;
};


export async function uploadFileApi(staffId: string, file: File):
 Promise<ApiResponse<FileUploadResDTO>> {
  const form = new FormData();
  form.append("DoctorFile", file);
  const res = await doctorAPI.post<ApiResponse<FileUploadResDTO>>(`/api/doctor/profile/upload/${staffId}`, form);
  return res.data;
}



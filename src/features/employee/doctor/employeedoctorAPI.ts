import axios from "axios";
import type { ApiResponse,   DoctorCreateRequest,  DoctorDetailResView,  DoctorListView,  DoctorResponse, DoctorUpdateRequest, FileUploadResDTO } from "./doctortypes";




export const doctorapiClient = axios.create({
  baseURL: "/api/doctor",
  withCredentials: true,
  validateStatus: s => s >= 200 && s < 500,
});



//리스트
export const DoctorProfileListApi = async (params?: {

  specialtyCode?: string;
}): Promise<ApiResponse<DoctorListView[]>> => {

  const res = await doctorapiClient.get<ApiResponse<DoctorListView[]>>(`/profile/list`,  { params });

  return res.data;
};

//의사상세 (식별자때문에 doctorId가져옴)
export const DoctorProfileDetailApi = async (doctorId: number): Promise<ApiResponse<DoctorDetailResView>> => {
  
  const res = await doctorapiClient.get<ApiResponse<DoctorDetailResView>>(`/${doctorId}/profile/detail`);
  return res.data;
};









//추가
export const createDoctorApi = async (doctorreq: DoctorCreateRequest): Promise<ApiResponse<DoctorResponse>> => {
  console.log(doctorreq);
  const res = await doctorapiClient.post<ApiResponse<DoctorResponse>>(`/create`, doctorreq);
  return res.data;
};
// ✅ 첨부 업로드: POST /api/files/{postId}/files  (key="files")
export async function uploadFileApi( file: File): Promise<ApiResponse<FileUploadResDTO>> {
  const form = new FormData();
  form.append("doctorFile", file);

  const res = await doctorapiClient.post<ApiResponse<FileUploadResDTO>>(
    `/profile/upload`,
    form
  );
  return res.data;
}











//상세 (식별자때문에 따로 authenticationId가져옴)
export const DoctorDetailApi = async (authenticationId: number): Promise<ApiResponse<DoctorResponse>> => {
  
  const res = await doctorapiClient.get<ApiResponse<DoctorResponse>>(`/detail/${authenticationId}`);
  return res.data;
};





//수정 - doctorId 사용 (PATCH 메서드)
export const updateDoctorApi = async (doctorId: number,doctorReq: DoctorUpdateRequest["req"]): Promise<ApiResponse<DoctorResponse>> => {
  
  const res = await doctorapiClient.patch<ApiResponse<DoctorResponse>>(`/${doctorId}/update`, doctorReq);
  return res.data;
};

//삭제 - doctorId 사용
export const deleteDoctorApi = async (doctorId: number): Promise<ApiResponse<void>> => {
  
  const res = await doctorapiClient.delete<ApiResponse<void>>(`/${doctorId}`);
  return res.data;
};



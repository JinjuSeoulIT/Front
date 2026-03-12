import axios from "axios";
import type { ApiResponse,   DoctorCreateRequest,   DoctorFile,   DoctorIdNumber,   DoctorResponse, DoctorUpdateRequest, FileUploadResDTO } from "../features/employee/doctor/doctortypes";




const doctor_API_BASE_URL = "http://192.168.1.58:8022";

const doctorAPI = axios.create({
  baseURL: doctor_API_BASE_URL,


});



//✅ 리스트
export const DoctorProfileListApi = async (): Promise<ApiResponse<DoctorResponse[]>> => {

  const res = await doctorAPI.get<ApiResponse<DoctorResponse[]>>(`/api/doctor/list`);

  return res.data;
};


//✅ 의사상세 (식별자때문에 doctorId가져옴)
export const DoctorProfileDetailApi = async ({doctorId}: DoctorIdNumber): Promise<ApiResponse<DoctorResponse>> => {
  
  const res = await doctorAPI.get<ApiResponse<DoctorResponse>>(`/api/doctor/detail/${doctorId}`);
  return res.data;
};




//✅ 추가
export const createDoctorApi = async (doctorReq: DoctorCreateRequest): Promise<ApiResponse<DoctorResponse>> => {
  console.log(doctorReq);
  const res = await doctorAPI.post<ApiResponse<DoctorResponse>>(`/api/doctor/create`, doctorReq);
  return res.data;
};



//✅ 수정 - doctorId 사용 (PATCH 메서드)
export const updateDoctorApi = async (doctorId: number,doctorReq: DoctorUpdateRequest): Promise<ApiResponse<DoctorResponse>> => {
  
  const res = await doctorAPI.patch<ApiResponse<DoctorResponse>>(`/api/doctor/update/${doctorId}`, doctorReq);
  return res.data;
};


//✅ 삭제 - doctorId 사용
export const deleteDoctorApi = async (doctorId: number): Promise<ApiResponse<void>> => {
  
  const res = await doctorAPI.delete<ApiResponse<void>>(`/api/doctor/delete/${doctorId}`);
  return res.data;
};



// ✅ 첨부 업로드: 
export async function uploadFileApi(  doctorId: number,file: File):  //입력
Promise<ApiResponse<FileUploadResDTO>> {

  const form = new FormData();
        form.append("DoctorFile", file);  

  const res = await doctorAPI.post<ApiResponse<FileUploadResDTO>>(`/api/doctor/profile/upload/${doctorId}`, //반환
        form
  );
  return res.data;
}


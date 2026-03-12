
import {
  ApiResponse,
  FileUploadResDTO,
  NurseCreateRequest,
  NurseIdnNumber,
  NurseResponse,
  NurseUpdateRequest,
} from "@/features/employee/nurse/nurseTypes";
import axios from "axios";




//🧠
const NURSE_API_BASE_URL = "http://192.168.1.58:8022";

const apiNurse = axios.create({
  baseURL: NURSE_API_BASE_URL,


});




// ✅ 간호사 리스트
export const nurselistApi = async (): Promise<ApiResponse<NurseResponse[]>> => {
  const response = await apiNurse.get<ApiResponse<NurseResponse[]>>(`/api/nurse/list`);
  return response.data;
};


// ✅ 간호사 상세 (userId 기준)
export const DetailNurseApi = async ({ nurseId }: NurseIdnNumber): Promise<ApiResponse<NurseResponse>> => {
  const response = await apiNurse.get<ApiResponse<NurseResponse>>(`/api/nurse/detail/${nurseId}`);
  return response.data;
};


// ✅ 간호사 생성
export const createNurseApi = async (nurseReq: NurseCreateRequest): Promise<ApiResponse<NurseResponse>> => {
  const response = await apiNurse.post<ApiResponse<NurseResponse>>(`/api/nurse/create`, nurseReq);
  return response.data;
};


// ✅ 간호사 수정
export const updateNursedApi = async (nurseId: number ,nurseReq: NurseUpdateRequest): Promise<ApiResponse<NurseResponse>> => {
  const response = await apiNurse.put<ApiResponse<NurseResponse>>(`/api/nurse/edit/${nurseId}`,nurseReq);
  return response.data;
};


// ✅ 간호사 삭제/비활성 (id 기준: 백엔드 엔드포인트에 맞게 경로는 조정 가능)
export const deleteNurseApi = async (nurseId: number): Promise<ApiResponse<void>> => {
  const response = await apiNurse.delete<ApiResponse<void>>(`/api/nurse/delete/${nurseId}`);
  return response.data;
};

// ✅ 첨부 업로드: 
export async function uploadFileApi(  nurseId: number,file: File):  //입력
Promise<ApiResponse<FileUploadResDTO>> {

  const form = new FormData();
        form.append("NurseFile", file);  

  const res = await apiNurse.post<ApiResponse<FileUploadResDTO>>(`/api/nurse/profile/upload/${nurseId}`, //반환
        form
  );
  return res.data;
}
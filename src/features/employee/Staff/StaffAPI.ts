import axios from "axios";
import type { ApiResponse,AuthenticationRequest, AuthenticationResponse, } from "./StaffType";

export const authenticationApiClient = axios.create({
  baseURL: "/api/authentication",
  withCredentials: true,
  validateStatus: s => s >= 200 && s < 500,
});




//추가
export const createAuthenticationApi = async (authReq:AuthenticationRequest): Promise<ApiResponse<AuthenticationResponse>> => {
  
  const res = await authenticationApiClient.post<ApiResponse<AuthenticationResponse>>(`/create`, authReq);
  return res.data;
};



// 상세
export const fetchAuthenticationDetailApi = async (
  authenticationId: number
): Promise<ApiResponse<AuthenticationResponse>> => {
  const res = await authenticationApiClient.get<ApiResponse<AuthenticationResponse>>(`/detail/${authenticationId}`);
  return res.data;
};




// // 수정 - authenticationId 사용 (PATCH 메서드)
// export const updateAuthenticationApi = async (
//   authenticationId: number,
//   authReq: AuthenticationUpdateRequest["req"]
// ): Promise<ApiResponse<AuthenticationResponse>> => {
//   const res = await authenticationApiClient.patch<ApiResponse<AuthenticationResponse>>(`/${authenticationId}/update`, authReq);
//   return res.data;
// };

// // 삭제 - authenticationId 사용
// export const deleteAuthenticationApi = async (
//   authenticationId: number
// ): Promise<ApiResponse<void>> => {
//   const res = await authenticationApiClient.delete<ApiResponse<void>>(`/${authenticationId}`);
//   return res.data;
// };

// ✅ 의사응답
export type DoctorResponse = {

  doctorId       : number;   // 의사 사번코드
  licenseNo      : string;   // 면허 번호
  doctorType     : string;   // 고정 타입 (DOCTOR)
  specialtyId    : string;   // 진료과 코드 FK

  doctorFileUrl  : string;   // 프로필 이미지
  profileSummary : string;   // 한줄 소개
  education      : string;   // 학력
  careerDetail   : string;   // 경력
};






//참조값 (하드코딩)
export type DoctorIdNumber = {
  doctorId: number;
};

// ✅ 의사생성
export type DoctorCreateRequest = {

  licenseNo      : string;   // 면허 번호
  specialtyId    : string;   // 진료과 코드

  doctorFileUrl  : string;   // 프로필 이미지
  profileSummary : string;   // 한줄 소개
  education      : string;   // 학력
  careerDetail   : string;   // 경력
};

export const initialDoctorCreateForm: DoctorCreateRequest = {

  licenseNo      : "",
  specialtyId    : "",

  doctorFileUrl  : "",
  profileSummary : "",
  education      : "",
  careerDetail   : ""
};






// ✅ 의사수정 
export type DoctorUpdateRequest = {


  licenseNo      : string;
  specialtyId    : string;

  doctorFileUrl  : string;
  profileSummary : string;
  education      : string;
  careerDetail   : string;
};

export const initialDoctorUpdateForm: DoctorUpdateRequest = {

  licenseNo      : "",
  specialtyId    : "",

  doctorFileUrl  : "",
  profileSummary : "",
  education      : "",
  careerDetail   : ""
};
//참조값 (하드코딩)
export type DoctorUpdateNumber = {
  doctorId: number;
  doctorReq: DoctorUpdateRequest
};















//업로드 요청
export type DoctorFile = {
  doctorId       : number; 
  file           : File;
};


//서버가 업로드후 반환
export type FileUploadResDTO = {
  fileUrl: string;
  objectKey: string;
  contentType: string;
  size: number;
  originalName: string;
}









export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};




// ✅ 간호사 응답(서버 → 프론트)
export type NurseResponse = {
  // sfaffId       : number;

  nurseId       : number;
  unitId        : string;    //간호사 사번코드 [업무용]
  shiftType     : string;    //근무형태 “DAY”, “EVENING”, “NIGHT”, “3교대”, “2교대” 등)
  employmentType: string;   //“정규직”, “계약직”, “파트타임” 등)
  nurseFileUrl  : string;  
  education     : string;    //학력
  careerDetail  : string;    //경력 상세
};

//참조값 (하드코딩)
export type NurseIdnNumber = { 
  nurseId: number
};





// ✅ 간호사 생성 요청(프론트 → 서버)
export type NurseCreateRequest = {

  unitId        : string;    //간호사 사번코드 [업무용]
  shiftType     : string;    //근무형태 “DAY”, “EVENING”, “NIGHT”, “3교대”, “2교대” 등)
  employmentType: string;    //“정규직”, “계약직”, “파트타임” 등)
  nurseFileUrl  : string;
  education     : string;    //학력
  careerDetail  : string;    //경력 상세
};

// ✅ 폼 초기값
export const initialNurseCreateForm: NurseCreateRequest = {

  unitId        : "",    //간호사 사번코드 [업무용]
  shiftType     : "",   //근무형태 “DAY”, “EVENING”, “NIGHT”, “3교대”, “2교대” 등)
  employmentType: "",   //“정규직”, “계약직”, “파트타임” 등)
  nurseFileUrl  : "",
  education     : "",    //학력
  careerDetail  : ""    //경력 상세
};







// ✅ 간호사 수정 
export type NurseUpdateRequest = {

  unitId        : string;    //간호사 사번코드 [업무용]
  shiftType     : string;    //근무형태 “DAY”, “EVENING”, “NIGHT”, “3교대”, “2교대” 등)
  employmentType: string;    //“정규직”, “계약직”, “파트타임” 등)
  nurseFileUrl  : string;
  education     : string;    //학력
  careerDetail  : string;    //경력 상세
};

export const initialNurseUpdateForm: NurseUpdateRequest = {

  unitId        : "",    //간호사 사번코드 [업무용]
  shiftType     : "",    //근무형태 “DAY”, “EVENING”, “NIGHT”, “3교대”, “2교대” 등)
  employmentType: "",    //“정규직”, “계약직”, “파트타임” 등)
  nurseFileUrl  : "",
  education     : "",    //학력
  careerDetail  : "",    //경력 상세
};
//참조값 보내기 (하드코딩)
export type NurseUpdateNumber = { 
  nurseId: number
  nurseReq:NurseUpdateRequest  
};






//업로드 요청
export type NurseFile = {
  nurseId       : number; 
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






// 공통 
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

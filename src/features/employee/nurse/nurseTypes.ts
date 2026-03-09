// 공통 
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};


// ✅ 간호사 응답(서버 → 프론트)
export type NurseResponse = {
  nurseId: number;
 

  nurseGrade: string; //간호사 등급 /직급
  unitId: string;    //간호사 사번코드 [업무용]
  shiftType: string;  //근무형태 “DAY”, “EVENING”, “NIGHT”, “3교대”, “2교대” 등)
  department: string;  //소석  부서

  employmentType: string;    //“정규직”, “계약직”, “파트타임” 등)
  status: string;    //재직/상태 (예: “ACTIVE/INACTIVE”, “재직/휴직/퇴사” 등)        
};






// ✅ 상세/삭제 등 "식별자" payload
export type NurseIdnNumber = { 
  nurseId: number
  nurseReq: NurseUpdateRequest;
};


// ✅ 간호사 생성 요청(프론트 → 서버)
export type NurseCreateRequest = {

  nurseGrade: string; ////간호사 등급 /직급
  unitId: string;
  shiftType: string;
  department: string;  //소석  부서

  employmentType: string;
  status: string;
};

// ✅ 폼 초기값
export const initialNurseCreateForm: NurseCreateRequest = {

  nurseGrade: "",
  unitId: "",
  shiftType: "",
  department: "",

  employmentType: "",
  status: "",
};







// ✅ 간호사 수정 요청(프론트 → 서버)
export type NurseUpdateRequest = {

  nurseGrade: string;
  unitId: string;
  shiftType: string;
  department: string;

  employmentType: string;
  status: string;
};

export const initialNurseUpdateForm: NurseUpdateRequest = {

  nurseGrade: "",
  unitId: "",
  shiftType: "",
  department: "",

  employmentType: "",
  status: "",
};

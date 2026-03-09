//애가 뷰

export type DoctorListView = {
  doctorId: number;
  authenticationId: number;
  realName: string;
  position: string;
  specialtyCode: string;   //진료코드
  doctorFileUrl?: string | null;
  profileSummary?: string | null;  //한줄소개
};


//애가 뷰

export type DoctorDetailResView = {
  doctorId: number;
  authenticationId: number;
  realName: string;
  phone: string;
  email: string;


  position: string;
  specialtyCode: string;   //진료코드
  doctorFileUrl?: string | null;
  profileSummary?: string | null;  //한줄소개
  education?: string | null;
  careerDetail?: string | null; //경력사항
};







// 3) 응답
// 서버 → 프론트 응답
export type DoctorResponse = {
  doctorId: number;           // 
  authenticationId: number;  // 


  realName: string; //이름
  email: string;
  doctorFileUrl : string | null;

  licenseNo: string;
  doctorType: string;        // DB default = 'DOCTOR'
  position: string;
  specialtyCode: string;
     
};



// 2) 요청(서버로 보낼 값)
export type DoctorCreateRequest = {
 

    licenseNo: string;
    position: string;
    specialtyCode: string;
     profileSummary?: string;   // ✅ 추가
  education?: string;        // ✅ 추가
  careerDetail?: string;     // ✅ 추가 (길면 textarea)

};

export const initialDoctorCreatForm: DoctorCreateRequest = {
 
  licenseNo: "",
  position: "",
  specialtyCode: "",
   profileSummary: "",
  education: "",
  careerDetail: "",
};






// 수정
export type DoctorUpdateRequest = {
  authenticationId: number;
  req: {
    licenseNo: string;
  
    position: string;
    specialtyCode: string;
   
  };
};



// 삭제
export type DoctorDeleteRequest = {
  authenticationId: number;
};






//API용 파일 업로드  (도메인별 분리)
export type FileUploadResDTO = {

  fileUrl: string;
  objectKey: string;
  contentType: string;
  size: number;
  originalName: string;
};





export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};


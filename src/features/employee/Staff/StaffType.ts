

// ✅ 개인정보(회원상세) 응답 타입
export type staffResponse ={
    
    staffId       : number;
    dapartmemntId : number;
    
    realName    : string;
    phone       : string;
    userId      : string;
    email       : string;
    sex         : string;
    birthDate   : string;    // 생년월일
    genderCode : string;    //주민번호 뒷자리
    
    zipCode   : string;
    address1  : string;
    address2  : string;
    
}




// ✅추가 개인정보
export type staffCreateRequest = {

    realName    : string;
    phone       : string;
    userId      : string;
    email       : string;
    sex         : string;
    birthDate   : string;    // 생년월일
    genderCode : string;    //주민번호 뒷자리
    
    zipCode   : string;
    address1  : string;
    address2  : string;
    
}

export const  initialstaffCreateForm :  staffCreateRequest = { //회원가입 입력용 초기값 
    realName    : "",
    phone       : "",
    userId      : "",
    email       : "",
    sex         : "",
    birthDate   : "",    // 생년월일
    genderCode  : "",    //주민번호 뒷자리
    
    zipCode   : "",
    address1  : "",
    address2  : "",
    
}







// ✅ 상세/삭제 등 "식별자" payload (임시)
export type staffIdnNumber = { 
  staffId: number
  staffReq: staffUpdateRequest;
};

// ✅ 수정 개인정보
export type staffUpdateRequest = {


    realName    : string;
    phone       : string;
    userId      : string;
    email       : string;
    sex         : string;
    birthDate   : string;    // 생년월일
    genderCode : string;    //주민번호 뒷자리
    
    zipCode   : string;
    address1  : string;
    address2  : string;
    
}
export const  initialstaffUpdateForm :  staffUpdateRequest = { //회원가입 입력용 초기값 
    realName    : "",
    phone       : "",
    userId      : "",
    email       : "",
    sex         : "",
    birthDate   : "",      // 생년월일
    genderCode  : "",      //주민번호 뒷자리
    
    zipCode   : "",
    address1  : "",
    address2  : "",
    
}





export type ApiResponse<T> = {
success: boolean;
message: string;
data: T;
};


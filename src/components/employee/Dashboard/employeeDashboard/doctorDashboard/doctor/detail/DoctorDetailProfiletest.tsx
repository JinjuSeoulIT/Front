// "use client";

// import { useEffect } from "react";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import { DoctorProfileByIdRequest} from "@/components/fatures/doctor/doctorSlice";

// type DoctorDetailProps = {
//   doctorId: number;
// };




// const DoctorDetailProfile = ({ doctorId }: DoctorDetailProps) => {
//   const dispatch = useAppDispatch();
//   const { DoctorDetail, loading, error } = useAppSelector((state) => state.doctor);

//   useEffect(() => {
//     if (doctorId > 0) {
//       dispatch(DoctorProfileByIdRequest(doctorId));
//     }
//   }, [dispatch, doctorId]);






// if (loading) return <div>불러오는 중...</div>;
// if (error) return <div>에러: {error}</div>;
// if (!DoctorDetail) return <div>의사 정보를 찾을 수 없습니다.</div>;



  
//   return (
//     <div style={{ maxWidth: 520 }}>
//       <h2>의사 상세</h2>
//       <div>의사 이름 : {DoctorDetail.realName}</div>
    



//      {DoctorDetail.doctorFileUrl && (
//   <img
//     src={DoctorDetail.doctorFileUrl}
//     alt="의사 프로필"
//     style={{ width: 160, height: 160, objectFit: "cover" }}
//   />
// )}


//       <div>이메일 : {DoctorDetail.email}</div>
//       <div>전화번호: {DoctorDetail.phone}</div>
//       <div>직책: {DoctorDetail.position}</div>
//       <div>경력: {DoctorDetail.careerDetail}</div>
//       <div>진료과 코드: {DoctorDetail.specialtyCode}</div>
//       <div>한줄소개: {DoctorDetail.profileSummary}</div>
      
//       <div></div>
//     </div>
//   );
// };

// export default DoctorDetailProfile;

// "use client";

// import { useEffect } from "react";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import { DoctorByIdRequest} from "@/components/fatures/doctor/doctorSlice";

// type DoctorDetailProps = {
//   authenticationId: number;
// };




// const DoctorDetail = ({ authenticationId }: DoctorDetailProps) => {
//   const dispatch = useAppDispatch();
//   const { doctor, loading, error } = useAppSelector((state) => state.doctor);

//   useEffect(() => {
//     if (authenticationId > 0) {
//       dispatch(DoctorByIdRequest(authenticationId));
//     }
//   }, [dispatch, authenticationId]);





  
//   if (loading) return <div>불러오는 중...</div>;
//   if (error) return <div>에러: {error}</div>;
//   if (!doctor) return <div>의사 정보를 찾을 수 없습니다.</div>;



  
//   return (
//     <div style={{ maxWidth: 520 }}>
//       <h2>의사 상세</h2>
//       <div>의사 구분: {doctor.doctorType}</div>
//       <div>면허번호: {doctor.licenseNo}</div>
//       <div>직책: {doctor.position}</div>
//       <div>진료과 코드: {doctor.specialtyCode}</div>
//     </div>
//   );
// };

// export default DoctorDetail;

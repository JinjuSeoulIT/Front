// "use client";

// import { ChangeEvent, FormEvent, useEffect, useState } from "react";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import {
// DoctorCreateRequest,
// DoctorUpdateRequest,
// initialDoctorCreatForm,

// } from "@/components/fatures/doctor/doctortypes";
// import {

// // DoctorByIdRequest,
// updateDoctorRequest,

// } from "@/components/fatures/doctor/doctorSlice";

// type DoctorUpdateProps = {
// authenticationId: number;
// };

// const DoctorUpdate = ({ authenticationId }: DoctorUpdateProps) => {
//     const dispatch = useAppDispatch();
//     const { doctor, loading, error } = useAppSelector((state) => state.doctor);
//     const [form, setForm] = useState<DoctorCreateRequest>(initialDoctorCreatForm);

//   // 최초 로딩 시 기존 데이터 가져오기
// useEffect(() => {
// if (authenticationId > 0) {
//     dispatch(DoctorByIdRequest(authenticationId));
//     }
//     }, [dispatch, authenticationId]);

//   // 조회된 데이터를 폼에 반영
//     useEffect(() => {
//     if (!doctor) return;
//     if (doctor.authenticationId !== authenticationId) return;
//     setForm({
//     licenseNo: doctor.licenseNo ?? "",
  
//     position: doctor.position ?? "",
//     specialtyCode: doctor.specialtyCode ?? "",
//     });
//     }, [doctor, authenticationId]);




//     const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = event.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//     };





//     const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     const payload: DoctorUpdateRequest = {
//     authenticationId,
//     req: {
//         licenseNo: (form.licenseNo ?? "").trim(),
       
//         position: (form.position ?? "").trim(),
//         specialtyCode: (form.specialtyCode ?? "").trim(),
      
//     },
//     };
//     dispatch(updateDoctorRequest(payload));
//     };



//     return (
//     <div style={{ maxWidth: 420 }}>
//     <h3>의사 상세정보 수정</h3>

//     <form onSubmit={handleSubmit}>
//         <label>면허번호</label>
//         <p>
//           <input name="licenseNo" value={form.licenseNo} onChange={handleChange} />
//         </p>

//         <label>의사 구분</label>
//         <p>
          
//         </p>

//         <label>직책</label>
//         <p>
//           <input name="position" value={form.position} onChange={handleChange} />
//         </p>

//         <label>진료과 코드</label>
//         <p>
//           <input name="specialtyCode" value={form.specialtyCode} onChange={handleChange} />
//         </p>

//         <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
//           {loading ? "처리중..." : "수정하기"}
//         </button>
//       </form>

//       {error && <p style={{ color: "red" }}>에러: {String(error)}</p>}
//     </div>
//   );
// };

// export default DoctorUpdate;

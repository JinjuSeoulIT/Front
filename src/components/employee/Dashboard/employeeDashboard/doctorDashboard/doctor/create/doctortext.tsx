// "use client";

// import { ChangeEvent, FormEvent, Suspense, useEffect, useState } from "react";
// import {  useRouter } from "next/navigation";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import { createDoctorRequest } from "@/components/fatures/doctor/doctorSlice";
// import {  DoctorCreateRequest, initialDoctorCreatForm } from "@/components/fatures/doctor/doctortypes";

// const DoctorCreateContent = () => {
//   const dispatch = useAppDispatch();
//   const router = useRouter();



//   const { loading, error, createSuccess } = useAppSelector((s) => s.doctor);
//   const [form, setForm] = useState<DoctorCreateRequest>(initialDoctorCreatForm);



//   const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//     const doctorreq : DoctorCreateRequest = {
      
//       licenseNo: (form.licenseNo ?? "").trim(),
     
//       position: (form.position ?? "").trim(),
//       specialtyCode: (form.specialtyCode ?? "").trim(),
//     };

//     dispatch(createDoctorRequest(  doctorreq ));
//   };

  
//   const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
//   const { name, value } = event.target;
//   setForm((prev) => ({ ...prev, [name]: value }));
//   };


// useEffect(() => {
//     if (createSuccess && !loading) {
//       router.push("/");
//     }
//   }, [createSuccess, loading, router]);


//   // if (!authenticationId) {
//   //   return (
//   //     <div>
//   //       <p>잘못된 요청입니다.</p>
//   //       <button onClick={() => router.back()}>돌아가기</button>
//   //     </div>
//   //   );
//   // }

//   return (
//     <div style={{ maxWidth: 420 }}>
//       <h3>의사 기본정보 생성</h3>

//       <form onSubmit={handleSubmit}>
//         <label>면허번호</label>
//         <p>
//           <input name="licenseNo" value={form.licenseNo} onChange={handleChange} />
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
//           {loading ? "처리중..." : "생성하기"}
//         </button>
//       </form>

//       {error && <p style={{ color: "red" }}>에러: {String(error)}</p>}
//     </div>
//   );
// };

// const DoctorCreate = () => {
//   return (
//     <Suspense fallback={<div>로딩 중...</div>}>
//       <DoctorCreateContent />
//     </Suspense>
//   );
// };

// export default DoctorCreate;

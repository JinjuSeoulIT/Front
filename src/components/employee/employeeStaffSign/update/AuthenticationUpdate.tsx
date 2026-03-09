// "use client";

// import { ChangeEvent, FormEvent, useEffect, useState } from "react";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import {
//   AuthenticationCreateForm,
//   AuthenticationUpdateRequest,
//   initialAuthenticationCreateForm,
// } from "@/components/fatures/doctor/doctortypes";


// import {
//   fetchAuthenticationByIdRequest,
//   updateAuthenticationRequest,
// } from "@/components/fatures/Authentication/AuthenticationSlict";

// type AuthenticationUpdateProps = {
//   authenticationId: number;
// };

// const AuthenticationUpdate = ({ authenticationId }: AuthenticationUpdateProps) => {
//   const dispatch = useAppDispatch();
//   const { authentication, loading, error } = useAppSelector((state) => state.authentication);
//   const [form, setForm] = useState<AuthenticationCreateForm>(initialAuthenticationCreateForm);

//   useEffect(() => {
//     if (authenticationId > 0) {
//       dispatch(fetchAuthenticationByIdRequest(authenticationId));
//     }
//   }, [dispatch, authenticationId]);

//   useEffect(() => {
//     if (!authentication) return;
//     if (authentication.authenticationId !== authenticationId) return;
//     setForm({
//       realName: authentication.realName ?? "",
//       phone: authentication.phone ?? "",
//       email: authentication.email ?? "",
//       birthDate: authentication.birthDate ?? "",
//       sex: authentication.sex ?? "",
//       zipCode: authentication.zipCode ?? "",
//       address1: authentication.address1 ?? "",
//       address2: authentication.address2 ?? "",
//       nationCode: authentication.nationCode ?? "",
//     });
//   }, [authentication, authenticationId]);

//   const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = event.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     const payload: AuthenticationUpdateRequest = {
//       authenticationId,
//       req: {
//         realName: (form.realName ?? "").trim(),
//         phone: (form.phone ?? "").trim(),
//         email: (form.email ?? "").trim(),
//         birthDate: (form.birthDate ?? "").trim(),
//         sex: (form.sex ?? "").trim(),
//         zipCode: form.zipCode?.trim(),
//         address1: form.address1?.trim(),
//         address2: form.address2?.trim(),
//         nationCode: form.nationCode?.trim(),
//       },
//     };
//     dispatch(updateAuthenticationRequest(payload));
//   };

//   return (
//     <div style={{ maxWidth: 420 }}>
//       <h3>인증 상세정보 수정</h3>

//       <form onSubmit={handleSubmit}>
//         <label>이름</label>
//         <p>
//           <input name="realName" value={form.realName} onChange={handleChange} />
//         </p>

//         <label>전화</label>
//         <p>
//           <input name="phone" value={form.phone} onChange={handleChange} />
//         </p>

//         <label>이메일</label>
//         <p>
//           <input name="email" value={form.email} onChange={handleChange} />
//         </p>

//         <label>생년월일</label>
//         <p>
//           <input name="birthDate" value={form.birthDate} onChange={handleChange} />
//         </p>

//         <label>성별</label>
//         <p>
//           <input name="sex" value={form.sex} onChange={handleChange} />
//         </p>

//         <label>우편번호</label>
//         <p>
//           <input name="zipCode" value={form.zipCode} onChange={handleChange} />
//         </p>

//         <label>주소1</label>
//         <p>
//           <input name="address1" value={form.address1} onChange={handleChange} />
//         </p>

//         <label>주소2</label>
//         <p>
//           <input name="address2" value={form.address2} onChange={handleChange} />
//         </p>

//         <label>국가코드</label>
//         <p>
//           <input name="nationCode" value={form.nationCode} onChange={handleChange} />
//         </p>

//         <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
//           {loading ? "처리중..." : "수정하기"}
//         </button>
//       </form>

//       {error && <p style={{ color: "red" }}>에러: {String(error)}</p>}
//     </div>
//   );
// };

// export default AuthenticationUpdate;

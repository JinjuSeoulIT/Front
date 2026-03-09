// "use client";

// import { useEffect } from "react";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import { fetchAuthenticationByIdRequest } from "@/components/fatures/Authentication/AuthenticationSlict";

// type AuthenticationDetailProps = {
//   authenticationId: number;
// };

// const AuthenticationDetail = ({ authenticationId }: AuthenticationDetailProps) => {
//   const dispatch = useAppDispatch();
//   const { authentication, loading, error } = useAppSelector((state) => state.authentication);

//   useEffect(() => {
//     if (authenticationId > 0) {
//       dispatch(fetchAuthenticationByIdRequest(authenticationId));
//     }
//   }, [dispatch, authenticationId]);

//   if (loading) return <div>불러오는 중...</div>;
//   if (error) return <div>에러: {error}</div>;
//   if (!authentication) return <div>인증 정보를 찾을 수 없습니다.</div>;

//   return (
//     <div style={{ maxWidth: 520 }}>
//       <h2>인증 상세</h2>
//       <div>이름: {authentication.realName}</div>
//       <div>전화: {authentication.phone}</div>
//       <div>이메일: {authentication.email}</div>
//       <div>생년월일: {authentication.birthDate}</div>
//       <div>성별: {authentication.sex}</div>
//       {authentication.zipCode && <div>우편번호: {authentication.zipCode}</div>}
//       {authentication.address1 && <div>주소1: {authentication.address1}</div>}
//       {authentication.address2 && <div>주소2: {authentication.address2}</div>}
//       {authentication.nationCode && <div>국가코드: {authentication.nationCode}</div>}
//     </div>
//   );
// };

// export default AuthenticationDetail;

// "use client";

// import { useEffect, Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import { deleteAuthenticationRequest, authenticationReset } from "@/components/fatures/Authentication/AuthenticationSlict";

// const AuthenticationDeleteContent = () => {
//   const dispatch = useAppDispatch();
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const { loading, error, deleteSuccess } = useAppSelector((s) => s.authentication);
//   const authenticationId = Number(searchParams.get("authenticationId") ?? 0);

//   const onConfirm = () => {
//     if (!authenticationId) return;
//     dispatch(deleteAuthenticationRequest({ authenticationId }));
//   };

//   useEffect(() => {
//     return () => {
//       dispatch(authenticationReset());
//     };
//   }, [dispatch]);

//   useEffect(() => {
//     if (deleteSuccess && !loading) {
//       router.push("/");
//     }
//   }, [deleteSuccess, loading, router]);

//   if (!authenticationId) {
//     return (
//       <div>
//         <p>잘못된 요청입니다.</p>
//         <button onClick={() => router.back()}>돌아가기</button>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <p>정말로 인증 정보를 삭제하시겠습니까?</p>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       <button onClick={onConfirm} disabled={loading} style={{ marginRight: 8 }}>
//         {loading ? "삭제 중..." : "삭제하기"}
//       </button>
//       <button onClick={() => router.back()} disabled={loading}>
//         취소
//       </button>
//     </div>
//   );
// };

// const AuthenticationDelete = () => {
//   return (
//     <Suspense fallback={<div>로딩 중...</div>}>
//       <AuthenticationDeleteContent />
//     </Suspense>
//   );
// };

// export default AuthenticationDelete;

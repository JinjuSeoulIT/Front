"use client";

import { ChangeEvent, FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {  AuthenticationRequest,  initialAuthenticationCreateForm } from "@/components/fatures/Authentication/AuthenticationType";
import { createAuthenticationRequest } from "@/components/fatures/Authentication/AuthenticationSlict";

const AuthenticationCreate = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();


  const { createSuccess,loading, error } = useAppSelector((state) => state.authentication);





  const [form, setForm] = useState<AuthenticationRequest>(initialAuthenticationCreateForm);
//생성 폼
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {

    event.preventDefault();

const authReq: AuthenticationRequest = {
  
      realName: (form.realName?? "").trim(),
      phone: (form.phone ?? "").trim(),
      email: (form.email ?? "").trim(),
      birthDate: (form.birthDate ?? "").trim(),
      sex: form.sex,
      zipCode: (form.zipCode ?? "").trim(),
      address1: (form.address1 ?? "").trim(),
      address2: (form.address2 ?? "").trim(),
      nationCode: (form.nationCode ?? "").trim(),
    };
  


  dispatch(createAuthenticationRequest(authReq));
};





  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (createSuccess) {
      router.push("/"); // ✅ 생성 성공 후 이동할 경로로 바꿔
    }
  }, [createSuccess, router]);


  return (
    <div style={{ maxWidth: 420 }}>
      <h3>인증 기본정보 생성</h3>

      <form onSubmit={handleSubmit}>
        <label>이름</label>
        <p>
          <input name="realName" value={form.realName} onChange={handleChange} />
        </p>

        <label>전화</label>
        <p>
          <input name="phone" value={form.phone} onChange={handleChange} />
        </p>

        <label>이메일</label>
        <p>
          <input name="email" value={form.email} onChange={handleChange} />
        </p>
<label>생년월일</label>
        <input
  type="date"
  name="birthDate"
  value={form.birthDate ?? ""}
  onChange={handleChange}
/>

        <label>성별</label>
        <p>
          <input name="sex" value={form.sex} onChange={handleChange} />
        </p>

        <label>우편번호</label>
        <p>
          <input name="zipCode" value={form.zipCode} onChange={handleChange} />
        </p>

        <label>주소1</label>
        <p>
          <input name="address1" value={form.address1} onChange={handleChange} />
        </p>

        <label>주소2</label>
        <p>
          <input name="address2" value={form.address2} onChange={handleChange} />
        </p>

        <label>국가코드</label>
        <p>
          <input name="nationCode" value={form.nationCode} onChange={handleChange} />
        </p>

        <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? "처리중..." : "생성하기"}
        </button>
      </form>

     
    </div>
  
  );
};



export default AuthenticationCreate;

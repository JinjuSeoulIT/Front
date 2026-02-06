"use client";

import React, { FormEvent, useEffect, useState } from "react";
import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

type DaumPostcodeResult = {
  zonecode?: string;
  roadAddress?: string;
  jibunAddress?: string;
  userSelectedType?: "R" | "J";
};

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeResult) => void;
      }) => {
        open: () => void;
      };
    };
  }
}

const DAUM_POSTCODE_SCRIPT =
  "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

export const INITIAL_FORM = {
  employeeId: "",
  name: "",
  emailLocal: "",
  emailDomain: "naver.com",
  department: "",
  gender: "",
  birthDate: "",
  phonePrefix: "010",
  phoneMiddle: "",
  phoneLast: "",
  zipCode: "",
  address1: "",
  address2: "",
  position: "",
  delted_yn: "Y",
};

export type EmployeeRegisterFormState = typeof INITIAL_FORM;

interface Props {
  loading: boolean;
  onSave: (form: EmployeeRegisterFormState) => void;
  onCancel: () => void;
}

const EmployeeRegisterForm = ({ loading, onSave, onCancel }: Props) => {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = document.querySelector(
      `script[src="${DAUM_POSTCODE_SCRIPT}"]`
    );
    if (existing) return;
    const script = document.createElement("script");
    script.src = DAUM_POSTCODE_SCRIPT;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  type InputEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
  type SelectEvent = SelectChangeEvent<string>;
  type CommonEvent = InputEvent | SelectEvent;

  const handleChange =
    (key: keyof typeof form) => (event: CommonEvent) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const handlePhoneChange =
    (key: "phoneMiddle" | "phoneLast") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const digits = event.target.value.replace(/[^0-9]/g, "");
      const maxLength =
        key === "phoneMiddle" && form.phonePrefix !== "010" ? 3 : 4;
      setForm((prev) => ({ ...prev, [key]: digits.slice(0, maxLength) }));
    };

  const handlePhonePrefixChange = (event: SelectChangeEvent<string>) => {
    setForm((prev) => ({
      ...prev,
      phonePrefix: event.target.value,
      phoneMiddle: "",
      phoneLast: "",
    }));
  };

  const handleAddressSearch = () => {
    if (typeof window === "undefined" || !window.daum?.Postcode) {
      alert(
        "주소 검색 스크립트가 아직 초기화되지 않았습니다. 잠시 후 다시 시도해 주세요."
      );
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data: DaumPostcodeResult) => {
        const address =
          data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
        setForm((prev) => ({
          ...prev,
          zipCode: data.zonecode ?? "",
          address1: address ?? "",
        }));
      },
    }).open();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="사번"
          placeholder="EMP-000"
          value={form.employeeId}
          onChange={handleChange("employeeId")}
          required
        />
        <TextField
          label="이름"
          placeholder="김철수"
          value={form.name}
          onChange={handleChange("name")}
          required
        />
        <Stack direction="row" spacing={1}>
          <TextField
            label="이메일 아이디"
            placeholder="kimyh"
            value={form.emailLocal}
            onChange={handleChange("emailLocal")}
            sx={{ flex: 1 }}
          />
          <Typography sx={{ alignSelf: "center" }}>@</Typography>
          <TextField
            label="이메일 도메인"
            placeholder="gmail.com"
            value={form.emailDomain}
            onChange={handleChange("emailDomain")}
            sx={{ flex: 1 }}
          />
        </Stack>
        <FormControl fullWidth>
          <InputLabel id="department-label">부서</InputLabel>
          <Select
            labelId="department-label"
            label="부서"
            value={form.department}
            onChange={handleChange("department")}
          >
            <MenuItem value="경영관리">경영관리</MenuItem>
            <MenuItem value="총무">총무</MenuItem>
            <MenuItem value="마케팅">마케팅</MenuItem>
            <MenuItem value="영업1팀">영업1팀</MenuItem>
            <MenuItem value="영업2팀">영업2팀</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="position-label">직책</InputLabel>
          <Select
            labelId="position-label"
            label="직책"
            value={form.position}
            onChange={handleChange("position")}
          >
            <MenuItem value="인턴">인턴</MenuItem>
            <MenuItem value="사원">사원</MenuItem>
            <MenuItem value="주임">주임</MenuItem>
            <MenuItem value="대리">대리</MenuItem>
            <MenuItem value="과장">과장</MenuItem>
            <MenuItem value="차장">차장</MenuItem>
            <MenuItem value="부장">부장</MenuItem>
            <MenuItem value="임원">임원</MenuItem>
          </Select>
        </FormControl>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl component="fieldset">
            <FormLabel component="legend">성별</FormLabel>
            <RadioGroup row value={form.gender} onChange={handleChange("gender")}>
              <FormControlLabel value="M" control={<Radio />} label="남" />
              <FormControlLabel value="F" control={<Radio />} label="여" />
            </RadioGroup>
          </FormControl>
          <TextField
            label="생년월일"
            type="date"
            value={form.birthDate}
            onChange={handleChange("birthDate")}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1 }}
          />
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <FormControl sx={{ width: 140 }}>
            <InputLabel id="phone-prefix-label">번호</InputLabel>
            <Select
              labelId="phone-prefix-label"
              label="번호"
              value={form.phonePrefix}
              onChange={handlePhonePrefixChange}
            >
              {["010", "011", "016", "017", "018", "019"].map((prefix) => (
                <MenuItem key={prefix} value={prefix}>
                  {prefix}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography>-</Typography>
          <TextField
            placeholder="1234"
            value={form.phoneMiddle}
            onChange={handlePhoneChange("phoneMiddle")}
            inputProps={{
              inputMode: "numeric",
              maxLength: form.phonePrefix === "010" ? 4 : 3,
            }}
            sx={{ width: 140 }}
          />
          <Typography>-</Typography>
          <TextField
            placeholder="5678"
            value={form.phoneLast}
            onChange={handlePhoneChange("phoneLast")}
            inputProps={{ inputMode: "numeric", maxLength: 4 }}
            sx={{ width: 140 }}
          />
        </Stack>
        <Stack direction="row" spacing={1}>
          <TextField
            label="우편번호"
            placeholder="04567"
            value={form.zipCode}
            onChange={handleChange("zipCode")}
            sx={{ width: 180 }}
          />
          <Button variant="outlined" onClick={handleAddressSearch}>
            주소 찾기
          </Button>
        </Stack>
        <TextField
          label="주소"
          placeholder="서울시 강남구 테헤란로 100"
          value={form.address1}
          onChange={handleChange("address1")}
        />
        <TextField
          label="상세 주소"
          placeholder="1001호"
          value={form.address2}
          onChange={handleChange("address2")}
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button variant="outlined" onClick={onCancel}>
            목록
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "처리 중..." : "등록하기"}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};

export default EmployeeRegisterForm;
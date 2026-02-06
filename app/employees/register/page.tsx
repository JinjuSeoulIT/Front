"use client";

import React, { FormEvent, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import {
  createEmployeeRequest,
  uploadEmployeeImageRequest,
  resetEmployeeImageUpload,
} from "@/entities/employee/model/employeesSlice";

/* ================= 주소 검색 타입 ================= */

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

/* ================= 초기 폼 ================= */

const INITIAL_FORM = {
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
  profileImageUrl: "",
};

type FormState = typeof INITIAL_FORM;

/* ================= 페이지 ================= */

export default function EmployeeRegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    loading,
    error,
    imageUploading,
    imageUploadUrl,
    imageUploadError,
  } = useAppSelector((state) => state.employees);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImageFile, setIsImageFile] = useState(false);

  /* ================= Daum 주소 스크립트 ================= */

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

  /* ================= 이미지 업로드 상태 초기화 ================= */

  useEffect(() => {
    dispatch(resetEmployeeImageUpload());
  }, [dispatch]);

  /* ================= 직원 등록 후 처리 ================= */

  useEffect(() => {
    if (!submitted || loading) return;

    if (!error) {
      setToastOpen(true);
      setForm(INITIAL_FORM);
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsImageFile(false);
    }

    setSubmitted(false);
  }, [submitted, loading, error]);

  /* ================= 업로드 완료 이미지 반영 ================= */

  useEffect(() => {
    if (imageUploadUrl) {
      setForm((prev) => ({
        ...prev,
        profileImageUrl: imageUploadUrl,
      }));
    }
  }, [imageUploadUrl]);

  useEffect(() => {
    if (imageUploadError) {
      alert(imageUploadError);
    }
  }, [imageUploadError]);

  /* ================= 메모리 정리 ================= */

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /* ================= 공통 핸들러 ================= */

  type InputEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
  type SelectEvent = SelectChangeEvent<string>;
  type CommonEvent = InputEvent | SelectEvent;

  const handleChange =
    (key: keyof FormState) => (event: CommonEvent) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const handlePhoneChange =
    (key: "phoneMiddle" | "phoneLast") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const digits = event.target.value.replace(/[^0-9]/g, "");
      const maxLength =
        key === "phoneMiddle" && form.phonePrefix !== "010" ? 3 : 4;
      setForm((prev) => ({
        ...prev,
        [key]: digits.slice(0, maxLength),
      }));
    };

  const handlePhonePrefixChange = (
    event: SelectChangeEvent<string>
  ) => {
    setForm((prev) => ({
      ...prev,
      phonePrefix: event.target.value,
      phoneMiddle: "",
      phoneLast: "",
    }));
  };

  /* ================= 파일 선택 ================= */

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);

    if (!file) {
      setPreviewUrl(null);
      setIsImageFile(false);
      return;
    }

    const isImage = file.type.startsWith("image/");
    setIsImageFile(isImage);

    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  /* ================= 이미지 업로드 ================= */

  const handleImageUpload = () => {
    if (!selectedFile || imageUploading) return;
    dispatch(uploadEmployeeImageRequest(selectedFile));
  };

  /* ================= 주소 검색 ================= */

  const handleAddressSearch = () => {
    if (!window.daum?.Postcode) {
      alert("Address search widget failed to load.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data: DaumPostcodeResult) => {
        const address =
          data.userSelectedType === "R"
            ? data.roadAddress
            : data.jibunAddress;

        setForm((prev) => ({
          ...prev,
          zipCode: data.zonecode ?? "",
          address1: address ?? "",
        }));
      },
    }).open();
  };

  /* ================= 제출 ================= */

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // key- value 형태로 저장됨
    // 캡슐화가 되어있어서 직접 볼 순 없음.
    const formData = new FormData();

    // Binary Large Object 로 Blob라고 함
    formData.append(   "employee"   ,    new Blob(  [JSON.stringify(form)], { type: "application/json" }  ), "employee.json"   );

    if (selectedFile) 
    {
      // form.Data.append( "file" , new Blob( [selectedFileBinary], {type:selectedFile.type}))
      // file ⊂ Blob 관계.
      formData.append("file", selectedFile);
    }

// console.log(formData)  이걸로는 구조를 직접 못봄
// lombok때 생성되는 getter처럼 키 값을 주고 데이터를 받아와야 함
console.log(formData.get("employee"))
console.log(formData.get("file"))

dispatch(createEmployeeRequest(formData));

    
    
    setSubmitted(true);
  };

  /* ================= Render ================= */

  return (
    <Box maxWidth="520px" mx="auto" mt={5}>
      <Typography variant="h4" align="center" fontWeight={700} gutterBottom>
        직원 등록
      </Typography>

      <Typography align="center" color="text.secondary" mb={3}>
        필수 정보를 입력하고 새로운 직원을 등록하세요.
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {/* ================= 이미지 ================= */}
          <Stack spacing={1}>
            <Stack direction="row" spacing={1}>
              <Button component="label" variant="outlined">
                사진 선택
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              <Button
                variant="contained"
                onClick={handleImageUpload}
                disabled={!selectedFile || imageUploading}
              >
                {imageUploading ? "업로드 중..." : "사진 업로드"}
              </Button>
            </Stack>

            {/* 선택 즉시 미리보기 */}
            {selectedFile && (
              <Box>
                {isImageFile && previewUrl ? (
                  <>
                    {/* <Typography variant="caption" color="text.secondary">
                      선택한 이미지 미리보기
                    </Typography> */}
                    <Box
                      component="img"
                      src={previewUrl}
                      sx={{
                        mt: 1,
                        maxWidth: "100%",
                        maxHeight: 240,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    />
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    선택된 파일: {selectedFile.name}
                  </Typography>
                )}
              </Box>
            )}

            {/* 업로드 완료 이미지 */}
            {form.profileImageUrl && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  업로드된 이미지
                </Typography>
                <Box
                  component="img"
                  src={form.profileImageUrl}
                  sx={{
                    mt: 1,
                    maxWidth: "100%",
                    maxHeight: 240,
                    borderRadius: 1,
                  }}
                />
              </Box>
            )}
          </Stack>

          {/* ================= 이하 기존 폼 ================= */}
          <TextField
            label="사번"
            value={form.employeeId}
            onChange={handleChange("employeeId")}
            required
          />
          <TextField
            label="이름"
            value={form.name}
            onChange={handleChange("name")}
            required
          />

          <Stack direction="row" spacing={1}>
            <TextField
              label="이메일 아이디"
              value={form.emailLocal}
              onChange={handleChange("emailLocal")}
              sx={{ flex: 1 }}
            />
            <Typography sx={{ alignSelf: "center" }}>@</Typography>
            <TextField
              label="이메일 도메인"
              value={form.emailDomain}
              onChange={handleChange("emailDomain")}
              sx={{ flex: 1 }}
            />
          </Stack>

          <FormControl fullWidth>
            <InputLabel>부서</InputLabel>
            <Select value={form.department} label="부서" onChange={handleChange("department")}>
              {["경영관리", "총무", "마케팅", "사업1팀", "사업2팀"].map((v) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>직급</InputLabel>
            <Select value={form.position} label="직급" onChange={handleChange("position")}>
              {["사원", "대리", "주임", "과장", "차장", "부장", "이사"].map((v) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={2}>
            <FormControl>
              <FormLabel>성별</FormLabel>
              <RadioGroup row value={form.gender} onChange={handleChange("gender")}>
                <FormControlLabel value="M" control={<Radio />} label="남" />
                <FormControlLabel value="F" control={<Radio />} label="여" />
              </RadioGroup>
            </FormControl>
            <TextField
              type="date"
              label="생년월일"
              value={form.birthDate}
              onChange={handleChange("birthDate")}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <Stack direction="row" spacing={1}>
            <FormControl sx={{ width: 140 }}>
              <InputLabel>번호</InputLabel>
              <Select value={form.phonePrefix} label="번호" onChange={handlePhonePrefixChange}>
                {["010", "011", "016", "017", "018", "019"].map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField value={form.phoneMiddle} onChange={handlePhoneChange("phoneMiddle")} />
            <TextField value={form.phoneLast} onChange={handlePhoneChange("phoneLast")} />
          </Stack>

          <Stack direction="row" spacing={1}>
            <TextField label="우편번호" value={form.zipCode} onChange={handleChange("zipCode")} />
            <Button onClick={handleAddressSearch}>주소 찾기</Button>
          </Stack>

          <TextField label="주소" value={form.address1} onChange={handleChange("address1")} />
          <TextField label="상세 주소" value={form.address2} onChange={handleChange("address2")} />

          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button variant="outlined" onClick={() => router.push("/employees")}>
              목록
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "처리 중.." : "등록하기"}
            </Button>
          </Stack>
        </Stack>
      </form>

      <Snackbar
        open={toastOpen}
        autoHideDuration={2500}
        onClose={() => setToastOpen(false)}
        message="성공적으로 직원을 등록했습니다."
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}

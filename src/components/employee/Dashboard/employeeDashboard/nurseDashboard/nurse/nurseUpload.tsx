"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/rootReducer";

import type { AppDispatch } from "@/store/store";

import { Alert, Box, Button, CircularProgress, Divider, Paper, Stack, Typography } from "@mui/material";
import { NurseIdnNumber } from "@/features/employee/nurse/nurseTypes";
import { resetSuccessEnd, uploadNurseFileRequest } from "@/features/employee/nurse/nurseSlice";



export default function DoctorUpload({ nurseId }: NurseIdnNumber) {
  const dispatch = useDispatch<AppDispatch>();
  const { uploadLoading, uploadSuccess, error } = useSelector((state: RootState) => state.nurse);

  const [formDoctorFile, setDoctorFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (!formDoctorFile) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(formDoctorFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [formDoctorFile]);

  useEffect(() => {
    if (!uploadSuccess) return;

    setDoctorFile(null);
    setPreviewUrl("");
    dispatch(resetSuccessEnd());
  }, [uploadSuccess, dispatch]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setDoctorFile(selected);
  };

  const handleUpload = () => {
      console.log("upload doctorId =", nurseId);
    if (!formDoctorFile) return;

    dispatch(
      uploadNurseFileRequest({
        nurseId,
        file: formDoctorFile,
      }));};


 const handleReset = () => {
    setDoctorFile(null);
    setPreviewUrl("");
  };



  return (
<Box sx={{ maxWidth: 780, mx: "auto", px: { xs: 2, md: 0 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          border: "1px solid #dbe5f5",
          bgcolor: "white",
          boxShadow: "0 14px 28px rgba(23, 52, 97, 0.15)",
        }}
      >
        <Stack spacing={2.5}>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={800}>
              간호사 프로필 이미지 업로드
            </Typography>
            <Typography color="text.secondary" fontWeight={600}>
              간호사 상세 프로필에 사용할 이미지를 등록합니다.
            </Typography>
          </Stack>

          <Divider />

          {error && <Alert severity="error">{error}</Alert>}
          {uploadSuccess && (
            <Alert severity="success">프로필 이미지 업로드가 완료되었습니다.</Alert>
          )}

          <Stack spacing={2}>
            <Box
              sx={{
                width: 180,
                height: 180,
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid #dbe5f5",
                bgcolor: "#f4f7fd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
              }}
            >
              {previewUrl ? (
                <Box
                  component="img"
                  src={previewUrl}
                  alt="의사 프로필 미리보기"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  이미지 없음
                </Typography>
              )}
            </Box>

            <Box>
              <Button

                variant="outlined"
                component="label"
                fullWidth
                disabled={uploadLoading}
                sx={{
                  height: 52,
                  borderRadius: 2,
                  borderColor: "#c7d7ee",
                  color: "#2b5aa9",
                  fontWeight: 700,
                  bgcolor: "#f8fbff",
                }}
              >
                파일 선택
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
            </Box>

            <Box
              sx={{
                minHeight: 48,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                bgcolor: "#f4f7fd",
                border: "1px solid #e3ebf7",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {formDoctorFile
                  ? `선택 파일: ${formDoctorFile.name}`
                  : "선택된 파일이 없습니다."}
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <Button
                type="button"
                variant="outlined"
                onClick={handleReset}
                disabled={uploadLoading}
                fullWidth
              >
                취소
              </Button>

              <Button
                type="button"
                variant="contained"
                onClick={handleUpload}
                disabled={!formDoctorFile || uploadLoading}
                fullWidth
                sx={{ bgcolor: "#2b5aa9" }}
              >
                {uploadLoading ? (
                  <CircularProgress size={18} sx={{ color: "white" }} />
                ) : (
                  "업로드"
                )}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
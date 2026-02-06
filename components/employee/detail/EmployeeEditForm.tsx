"use client"
import type { Employee } from "@/entities/employee/model/employeesSlice";
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState, useEffect, type ChangeEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { resetEmployeeImageUpload, uploadEmployeeImageRequest } from "@/entities/employee/model/employeesSlice";

export type EmployeeFormState = Omit<Employee, "id" | "email" | "phone">;

interface Props {
  employee: Employee;
  saving: boolean;
  onSave: (form: EmployeeFormState) => void;
  onCancel: () => void;
}

const EmployeeEditForm = ({ employee, saving, onSave, onCancel }: Props) => {
  const dispatch = useAppDispatch();
  const { imageUploading, imageUploadUrl, imageUploadError } = useAppSelector((state) => state.employees);
  const [form, setForm] = useState<EmployeeFormState>({
    employeeId: employee.employeeId ?? "",
    name: employee.name ?? "",
    emailLocal: employee.emailLocal ?? "",
    emailDomain: employee.emailDomain ?? "",
    department: employee.department ?? "",
    gender: employee.gender ?? "",
    birthDate: employee.birthDate ?? "",
    phonePrefix: employee.phonePrefix ?? "",
    phoneMiddle: employee.phoneMiddle ?? "",
    phoneLast: employee.phoneLast ?? "",
    zipCode: employee.zipCode ?? "",
    address1: employee.address1 ?? "",
    address2: employee.address2 ?? "",
    position: employee.position ?? "",
    profileImageUrl: employee.profileImageUrl ?? "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Image file to send to backend

  useEffect(() => {
    dispatch(resetEmployeeImageUpload());
  }, [dispatch]);

  useEffect(() => {
    if (imageUploadUrl) {
      setForm((prev) => ({ ...prev, profileImageUrl: imageUploadUrl }));
    }
  }, [imageUploadUrl]);

  useEffect(() => {
    if (imageUploadError) {
      alert(imageUploadError);
    }
  }, [imageUploadError]);

  const handleFieldChange =
    (key: keyof EmployeeFormState) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Keep selected image file in local state only
    const picked = event.target.files?.[0] ?? null;
    setSelectedFile(picked);
  };

  const handleImageUpload = async () => {
    // Send selected image as multipart/form-data and store returned URL
    if (!selectedFile || imageUploading) {
      return;
    }

    dispatch(uploadEmployeeImageRequest(selectedFile));
  };

  const handleSave = () => {
    onSave(form);
  };

  const renderTextField = (label: string, key: keyof EmployeeFormState) => (
    <TableRow hover>
      <TableCell
        sx={{
          width: 160,
          bgcolor: "grey.50",
          color: "text.secondary",
          fontWeight: 600,
        }}
      >
        {label}
      </TableCell>
      <TableCell>
        <TextField
          value={form[key]}
          onChange={handleFieldChange(key)}
          fullWidth
          size="small"
        />
      </TableCell>
    </TableRow>
  );

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
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
        {/* Preview immediately after upload */}
        {form.profileImageUrl && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              업로드된 이미지
            </Typography>
            <Box
              component="img"
              src={form.profileImageUrl}
              alt="uploaded employee"
              sx={{ display: "block", maxWidth: "100%", maxHeight: 240, mt: 1 }}
            />
          </Box>
        )}
      </Stack>
      <Table size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
        <TableBody>
          {renderTextField("사번", "employeeId")}
          {renderTextField("이름", "name")}
          {renderTextField("부서", "department")}
          {renderTextField("직급", "position")}
          {renderTextField("이메일 아이디", "emailLocal")}
          {renderTextField("이메일 도메인", "emailDomain")}
          {renderTextField("성별", "gender")}
          {renderTextField("생년월일", "birthDate")}
          {renderTextField("전화(앞자리)", "phonePrefix")}
          {renderTextField("전화(중간)", "phoneMiddle")}
          {renderTextField("전화(뒷자리)", "phoneLast")}
          {renderTextField("우편번호", "zipCode")}
          {renderTextField("주소1", "address1")}
          {renderTextField("주소2", "address2")}
        </TableBody>
      </Table>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button variant="outlined" onClick={onCancel} disabled={saving}>
          취소
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={saving}
        >
          저장
        </Button>
      </Stack>
    </Stack>
  );
};

export default EmployeeEditForm;

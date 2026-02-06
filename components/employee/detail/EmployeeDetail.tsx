"use client"
import { useEffect, useState } from "react";
import type { Employee } from "@/entities/employee/model/employeesSlice";
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";

interface Props {
  employee: Employee;
}

/** 
 * MinIO 내부 URL → 브라우저 접근 가능한 URL로 변환
 * (nginx 프록시 기준)
 */
const normalizeImageUrl = (url?: string) => {
  if (!url) return undefined;
  return url.replace("http://minio:9000", "http://localhost:9000");
};

const EmployeeDetail = ({ employee }: Props) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [employee.profileImageUrl]);

  const email =
    employee.emailLocal || employee.emailDomain
      ? [employee.emailLocal, employee.emailDomain].filter(Boolean).join("@")
      : employee.email;

  const phone =
    [employee.phonePrefix, employee.phoneMiddle, employee.phoneLast]
      .filter(Boolean)
      .join("-") || employee.phone;

  const address = [employee.address1, employee.address2]
    .filter(Boolean)
    .join(" ");

  const renderRow = (label: string, value: string | number | undefined) => (
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
        <Typography>{value || "-"}</Typography>
      </TableCell>
    </TableRow>
  );

  const imageUrl = normalizeImageUrl(employee.profileImageUrl);

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Profile image
        </Typography>

        <Box
          sx={{
            mt: 1,
            width: 320,
            height: 240,
            borderRadius: 1,
            border: "1px dashed",
            borderColor: "divider",
            bgcolor: "grey.50",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {imageUrl && !imageError ? (
            <Box
              component="img"
              src={imageUrl}
              alt="employee photo"
              onError={() => setImageError(true)}
              sx={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <Stack spacing={0.5} alignItems="center" color="text.disabled">
              <Typography variant="caption" color="text.secondary">
                No image available
              </Typography>
            </Stack>
          )}
        </Box>
      </Box>

      <Table size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
        <TableBody>
          {renderRow("Employee ID", employee.employeeId)}
          {renderRow("Name", employee.name)}
          {renderRow("Department", employee.department)}
          {renderRow("Position", employee.position)}
          {renderRow("Email", email)}
          {renderRow("Gender", employee.gender)}
          {renderRow("Birth date", employee.birthDate)}
          {renderRow("Phone number", phone)}
          {renderRow("Zip code", employee.zipCode)}
          {renderRow("Address", address)}
        </TableBody>
      </Table>
    </>
  );
};

export default EmployeeDetail;

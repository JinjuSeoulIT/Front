"use client";

import * as React from "react";
import Link from "next/link";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import type { Patient } from "@/features/patients/patientTypes";
import { resolvePhotoUrl, sexLabel, safe, statusChipLabel } from "./PatientListUtils";

type Props = {
  list: Patient[];
  selected: Patient | null;
  onSelect: (p: Patient) => void;
  onDeactivate: (patientId: number) => void;
  onNavigateToDetail: (patientId: number) => void;
};

export default function PatientTable({
  list,
  selected,
  onSelect,
  onDeactivate,
  onNavigateToDetail,
}: Props) {
  const primary = selected ?? list[0] ?? null;

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, pb: 1.25 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography sx={{ fontWeight: 800 }}>환자 목록</Typography>
            <Chip label={`총 ${list.length}`} size="small" />
          </Stack>
          <Typography sx={{ color: "text.secondary", fontSize: 12, mt: 0.5 }}>
            더블클릭(또는 우측 아이콘)으로 상세 페이지 이동
          </Typography>
        </Box>

        <Divider />

        <TableContainer sx={{ maxHeight: { xs: 420, lg: 640 } }}>
          <Table stickyHeader size="small" aria-label="patient list">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 56 }}>사진</TableCell>
                <TableCell sx={{ width: 120 }}>환자번호</TableCell>
                <TableCell sx={{ width: 110 }}>이름</TableCell>
                <TableCell sx={{ width: 70 }}>성별</TableCell>
                <TableCell sx={{ width: 120 }}>생년월일</TableCell>
                <TableCell sx={{ width: 140 }}>연락처</TableCell>
                <TableCell sx={{ width: 110 }}>상태</TableCell>
                <TableCell sx={{ width: 110 }}>구분</TableCell>
                <TableCell align="right" sx={{ width: 120 }}>액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((p) => {
                const isSelected = primary?.patientId === p.patientId;
                return (
                  <TableRow
                    key={p.patientId}
                    hover
                    selected={isSelected}
                    sx={{
                      cursor: "pointer",
                      "&.Mui-selected": { backgroundColor: "rgba(25, 118, 210, 0.08)" },
                    }}
                    onClick={() => onSelect(p)}
                    onDoubleClick={() => onNavigateToDetail(p.patientId)}
                  >
                    <TableCell>
                      <Avatar src={resolvePhotoUrl(p.photoUrl) || undefined} sx={{ width: 28, height: 28 }}>
                        {p.name?.slice(0, 1) ?? "?"}
                      </Avatar>
                    </TableCell>
                    <TableCell>{safe(p.patientNo)}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{p.name}</TableCell>
                    <TableCell>{sexLabel(p.gender)}</TableCell>
                    <TableCell>{safe(p.birthDate)}</TableCell>
                    <TableCell>{safe(p.phone)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={statusChipLabel(p.statusCode)}
                        variant={p.statusCode === "ACTIVE" || !p.statusCode ? "filled" : "outlined"}
                        color={p.statusCode === "INACTIVE" ? "warning" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
                        {p.isVip && <Chip size="small" label="VIP" color="primary" />}
                        {p.isForeigner && (
                          <Chip size="small" label="외국인" variant="outlined" />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="상세 페이지">
                        <IconButton
                          size="small"
                          component={Link}
                          href={`/patient/${p.patientId}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="비활성 처리">
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeactivate(p.patientId);
                          }}
                        >
                          <BlockOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}

              {list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography sx={{ color: "text.secondary" }}>
                      조회된 환자가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from "@mui/material";
import type { Patient } from "@/features/patients/patientTypes";
import { formatAddress, safe, sexLabel, statusChipLabel } from "./PatientListUtils";

type Props = {
  primary: Patient | null;
};

export default function PatientDetailPanel({ primary }: Props) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, minHeight: 420 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography sx={{ fontWeight: 800 }}>선택 환자</Typography>
          <Chip size="small" label={primary ? statusChipLabel(primary.statusCode) : "미선택"} />
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        {!primary ? (
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
            좌측 목록에서 환자를 선택하면 기본 정보가 표시됩니다.
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            <Item label="환자번호" value={safe(primary.patientNo)} />
            <Item label="이름" value={primary.name} />
            <Item label="성별" value={sexLabel(primary.gender)} />
            <Item label="생년월일" value={safe(primary.birthDate)} />
            <Item label="연락처" value={safe(primary.phone)} />
            <Item label="주소" value={formatAddress(primary)} />
            <Item label="보호자" value={safe(primary.guardianName)} />
            <Item label="비고" value={safe(primary.note)} />

            <Box sx={{ pt: 1 }}>
              <Button component={Link} href={`/patient/${primary.patientId}`} fullWidth variant="contained">
                상세 페이지 이동
              </Button>
            </Box>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Typography sx={{ width: 70, color: "text.secondary", fontSize: 12 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700, fontSize: 13, flex: 1 }}>{value}</Typography>
    </Stack>
  );
}

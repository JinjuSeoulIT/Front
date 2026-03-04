"use client";

import * as React from "react";
import Link from "next/link";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { Patient } from "@/features/patients/patientTypes";
import { resolvePhotoUrl, sexLabel, safe, formatAddress } from "./PatientListUtils";

const DETAIL_TABS = ["기본", "보호자/연락", "메모", "바로가기"];

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography sx={{ color: "text.secondary", fontSize: 13 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700, fontSize: 13, textAlign: "right" }}>{value}</Typography>
    </Stack>
  );
}

type Props = {
  primary: Patient | null;
  onNavigateToDetail?: (patientId: number) => void;
};

export default function PatientDetailPanel({ primary, onNavigateToDetail }: Props) {
  const [detailTab, setDetailTab] = React.useState(0);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            src={resolvePhotoUrl(primary?.photoUrl) || undefined}
            sx={{ width: 64, height: 64 }}
          >
            {primary?.name?.slice(0, 1) ?? "P"}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 900, fontSize: 18 }} noWrap>
              {primary?.name ?? "환자를 선택하세요"}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 12 }} noWrap>
              {primary?.patientNo ? `환자번호 ${primary.patientNo}` : "환자번호 -"} ·{" "}
              {primary ? `ID ${primary.patientId}` : "ID -"}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ mt: 0.75, flexWrap: "wrap" }}>
              {primary?.isVip && <Chip size="small" label="VIP" color="primary" />}
              {primary?.statusCode && (
                <Chip size="small" label={primary.statusCode} variant="outlined" />
              )}
              {primary?.isForeigner && (
                <Chip size="small" label="외국인" variant="outlined" />
              )}
            </Stack>
          </Box>

          {primary && (
            <Button
              variant="outlined"
              size="small"
              component={Link}
              href={`/patient/${primary.patientId}`}
              startIcon={<OpenInNewIcon />}
            >
              상세
            </Button>
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Tabs
          value={detailTab}
          onChange={(_, v) => setDetailTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 34, "& .MuiTab-root": { minHeight: 34, fontSize: 13 } }}
        >
          {DETAIL_TABS.map((t) => (
            <Tab key={t} label={t} />
          ))}
        </Tabs>

        <Box sx={{ mt: 2 }}>
          {detailTab === 0 && (
            <Stack spacing={1.2}>
              <Row label="성별" value={primary ? sexLabel(primary.gender) : "-"} />
              <Row label="생년월일" value={safe(primary?.birthDate)} />
              <Row label="연락처" value={safe(primary?.phone)} />
              <Row label="이메일" value={safe(primary?.email)} />
              <Row label="주소" value={formatAddress(primary)} />
            </Stack>
          )}

          {detailTab === 1 && (
            <Stack spacing={1.2}>
              <Row label="보호자명" value={safe(primary?.guardianName)} />
              <Row label="보호자 연락처" value={safe(primary?.guardianPhone)} />
              <Row label="관계" value={safe(primary?.guardianRelation)} />
              <Row label="우선 연락처" value={safe(primary?.contactPriority)} />
            </Stack>
          )}

          {detailTab === 2 && (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 1.5,
                minHeight: 140,
                bgcolor: "background.default",
                whiteSpace: "pre-wrap",
              }}
            >
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                {primary?.note?.trim()
                  ? primary.note
                  : "메모가 없습니다. 환자 상세 화면에서 입력하세요."}
              </Typography>
            </Box>
          )}

          {detailTab === 3 && (
            <Stack spacing={1}>
              <Button
                variant="outlined"
                component={Link}
                href={primary ? `/patient/${primary.patientId}` : "#"}
                disabled={!primary}
              >
                환자 상세/수정
              </Button>
              <Button variant="outlined" component={Link} href="/insurances">
                보험 관리(전체)
              </Button>
              <Button variant="outlined" component={Link} href="/consents">
                동의서(전체)
              </Button>
              <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.5 }}>
                * /insurances?patientId=123 형태로 필터링 가능
              </Typography>
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

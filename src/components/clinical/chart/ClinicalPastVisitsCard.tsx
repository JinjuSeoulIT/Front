"use client";

import * as React from "react";
import {
  Button,
  Card,
  CardContent,
  Chip,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { ClinicalRes } from "../types";
import { formatPastVisitDateDash } from "../clinicalDocumentation";

type Props = {
  pastClinicalsForPatient: ClinicalRes[];
  paginatedPastClinicals: ClinicalRes[];
  pastClinicalSummaries: Record<number, string>;
  visitId: number | null;
  pastClinicalPageSafe: number;
  totalPastClinicalPages: number;
  onPastClinicalPageChange: (page: number) => void;
  repeatingFromClinicalId: number | null;
  onRepeatPrescription: (fromVisitId: number) => Promise<void>;
};

export function ClinicalPastVisitsCard({
  pastClinicalsForPatient,
  paginatedPastClinicals,
  pastClinicalSummaries,
  visitId,
  pastClinicalPageSafe,
  totalPastClinicalPages,
  onPastClinicalPageChange,
  repeatingFromClinicalId,
  onRepeatPrescription,
}: Props) {
  return (
    <Card sx={{ borderRadius: 2, border: "1px solid var(--line)", bgcolor: "#fff" }}>
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
          <Typography fontWeight={800} sx={{ fontSize: 15 }}>
            과거 진료기록
          </Typography>
          <Chip label="이전 방문" size="small" variant="outlined" sx={{ height: 22, fontSize: 10 }} />
        </Stack>
        {pastClinicalsForPatient.length === 0 ? (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ color: "var(--muted)", fontSize: 13, py: 2.5, textAlign: "center" }}>
                    이전 방문 기록이 없습니다.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, width: 108 }}>방문일</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>진료 요약</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, width: 88 }}>
                      처방
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPastClinicals.map((c) => {
                    const cid = c.clinicalId ?? c.id;
                    if (cid == null) return null;
                    const dateStr = formatPastVisitDateDash(c.clinicalAt ?? c.createdAt);
                    const summary = (pastClinicalSummaries[cid] ?? "").trim().split(/\n/)[0] || "";
                    const summaryDisplay =
                      summary && summary !== "-"
                        ? summary.length > 40
                          ? `${summary.slice(0, 38)}…`
                          : summary
                        : "요약 없음";
                    return (
                      <TableRow key={cid} hover>
                        <TableCell sx={{ fontSize: 13, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                          {dateStr}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, verticalAlign: "middle" }}>
                          {summaryDisplay}
                          {!/진료$|처방$/.test(summaryDisplay) && summaryDisplay !== "요약 없음" ? (
                            <Typography component="span" sx={{ color: "var(--muted)", fontSize: 12 }}>
                              {" "}
                              진료
                            </Typography>
                          ) : null}
                        </TableCell>
                        <TableCell align="right" sx={{ verticalAlign: "middle", py: 0.5 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={visitId == null || repeatingFromClinicalId != null}
                            onClick={() => void onRepeatPrescription(cid)}
                          >
                            {repeatingFromClinicalId === cid ? "…" : "반복"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Stack sx={{ mt: 1, alignItems: "center" }}>
              <Pagination
                page={pastClinicalPageSafe}
                count={totalPastClinicalPages}
                size="small"
                color="primary"
                onChange={(_, page) => onPastClinicalPageChange(page)}
              />
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import * as React from "react";
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import {
  updateClinicalOrderStatusApi,
  type ClinicalOrder,
  type OrderStatus,
} from "@/lib/clinical/clinicalOrderApi";
import { ORDER_TYPE_LABELS, orderStatusLabel } from "./clinicalDocumentation";

type Props = {
  now: Date;
  calendarYear: number;
  calendarMonth: number;
  calendarDays: (number | null)[];
  groupOrderText: string;
  onGroupOrderTextChange: (v: string) => void;
  chartTemplateText: string;
  onChartTemplateTextChange: (v: string) => void;
  orders: ClinicalOrder[];
  ordersLoading: boolean;
  visitId: number | null;
  updatingOrderId: number | null;
  onUpdatingOrderId: (id: number | null) => void;
  onOrdersRefresh: () => void;
  onOrdersReplace: (updater: (prev: ClinicalOrder[]) => ClinicalOrder[]) => void;
  onOpenOrderDialog: () => void;
};

export function ClinicalRightPanel({
  now,
  calendarYear,
  calendarMonth,
  calendarDays,
  groupOrderText,
  onGroupOrderTextChange,
  chartTemplateText,
  onChartTemplateTextChange,
  orders,
  ordersLoading,
  visitId,
  updatingOrderId,
  onUpdatingOrderId,
  onOrdersRefresh,
  onOrdersReplace,
  onOpenOrderDialog,
}: Props) {
  return (
    <Box
      sx={{
        borderLeft: "1px solid var(--line)",
        p: 1.5,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        bgcolor: "rgba(255,255,255,0.9)",
      }}
    >
      <Box>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
          <CalendarMonthOutlinedIcon fontSize="small" />
          <Typography fontWeight={700} sx={{ fontSize: 14 }}>
            {calendarYear}.{String(calendarMonth + 1).padStart(2, "0")}
          </Typography>
        </Stack>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, textAlign: "center", fontSize: 11 }}>
          {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
            <Typography key={d} sx={{ fontWeight: 700, color: "var(--muted)" }}>
              {d}
            </Typography>
          ))}
          {calendarDays.map((d, i) => (
            <Box
              key={i}
              sx={{
                py: 0.5,
                borderRadius: 0.5,
                bgcolor: d === now.getDate() ? "var(--brand)" : "transparent",
                color: d === now.getDate() ? "#fff" : "inherit",
                fontSize: 12,
              }}
            >
              {d ?? ""}
            </Box>
          ))}
        </Box>
      </Box>
      <Box>
        <Typography fontWeight={700} sx={{ fontSize: 13, mb: 0.5 }}>
          그룹오더
        </Typography>
        <TextField
          size="small"
          fullWidth
          placeholder="자주 쓰는 처방 묶음"
          value={groupOrderText}
          onChange={(e) => onGroupOrderTextChange(e.target.value)}
          sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
        />
      </Box>
      <Box>
        <Typography fontWeight={700} sx={{ fontSize: 13, mb: 0.5 }}>
          차트템플릿
        </Typography>
        <TextField
          size="small"
          fullWidth
          multiline
          rows={3}
          placeholder="증상/진단/처방 템플릿"
          value={chartTemplateText}
          onChange={(e) => onChartTemplateTextChange(e.target.value)}
          sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
        />
      </Box>
      <Box>
        <Typography fontWeight={700} sx={{ fontSize: 13, mb: 0.5 }}>
          오더
        </Typography>
        {ordersLoading ? (
          <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>조회 중…</Typography>
        ) : orders.length === 0 ? (
          <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>등록된 검사 오더가 없습니다.</Typography>
        ) : (
          <Stack spacing={1} sx={{ mt: 0.5 }}>
            {orders.map((ord) => (
              <Box
                key={ord.id}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  border: "1px solid var(--line)",
                  bgcolor: "rgba(255,255,255,0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                  {ord.orderName && !["BLOOD", "IMAGING", "PROCEDURE"].includes(ord.orderName)
                    ? ord.orderName
                    : ORDER_TYPE_LABELS[ord.orderType]}
                </Typography>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <Select
                    value={ord.status === "REQUEST" ? "REQUESTED" : (ord.status ?? "REQUESTED")}
                    onChange={async (e) => {
                      const next = e.target.value as OrderStatus;
                      if (visitId == null || next === (ord.status === "REQUEST" ? "REQUESTED" : ord.status))
                        return;
                      onUpdatingOrderId(ord.id);
                      try {
                        await updateClinicalOrderStatusApi(visitId, ord.id, next);
                        onOrdersReplace((prev) =>
                          prev.map((o) => (o.id === ord.id ? { ...o, status: next } : o))
                        );
                      } catch (err) {
                        window.alert(err instanceof Error ? err.message : "상태 변경에 실패했습니다.");
                        onOrdersRefresh();
                      } finally {
                        onUpdatingOrderId(null);
                      }
                    }}
                    disabled={updatingOrderId != null}
                    sx={{ fontSize: 11, height: 28 }}
                  >
                    <MenuItem value="REQUESTED">{orderStatusLabel("REQUESTED")}</MenuItem>
                    <MenuItem value="IN_PROGRESS">{orderStatusLabel("IN_PROGRESS")}</MenuItem>
                    <MenuItem value="COMPLETED">{orderStatusLabel("COMPLETED")}</MenuItem>
                    <MenuItem value="CANCELLED">{orderStatusLabel("CANCELLED")}</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            ))}
          </Stack>
        )}
        <Button
          size="small"
          variant="outlined"
          fullWidth
          sx={{ mt: 1 }}
          onClick={onOpenOrderDialog}
          disabled={visitId == null}
        >
          검사 오더 등록
        </Button>
        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
          <Button size="small" variant="outlined" fullWidth onClick={() => window.alert("처방 화면 예정")}>
            처방
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

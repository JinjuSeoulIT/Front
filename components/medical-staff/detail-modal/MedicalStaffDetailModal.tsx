import React from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

type StatusLabel = "재직중" | "휴직" | "비활성" | "퇴사" | "";

export type MedicalStaffDetail = {
  id?: number;
  staffId?: string;
  name?: string;
  phone?: string;
  photoUrl?: string;
  departmentName?: string;
  positionName?: string;
  status?: StatusLabel | string;
  domainRole?: string;
  officeLocation?: string;
  bio?: string;
};

type MedicalStaffDetailModalProps = {
  open: boolean;
  onClose: () => void;
  data?: MedicalStaffDetail | null;
  loading?: boolean;
};

function getInitials(name?: string) {
  const v = (name ?? "").trim();
  if (!v) return "?";
  return v.slice(0, 1);
}

function safeImageUrl(url?: string) {
  const v = (url ?? "").trim();
  return v ? v : null;
}


function statusChipProps(status?: string) {
  // Accept both backend codes and already-localized labels.
  switch (status) {
    case "ACTIVE":
    case "재직중":
      return { label: "재직중", color: "success" as const, variant: "filled" as const };
    case "ON_LEAVE":
    case "휴직":
      return { label: "휴직", color: "warning" as const, variant: "filled" as const };
    case "RESIGNED":
    case "퇴사":
      return { label: "퇴사", color: "default" as const, variant: "filled" as const };
    case "INACTIVE":
    case "비활성":
      return { label: "비활성", color: "default" as const, variant: "outlined" as const };
    default:
      return { label: "상태 없음", color: "default" as const, variant: "outlined" as const };
  }
}

const FieldRow = ({ label, value }: { label: string; value?: React.ReactNode }) => {
  const display = value === undefined || value === null || value === "" ? "-" : value;
  return (
    <Stack direction="row" spacing={2} alignItems="baseline" sx={{ py: 0.75 }}>
      <Typography
        variant="caption"
        sx={{
          minWidth: 90,
          color: "text.secondary",
          fontWeight: 700,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.primary" }}>
        {display}
      </Typography>
    </Stack>
  );
};

const MedicalStaffDetailModal: React.FC<MedicalStaffDetailModalProps> = ({
  open,
  onClose,
  data,
  loading = false,
}) => {
  if (!open) return null;

  const chip = statusChipProps(data?.status);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 1.5 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background:
              "linear-gradient(135deg, rgba(25,118,210,0.10), rgba(76,175,80,0.06))",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                aria-hidden
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "999px",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontWeight: 800,
                  overflow: "hidden",
                }}
              >
                {safeImageUrl(data?.photoUrl) ? (
                  <img
                    src={data?.photoUrl}
                    alt="profile"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  getInitials(data?.name)
                )}
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
                  {data?.name || (loading ? "불러오는 중" : "의료진")}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {data?.staffId ? `직원 ID: ${data.staffId}` : "직원 ID: -"}
                </Typography>
              </Box>
            </Stack>

            <Chip {...chip} sx={{ alignSelf: { xs: "flex-start", sm: "center" } }} />
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <Box sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, letterSpacing: 0.3, mb: 1 }}
              >
                기본 정보
              </Typography>
              <Divider />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  columnGap: 24,
                  mt: 1,
                }}
              >
                <Box>
                  <FieldRow label="연락처" value={loading ? "불러오는 중..." : data?.phone} />
                  <FieldRow label="부서" value={loading ? "불러오는 중..." : data?.departmentName} />
                </Box>
                <Box>
                  <FieldRow label="직책" value={loading ? "불러오는 중..." : data?.positionName} />
                  <FieldRow label="근무 위치" value={loading ? "불러오는 중..." : data?.officeLocation} />
                </Box>
              </Box>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <Box sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, letterSpacing: 0.3, mb: 1 }}
              >
                역할 / 소개
              </Typography>
              <Divider />
              <Box sx={{ mt: 1 }}>
                <FieldRow label="도메인 역할" value={loading ? "불러오는 중..." : data?.domainRole} />
                <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 0.3 }}
                  >
                    소개
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {loading
                      ? "불러오는 중..."
                      : data?.bio && String(data.bio).trim()
                        ? data.bio
                        : "-"}
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MedicalStaffDetailModal;

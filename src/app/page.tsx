"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { getSessionUser } from "@/lib/session";
import { getVisibleModulesByRole, normalizeRole } from "@/lib/roleAccess";

const IDLE_TIMEOUT_KEY = "his.homeIdleTimeoutSec";
const ADMIN_WELCOME_HIDE_DATE_KEY = "his.adminWelcomeHideDate";

const MODULE_CARDS = [
  {
    key: "reception",
    label: "원무",
    desc: "접수/수납/보험/환자관리",
    href: "/reception",
    icon: <FactCheckOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(217, 119, 6, 0.22), rgba(217, 119, 6, 0))",
  },
  {
    key: "board",
    label: "게시판",
    desc: "공지/일정/당직/인계 등 공용업무",
    href: "/board",
    icon: <DescriptionOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(20, 104, 84, 0.22), rgba(20, 104, 84, 0))",
  },
  {
    key: "doctor",
    label: "진료",
    desc: "의사 워크스페이스/진단/처방",
    href: "/doctor",
    icon: <LocalHospitalOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(40, 110, 165, 0.22), rgba(40, 110, 165, 0))",
  },
  {
    key: "nurse",
    label: "간호",
    desc: "진료지원, 바이탈, 병동 모니터",
    href: "/nurse",
    icon: <MedicalServicesOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(23, 162, 142, 0.22), rgba(23, 162, 142, 0))",
  },
  {
    key: "admin",
    label: "관리",
    desc: "운영 KPI, 권한, 감사 로그",
    href: "/admin",
    icon: <AdminPanelSettingsOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(75, 85, 99, 0.24), rgba(75, 85, 99, 0))",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("선생님");
  const [now, setNow] = useState(() => new Date());
  const [isStandby, setIsStandby] = useState(false);
  const [idleSeconds, setIdleSeconds] = useState(10);
  const [hideAdminWelcome, setHideAdminWelcome] = useState(false);

  useEffect(() => {
    const user = getSessionUser();
    setRole(user?.role ?? null);
    if (user?.fullName?.trim()) {
      setDisplayName(user.fullName.trim());
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(IDLE_TIMEOUT_KEY);
    const parsed = Number(saved || 10);
    if (Number.isFinite(parsed) && parsed >= 5 && parsed <= 1800) {
      setIdleSeconds(parsed);
    }

    const today = new Date().toISOString().slice(0, 10);
    const hiddenDate = window.localStorage.getItem(ADMIN_WELCOME_HIDE_DATE_KEY);
    if (hiddenDate === today) {
      setHideAdminWelcome(true);
    }
  }, []);

  const visibleModules = useMemo(() => {
    const allowed = new Set(getVisibleModulesByRole(role));
    return MODULE_CARDS.filter((item) => allowed.has(item.key));
  }, [role]);

  const dateText = useMemo(
    () =>
      new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      }).format(now),
    [now]
  );

  const timeText = useMemo(
    () =>
      new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now),
    [now]
  );

  const isAdmin = normalizeRole(role) === "ADMIN";
  useEffect(() => {
    if (isAdmin) {
      setIsStandby(!hideAdminWelcome);
      return;
    }
    setIsStandby(false);
  }, [hideAdminWelcome, isAdmin]);

  useEffect(() => {
    if (!isAdmin || isStandby || hideAdminWelcome) return;
    let timerId: number | null = null;

    const scheduleIdle = () => {
      if (timerId) window.clearTimeout(timerId);
      timerId = window.setTimeout(() => setIsStandby(true), idleSeconds * 1000);
    };

    const onActivity = () => {
      scheduleIdle();
    };

    scheduleIdle();
    window.addEventListener("mousemove", onActivity);
    window.addEventListener("keydown", onActivity);
    window.addEventListener("click", onActivity);
    window.addEventListener("touchstart", onActivity);

    return () => {
      if (timerId) window.clearTimeout(timerId);
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("click", onActivity);
      window.removeEventListener("touchstart", onActivity);
    };
  }, [hideAdminWelcome, idleSeconds, isAdmin, isStandby]);

  const dismissAdminWelcomeToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    window.localStorage.setItem(ADMIN_WELCOME_HIDE_DATE_KEY, today);
    setHideAdminWelcome(true);
  };

  return (
    <MainLayout showSidebar={false}>
      <Stack spacing={3}>
        {isAdmin && !hideAdminWelcome ? (
          <Card
            onClick={() => {
              if (isStandby) setIsStandby(false);
            }}
            sx={{
              borderRadius: 3,
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow-1)",
              backgroundImage:
                "linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.92) 40%, rgba(255,255,255,0.72) 62%, rgba(255,255,255,0.6) 100%), url('/images/admin-welcome-bg.svg')",
              backgroundPosition: "left top, right center",
              backgroundSize: "auto, cover",
              backgroundRepeat: "no-repeat, no-repeat",
              minHeight: isStandby ? "calc(100vh - 150px)" : "auto",
              cursor: isStandby ? "pointer" : "default",
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <CardContent sx={{ p: 4, pt: isStandby ? 3 : 4, position: "relative", width: "100%" }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  position: "absolute",
                  top: { xs: 12, md: 16 },
                  right: { xs: 12, md: 16 },
                  flexShrink: 0,
                  zIndex: 1,
                }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setHideAdminWelcome(true)}
                >
                  닫기
                </Button>
                <Button
                  size="small"
                  variant="text"
                  onClick={dismissAdminWelcomeToday}
                >
                  오늘은 보지 않기
                </Button>
              </Stack>
              <Stack spacing={0.5} sx={{ pl: 1, pr: 1, mt: 0.5 }}>
                <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>{dateText}</Typography>
                <Typography sx={{ fontSize: { xs: 52, md: 68 }, fontWeight: 900, letterSpacing: -1.2, lineHeight: 1.05 }}>{timeText}</Typography>
                <Typography sx={{ fontSize: 15, color: "var(--muted)" }}>{displayName} 선생님</Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 800 }}>오늘 하루도 화이팅하세요!</Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : null}
        {!isAdmin || !isStandby || hideAdminWelcome ? (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                lg: "repeat(4, 1fr)",
              },
            }}
          >
            {visibleModules.map((role) => (
              <Card
                key={role.key}
                onClick={() => router.push(role.href)}
                sx={{
                  borderRadius: 3,
                  border: "1px solid var(--line)",
                  boxShadow: "var(--shadow-1)",
                  background: role.tone,
                  cursor: "pointer",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: "rgba(255,255,255,0.85)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--brand-strong)",
                      mb: 2,
                    }}
                  >
                    {role.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
                    {role.label}
                  </Typography>
                  <Typography
                    sx={{ color: "var(--muted)", mt: 0.5, minHeight: 44 }}
                  >
                    {role.desc}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : null}
      </Stack>

    </MainLayout>
  );
}

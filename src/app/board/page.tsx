"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useRouter } from "next/navigation";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import CelebrationOutlinedIcon from "@mui/icons-material/CelebrationOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import BeachAccessOutlinedIcon from "@mui/icons-material/BeachAccessOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

const BOARD_SECTIONS = [
  { title: "공지사항", desc: "병원 공지 및 운영 안내", href: "/board/notices", icon: <DescriptionOutlinedIcon fontSize="small" /> },
  { title: "주요일정", desc: "기관/부서 일정 확인", href: "/board/schedule", icon: <EventNoteOutlinedIcon fontSize="small" /> },
  { title: "경조사", desc: "경조사 및 알림 공유", href: "/board/events", icon: <CelebrationOutlinedIcon fontSize="small" /> },
  { title: "문서함", desc: "공통 문서/결재 자료", href: "/board/docs", icon: <FolderOpenOutlinedIcon fontSize="small" /> },
  { title: "휴가/근태", desc: "휴가 신청/승인/조회", href: "/board/leave", icon: <BeachAccessOutlinedIcon fontSize="small" /> },
  { title: "당직/교대표", desc: "월간/주간/일일 근무표", href: "/board/shifts", icon: <ScheduleOutlinedIcon fontSize="small" /> },
  { title: "교육/이수", desc: "교육 일정 및 신청", href: "/board/training", icon: <SchoolOutlinedIcon fontSize="small" /> },
  { title: "인계노트", desc: "교대 인수인계 기록", href: "/board/handover", icon: <EditNoteOutlinedIcon fontSize="small" /> },
  { title: "회의/위원회", desc: "회의 안건과 결과 기록", href: "/board/meetings", icon: <GroupsOutlinedIcon fontSize="small" /> },
];

export default function BoardLandingPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <Stack spacing={2.5}>
        <Box>
          <Typography sx={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>게시판</Typography>
          <Typography sx={{ mt: 0.5, color: "var(--muted)", fontSize: 14 }}>
            공용업무 메뉴를 카드로 빠르게 이동할 수 있어요.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              lg: "repeat(3, minmax(0, 1fr))",
            },
          }}
        >
          {BOARD_SECTIONS.map((item) => (
            <Card
              key={item.href}
              onClick={() => router.push(item.href)}
              sx={{
                borderRadius: 3,
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow-1)",
                cursor: "pointer",
                transition: "transform .12s ease, box-shadow .12s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "var(--shadow-2)",
                },
              }}
            >
              <CardContent sx={{ p: 2.2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: "rgba(11, 91, 143, 0.1)",
                    color: "var(--brand-strong)",
                    display: "grid",
                    placeItems: "center",
                    mb: 1,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: 16 }}>{item.title}</Typography>
                <Typography sx={{ mt: 0.5, color: "var(--muted)", fontSize: 13 }}>{item.desc}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Stack>
    </MainLayout>
  );
}

"use client";

import Link from "next/link";
import React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
} from "@mui/material";
import {
  CalendarMonthOutlined,
  LocalHospitalOutlined,
  MedicalInformationOutlined,
  PeopleAltOutlined,
  FactCheckOutlined,
  ReceiptLongOutlined,
  LocalPharmacyOutlined,
  BedOutlined,
  ScienceOutlined,
  LocalPhoneOutlined,
  CampaignOutlined,
  InsightsOutlined,
  SettingsOutlined,
  ManageAccountsOutlined,
  BiotechOutlined,
  LocalPrintshopOutlined,
  HelpOutlineOutlined,
  AssignmentIndOutlined,
  MonitorHeartOutlined,
  BadgeOutlined,
  StarBorder,
  Star,
} from "@mui/icons-material";

type Tile = {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
};

type TileGroup = {
  id: string;
  title: string;
  items: Tile[];
};

const STORAGE_KEY = "home.tileOrder.v1";
const FAVORITES_KEY = "home.tileFavorites.v1";

const GROUP_STYLES: Record<string, { accent: string; tile: string }> = {
  clinic: { accent: "#1B998B", tile: "#2CB5A4" },
  lab: { accent: "#0F7C8A", tile: "#2A95A3" },
  admin: { accent: "#2F9E8F", tile: "#41B7A7" },
  settings: { accent: "#3AA3A3", tile: "#56BDBD" },
};

const INITIAL_GROUPS: TileGroup[] = [
  {
    id: "clinic",
    title: "진료",
    items: [
      { id: "clinic-reserve", label: "진료 예약", icon: <CalendarMonthOutlined />, href: "#" },
      { id: "billing", label: "접수/수납", icon: <ReceiptLongOutlined />, href: "#" },
      { id: "dept", label: "진료과", icon: <LocalHospitalOutlined />, href: "#" },
      { id: "staff", label: "의료진", icon: <MedicalInformationOutlined />, href: "/medical-staff" },
      { id: "patients", label: "환자\n관리", icon: <PeopleAltOutlined />, href: "#" },
      { id: "ward", label: "입원/병상", icon: <BedOutlined />, href: "#" },
    ],
  },
  {
    id: "lab",
    title: "검사/영상",
    items: [
      { id: "lab", label: "검사/검체", icon: <ScienceOutlined />, href: "#" },
      { id: "imaging", label: "영상/CT", icon: <BiotechOutlined />, href: "#" },
      { id: "monitor", label: "실시간 모니터", icon: <MonitorHeartOutlined />, href: "#" },
    ],
  },
  {
    id: "admin",
    title: "행정/수납",
    items: [
      { id: "pharmacy", label: "처방/약국", icon: <LocalPharmacyOutlined />, href: "#" },
      { id: "reception", label: "접수\n현황", icon: <FactCheckOutlined />, href: "#" },
      { id: "docs", label: "진료\n서류", icon: <LocalPrintshopOutlined />, href: "#" },
      { id: "callcenter", label: "콜센터", icon: <LocalPhoneOutlined />, href: "#" },
      { id: "notice", label: "공지\n사항", icon: <CampaignOutlined />, href: "#" },
    ],
  },
  {
    id: "settings",
    title: "설정/관리",
    items: [
      { id: "report", label: "통계/리포트", icon: <InsightsOutlined />, href: "#" },
      { id: "accounts", label: "권한\n계정", icon: <ManageAccountsOutlined />, href: "#" },
      { id: "badge", label: "배지/사번", icon: <BadgeOutlined />, href: "#" },
      { id: "shift", label: "근무\n관리", icon: <AssignmentIndOutlined />, href: "#" },
      { id: "settings", label: "설정", icon: <SettingsOutlined />, href: "/medical-staff/settings" },
      { id: "help", label: "도움말", icon: <HelpOutlineOutlined />, href: "#" },
    ],
  },
];

export default function HomePage() {
  const [groups, setGroups] = React.useState<TileGroup[]>(INITIAL_GROUPS);
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const dragRef = React.useRef<{ groupIndex: number; itemIndex: number } | null>(null);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Record<string, string[]>;
      const next = INITIAL_GROUPS.map((group) => {
        const order = saved[group.id];
        if (!order?.length) return group;
        const map = new Map(group.items.map((item) => [item.id, item]));
        const ordered = order.map((id) => map.get(id)).filter(Boolean) as Tile[];
        const rest = group.items.filter((item) => !order.includes(item.id));
        return { ...group, items: [...ordered, ...rest] };
      });
      setGroups(next);
    } catch {
      // ignore
    }
    try {
      const rawFavorites = window.localStorage.getItem(FAVORITES_KEY);
      if (!rawFavorites) return;
      const savedFavorites = JSON.parse(rawFavorites) as string[];
      setFavorites(savedFavorites);
    } catch {
      // ignore
    }
  }, []);

  const persistOrder = (next: TileGroup[]) => {
    try {
      const payload: Record<string, string[]> = {};
      next.forEach((group) => {
        payload[group.id] = group.items.map((item) => item.id);
      });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      return prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id];
    });
  };

  const handleDrop = (groupIndex: number, itemIndex: number) => {
    const from = dragRef.current;
    if (!from) return;
    dragRef.current = null;

    setGroups((prev) => {
      const targetGroup = prev[groupIndex];
      const sourceGroup = prev[from.groupIndex];
      const targetIsFavorites = targetGroup.id === "favorites";
      const sourceIsFavorites = sourceGroup.id === "favorites";

      const next = prev.map((group) => ({ ...group, items: [...group.items] }));
      const sourceItems = next[from.groupIndex].items;
      const [moved] = sourceItems.splice(from.itemIndex, 1);
      if (targetIsFavorites) {
        setFavorites((prevFavorites) => {
          if (prevFavorites.includes(moved.id)) return prevFavorites;
          return [...prevFavorites, moved.id];
        });
        sourceItems.splice(from.itemIndex, 0, moved);
        return next;
      }

      if (sourceIsFavorites) {
        return next;
      }

      const targetItems = next[groupIndex].items;
      const insertAt = from.groupIndex === groupIndex && from.itemIndex < itemIndex
        ? itemIndex - 1
        : itemIndex;
      targetItems.splice(insertAt, 0, moved);
      persistOrder(next);
      return next;
    });
  };

  React.useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      window.dispatchEvent(new Event("favorites:updated"));
    } catch {
      // ignore
    }
  }, [favorites]);

  const tileMap = React.useMemo(() => {
    const map = new Map<string, Tile>();
    INITIAL_GROUPS.forEach((group) => {
      group.items.forEach((item) => map.set(item.id, item));
    });
    return map;
  }, []);

  const favoriteItems = favorites
    .map((id) => tileMap.get(id))
    .filter(Boolean) as Tile[];

  const groupsWithFavorites: TileGroup[] = [
    { id: "favorites", title: "즐겨찾기", items: favoriteItems },
    ...groups,
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F2F6F9",
        color: "text.primary",
        py: { xs: 4, sm: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            병원 운영 바로가기
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            자주 사용하는 기능을 빠르게 이동할 수 있습니다.
          </Typography>
        </Stack>

        <Stack spacing={3}>
          {groupsWithFavorites.map((group, groupIndex) => (
            <Box
              key={group.title}
              sx={{
                bgcolor: "rgba(15, 124, 138, 0.08)",
                borderRadius: 2,
                p: { xs: 1.5, sm: 2 },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 18,
                    bgcolor: GROUP_STYLES[group.id]?.accent ?? "#2AA35D",
                    borderRadius: 1,
                  }}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {group.title}
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    sm: "repeat(3, minmax(0, 1fr))",
                    md: "repeat(4, minmax(0, 1fr))",
                    lg: "repeat(5, minmax(0, 1fr))",
                  },
                  gap: { xs: 1.5, sm: 2 },
                }}
              >
                {group.items.map((tile, itemIndex) => (
                  <Paper
                    key={tile.label}
                    component={Link}
                    href={tile.href}
                    elevation={0}
                    draggable
                    onDragStart={() => {
                      dragRef.current = { groupIndex, itemIndex };
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDrop(groupIndex, itemIndex)}
                    sx={{
                      textDecoration: "none",
                      color: "common.white",
                      bgcolor:
                        group.id === "favorites"
                          ? GROUP_STYLES[groups.find((g) => g.items.some((i) => i.id === tile.id))?.id ?? "clinic"]?.tile
                          : GROUP_STYLES[group.id]?.tile ?? "#2AA35D",
                      borderRadius: 1.5,
                      p: { xs: 1.5, sm: 2 },
                      display: "grid",
                      gridTemplateColumns: "40px 1fr",
                      gap: 1.25,
                      alignItems: "center",
                      minHeight: { xs: 68, sm: 74 },
                      boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.15)",
                      transition: "transform 120ms ease, box-shadow 120ms ease",
                      cursor: "grab",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
                      },
                      "&:active": { cursor: "grabbing" },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: "rgba(255,255,255,0.15)",
                        display: "grid",
                        placeItems: "center",
                        "& svg": { fontSize: 24, color: "#F2FFF6" },
                      }}
                    >
                      {tile.icon}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          lineHeight: 1.2,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          whiteSpace: "pre-line",
                          wordBreak: "keep-all",
                          pr: 1,
                        }}
                      >
                        {tile.label}
                      </Typography>
                      <Box
                        component="span"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleFavorite(tile.id);
                        }}
                        sx={{
                          display: "grid",
                          placeItems: "center",
                          width: 28,
                          height: 28,
                          borderRadius: "999px",
                          bgcolor: "rgba(255,255,255,0.15)",
                          "& svg": { fontSize: 18, color: "#F2FFF6" },
                        }}
                      >
                        {favorites.includes(tile.id) ? <Star /> : <StarBorder />}
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}

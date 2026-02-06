"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Box, Toolbar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import MedicalInformationOutlinedIcon from "@mui/icons-material/MedicalInformationOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import BedOutlinedIcon from "@mui/icons-material/BedOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import BiotechOutlinedIcon from "@mui/icons-material/BiotechOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import StarOutlineOutlinedIcon from "@mui/icons-material/StarOutlineOutlined";

import NavBar from "./NavBar";
import SideBar, { type NavGroup } from "./SideBar";

const TOP_MENU = [
  // 예제용 메뉴(직원) 임시 비활성화
  // {
  //   key: "employees",
  //   label: "직원",
  //   href: "/employees",
  //   icon: <GroupsOutlinedIcon fontSize="small" />,
  //   children: [
  //     { label: "목록", href: "/employees" },
  //     { label: "등록", href: "/employees/register" },
  //   ],
  // },
  {
    key: "staff",
    label: "의료진",
    href: "/medical-staff",
    icon: <PeopleAltOutlinedIcon fontSize="small" />,
    children: [
      { label: "목록", href: "/medical-staff" },
      { label: "부서 및 직책 관리", href: "/medical-staff/settings" },
    ],
  },
];

const NAV_GROUPS: NavGroup[] = [
  {
    key: "favorites",
    title: "즐겨찾기",
    icon: <StarOutlineOutlinedIcon fontSize="small" />,
    items: [],
  },
  {
    key: "clinic",
    title: "진료",
    icon: <LocalHospitalOutlinedIcon fontSize="small" />,
    items: [
      { href: "#clinic-reserve", label: "진료 예약", icon: <CalendarMonthOutlinedIcon fontSize="small" /> },
      { href: "#clinic-billing", label: "접수/수납", icon: <ReceiptLongOutlinedIcon fontSize="small" /> },
      { href: "#clinic-dept", label: "진료과", icon: <LocalHospitalOutlinedIcon fontSize="small" /> },
      { href: "/medical-staff", label: "의료진", icon: <MedicalInformationOutlinedIcon fontSize="small" /> },
      { href: "#clinic-patients", label: "환자관리", icon: <PeopleAltOutlinedIcon fontSize="small" /> },
      { href: "#clinic-ward", label: "입원/병상", icon: <BedOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    key: "lab",
    title: "검사/영상",
    icon: <ScienceOutlinedIcon fontSize="small" />,
    items: [
      { href: "#lab-specimen", label: "검사/검체", icon: <ScienceOutlinedIcon fontSize="small" /> },
      { href: "#lab-imaging", label: "영상/CT", icon: <BiotechOutlinedIcon fontSize="small" /> },
      { href: "#lab-monitor", label: "실시간 모니터", icon: <MonitorHeartOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    key: "admin",
    title: "행정/수납",
    icon: <ReceiptLongOutlinedIcon fontSize="small" />,
    items: [
      { href: "#admin-pharmacy", label: "처방/약국", icon: <LocalPharmacyOutlinedIcon fontSize="small" /> },
      { href: "#admin-reception", label: "접수 현황", icon: <FactCheckOutlinedIcon fontSize="small" /> },
      { href: "#admin-docs", label: "진료 서류", icon: <LocalPrintshopOutlinedIcon fontSize="small" /> },
      { href: "#admin-callcenter", label: "콜센터", icon: <LocalPhoneOutlinedIcon fontSize="small" /> },
      { href: "#admin-notice", label: "공지사항", icon: <CampaignOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    key: "settings",
    title: "설정/관리",
    icon: <SettingsOutlinedIcon fontSize="small" />,
    items: [
      { href: "#settings-report", label: "통계/리포트", icon: <InsightsOutlinedIcon fontSize="small" /> },
      { href: "#settings-accounts", label: "권한/계정", icon: <ManageAccountsOutlinedIcon fontSize="small" /> },
      { href: "#settings-badge", label: "배지/사번", icon: <BadgeOutlinedIcon fontSize="small" /> },
      { href: "#settings-shift", label: "근무관리", icon: <AssignmentIndOutlinedIcon fontSize="small" /> },
      { href: "/medical-staff/settings", label: "설정", icon: <SettingsOutlinedIcon fontSize="small" /> },
      { href: "#settings-help", label: "도움말", icon: <HelpOutlineOutlinedIcon fontSize="small" /> },
    ],
  },
];

const FAVORITES_KEY = "home.tileFavorites.v1";
const FAVORITE_TILE_MAP: Record<string, { label: string; href: string; icon: React.ReactNode }> = {
  "clinic-reserve": { label: "진료 예약", href: "#", icon: <CalendarMonthOutlinedIcon fontSize="small" /> },
  billing: { label: "접수/수납", href: "#", icon: <ReceiptLongOutlinedIcon fontSize="small" /> },
  dept: { label: "진료과", href: "#", icon: <LocalHospitalOutlinedIcon fontSize="small" /> },
  staff: { label: "의료진", href: "/medical-staff", icon: <MedicalInformationOutlinedIcon fontSize="small" /> },
  patients: { label: "환자관리", href: "#", icon: <PeopleAltOutlinedIcon fontSize="small" /> },
  ward: { label: "입원/병상", href: "#", icon: <BedOutlinedIcon fontSize="small" /> },
  lab: { label: "검사/검체", href: "#", icon: <ScienceOutlinedIcon fontSize="small" /> },
  imaging: { label: "영상/CT", href: "#", icon: <BiotechOutlinedIcon fontSize="small" /> },
  monitor: { label: "실시간 모니터", href: "#", icon: <MonitorHeartOutlinedIcon fontSize="small" /> },
  pharmacy: { label: "처방/약국", href: "#", icon: <LocalPharmacyOutlinedIcon fontSize="small" /> },
  reception: { label: "접수 현황", href: "#", icon: <FactCheckOutlinedIcon fontSize="small" /> },
  docs: { label: "진료 서류", href: "#", icon: <LocalPrintshopOutlinedIcon fontSize="small" /> },
  callcenter: { label: "콜센터", href: "#", icon: <LocalPhoneOutlinedIcon fontSize="small" /> },
  notice: { label: "공지사항", href: "#", icon: <CampaignOutlinedIcon fontSize="small" /> },
  report: { label: "통계/리포트", href: "#", icon: <InsightsOutlinedIcon fontSize="small" /> },
  accounts: { label: "권한/계정", href: "#", icon: <ManageAccountsOutlinedIcon fontSize="small" /> },
  badge: { label: "배지/사번", href: "#", icon: <BadgeOutlinedIcon fontSize="small" /> },
  shift: { label: "근무관리", href: "#", icon: <AssignmentIndOutlinedIcon fontSize="small" /> },
  settings: { label: "설정", href: "/medical-staff/settings", icon: <SettingsOutlinedIcon fontSize="small" /> },
  help: { label: "도움말", href: "#", icon: <HelpOutlineOutlinedIcon fontSize="small" /> },
};

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const pathname = usePathname();
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  const [mounted, setMounted] = React.useState(false);
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});
  const [sidebarHidden, setSidebarHidden] = React.useState(false);
  const [navGroups, setNavGroups] = React.useState<NavGroup[]>(NAV_GROUPS);

  React.useEffect(() => {
    setMounted(true);
    const syncFavorites = () => {
      try {
        const rawFavorites = window.localStorage.getItem(FAVORITES_KEY);
        const ids = rawFavorites ? (JSON.parse(rawFavorites) as string[]) : [];
        const items = ids
          .map((id) => FAVORITE_TILE_MAP[id])
          .filter(Boolean)
          .map((tile) => ({ href: tile.href, label: tile.label, icon: tile.icon }));
        setNavGroups((prev) =>
          prev.map((group) =>
            group.key === "favorites" ? { ...group, items } : group
          )
        );
      } catch {
        // ignore
      }
    };

    syncFavorites();
    const handleFavoritesUpdated = () => syncFavorites();
    window.addEventListener("favorites:updated", handleFavoritesUpdated);
    window.addEventListener("storage", handleFavoritesUpdated);
    return () => {
      window.removeEventListener("favorites:updated", handleFavoritesUpdated);
      window.removeEventListener("storage", handleFavoritesUpdated);
    };
  }, []);

  const activeTopMenu = React.useMemo(() => {
    return "staff";
  }, []);

  React.useEffect(() => {
    const allOpen: Record<string, boolean> = {};
    navGroups.forEach((group) => {
      allOpen[group.key] = true;
    });
    setOpenGroups(allOpen);
  }, [activeTopMenu]);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSidebarHidden = () => {
    setSidebarHidden((prev) => !prev);
  };

  const filteredGroups = navGroups;

  const effectiveSidebarCollapsed = false;

  if (!mounted) return null;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <NavBar
        user={{ name: "홍길동" }}
        items={TOP_MENU}
        activeKey={activeTopMenu}
        sidebarHidden={sidebarHidden}
        onToggleSidebarHidden={toggleSidebarHidden}
      />

      <Toolbar />

      <Box
        sx={{
          display: "flex",
          px: { xs: 1.5, sm: 2, md: 3 },
          py: { xs: 1.5, sm: 2, md: 3 },
          gap: { xs: 1.5, md: 3 },
        }}
      >
        {!sidebarHidden && (
          <SideBar
            groups={filteredGroups}
            openGroups={openGroups}
            onToggle={toggleGroup}
            activePath={pathname}
            collapsed={effectiveSidebarCollapsed}
          />
        )}

        <Box
          component="main"
          sx={{
            flex: 1,
            bgcolor: "background.paper",
            borderRadius: 2,
            p: { xs: 1.5, sm: 2, md: 3 },
            boxShadow: (t) => t.shadows[1],
            border: (t) => `1px solid ${t.palette.divider}`,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppShell;

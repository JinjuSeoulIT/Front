"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  CircularProgress,
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import ListIcon from "@mui/icons-material/List";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PolicyIcon from "@mui/icons-material/Policy";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";

import { fetchMenusApi } from "@/lib/menuApi";
import type { MenuNode } from "@/types/menu";

const iconMap: Record<string, React.ReactNode> = {
  Home: <HomeRoundedIcon fontSize="small" />,
  People: <PersonRoundedIcon fontSize="small" />,
  MedicalServices: <LocalHospitalOutlinedIcon fontSize="small" />,
  Description: <DescriptionOutlinedIcon fontSize="small" />,
  FactCheck: <AssignmentTurnedInOutlinedIcon fontSize="small" />,
  List: <ListIcon fontSize="small" />,
  PersonAdd: <PersonAddIcon fontSize="small" />,
  Policy: <PolicyIcon fontSize="small" />,
  TaskAlt: <TaskAltIcon fontSize="small" />,
};

function flattenWithPath(nodes: MenuNode[]): MenuNode[] {
  const out: MenuNode[] = [];
  for (const node of nodes) {
    if (node.path) out.push(node);
    if (node.children?.length) out.push(...flattenWithPath(node.children));
  }
  return out;
}

export default function ChartSidebar({ width = 220 }: { width?: number }) {
  const pathname = usePathname();
  const [menus, setMenus] = React.useState<MenuNode[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchMenusApi();
        if (mounted) setMenus(flattenWithPath(data));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <Box
      sx={{
        width: width,
        minWidth: width,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "rgba(255,255,255,0.98)",
        borderRight: "1px solid var(--line)",
      }}
    >
      {loading ? (
        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <List disablePadding sx={{ flex: 1, py: 1 }}>
          {menus.map((node) => {
            const href = node.path ?? "#";
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            const icon = node.icon && iconMap[node.icon] ? iconMap[node.icon] : <FiberManualRecordIcon sx={{ fontSize: 8 }} />;
            return (
              <ListItemButton
                key={node.id}
                component={Link}
                href={href}
                selected={active}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                  py: 1.25,
                  "&.Mui-selected": {
                    bgcolor: "rgba(11, 91, 143, 0.12)",
                    borderLeft: "3px solid var(--brand)",
                    "& .MuiListItemIcon-root": { color: "var(--brand)" },
                  },
                  "& .MuiListItemIcon-root": {
                    minWidth: 40,
                    color: active ? "var(--brand)" : "var(--muted)",
                  },
                }}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText
                  primary={node.name}
                  primaryTypographyProps={{
                    fontWeight: active ? 800 : 600,
                    fontSize: 14,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      )}
      <Box sx={{ p: 1.5, borderTop: "1px solid var(--line)" }}>
        <Typography variant="caption" color="text.secondary" display="block">
          v2.4.0+4 버전 정보
        </Typography>
        <ListItemButton sx={{ borderRadius: 1, py: 0.75 }}>
          <ExpandMoreOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
          <ListItemText primary="메뉴 접기" primaryTypographyProps={{ fontSize: 13 }} />
        </ListItemButton>
        <ListItemButton sx={{ borderRadius: 1, py: 0.75 }}>
          <ListItemText primary="환경설정" primaryTypographyProps={{ fontSize: 13 }} />
        </ListItemButton>
        <ListItemButton sx={{ borderRadius: 1, py: 0.75 }}>
          <ListItemText primary="로그아웃" primaryTypographyProps={{ fontSize: 13 }} />
        </ListItemButton>
      </Box>
    </Box>
  );
}

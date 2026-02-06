"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";

export interface NavGroup {
  key: string;
  title: string;
  icon?: React.ReactNode;
  items: { href: string; label: string; icon: React.ReactNode }[];
}

interface SideBarProps {
  groups: NavGroup[];
  openGroups: Record<string, boolean>;
  onToggle: (key: string) => void;
  activePath: string;
  collapsed: boolean;
  onToggleSidebar?: () => void;
}

const SideBar = ({
  groups,
  openGroups,
  onToggle,
  activePath,
  collapsed,
  onToggleSidebar,
}: SideBarProps) => {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  const groupColors: Record<string, string> = {
    favorites: "#1B998B",
    clinic: "#1B998B",
    lab: "#0F7C8A",
    admin: "#2F9E8F",
    settings: "#3AA3A3",
  };
  const router = useRouter();


  return (
    <Box
      sx={(t) => ({
        width: collapsed ? 96 : 240,
        flexShrink: 0,
        bgcolor: "background.paper",
        borderRadius: 2,
        overflow: "visible",
        position: "sticky",
        top: 88,
        alignSelf: "flex-start",
        boxShadow: t.shadows[2],
        border: `1px solid ${t.palette.divider}`,
        transition: t.transitions.create("width", {
          duration: t.transitions.duration.shortest,
        }),
      })}
    >

      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        {collapsed ? (
          <Tooltip title="주요 메뉴" placement="right">
            <Box component="span" sx={{ display: "inline-flex" }}>
              <AppsRoundedIcon fontSize="small" />
            </Box>
          </Tooltip>
        ) : (
          <Typography
            fontWeight={700}
            fontSize="1rem"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            주요 메뉴
          </Typography>
        )}
      </Box>

      <Divider />

      <List dense disablePadding>
        {groups.map((group) => {
          const accent = groupColors[group.key] ?? theme.palette.primary.main;
          const groupIcon =
            group.icon ??
            (group.key === "employees" ? (
              <GroupsOutlinedIcon fontSize="small" />
            ) : group.key === "staff" ? (
              <PeopleAltOutlinedIcon fontSize="small" />
            ) : (
              <FiberManualRecordIcon fontSize="small" />
            ));

          return (
            <Box key={group.key}>
              <ListItemButton
                onClick={() => onToggle(group.key)}
                sx={{
                  px: 2,
                  justifyContent: collapsed ? "center" : "flex-start",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                {collapsed ? (
                  <Tooltip title={group.title} placement="right">
                    <Stack alignItems="center" spacing={0.5} sx={{ py: 0.5 }}>
                      <Box component="span" sx={{ display: "inline-flex", color: accent }}>
                        {groupIcon}
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                        {group.title}
                      </Typography>
                    </Stack>
                  </Tooltip>
                ) : (
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box component="span" sx={{ display: "inline-flex", color: accent }}>
                          {groupIcon}
                        </Box>
                        <Typography sx={{ fontWeight: 700 }}>{group.title}</Typography>
                      </Stack>
                    }
                  />
                )}
              </ListItemButton>

              <Collapse in={!!openGroups[group.key]} timeout="auto" unmountOnExit>
                <List disablePadding>
                  {group.items.map((item) => {
                    const active = activePath === item.href;
                    const icon = <FiberManualRecordIcon sx={{ fontSize: 10 }} />;

                    const content = (
                      <ListItemButton
                        key={item.href}
                        onClick={() => router.push(item.href)}
                        selected={active}
                        sx={{
                          pl: collapsed ? 0 : 5,
                          justifyContent: collapsed ? "center" : "flex-start",
                          "&.Mui-selected": {
                            bgcolor: "action.selected",
                            "&:hover": { bgcolor: "action.selected" },
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: collapsed ? 0 : 18,
                            mr: collapsed ? 0 : 1,
                            color: "text.secondary",
                            justifyContent: "center",
                          }}
                        >
                          {icon}
                        </ListItemIcon>

                        {collapsed ? null : <ListItemText primary={item.label} />}
                      </ListItemButton>
                    );

                    return collapsed ? (
                      <Tooltip key={item.href} title={item.label} placement="right">
                        <Box>{content}</Box>
                      </Tooltip>
                    ) : (
                      content
                    );
                  })}
                </List>
              </Collapse>

              <Divider />
            </Box>
          );
        })}
      </List>
    </Box>
  );
};

export default SideBar;

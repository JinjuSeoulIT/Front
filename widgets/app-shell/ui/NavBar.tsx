"use client";

import * as React from "react";
import {
  AppBar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  Tooltip,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import MenuOpenOutlinedIcon from "@mui/icons-material/MenuOpenOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

interface NavBarProps {
  user?: {
    name?: string;
  };
  items: {
    key: string;
    label: string;
    href: string;
    icon?: React.ReactNode;
    children?: { label: string; href: string }[];
  }[];
  activeKey: string;
  sidebarHidden?: boolean;
  onToggleSidebarHidden?: () => void;
}

const NavBar = ({
  user,
  items,
  activeKey,
  sidebarHidden = false,
  onToggleSidebarHidden,
}: NavBarProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [openKey, setOpenKey] = React.useState<string | null>(null);
  const router = useRouter();
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  const handleOpen = (event: React.MouseEvent<HTMLElement>, key: string) => {
    setAnchorEl(event.currentTarget);
    setOpenKey(key);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenKey(null);
  };

  const activeItem = items.find((item) => item.key === openKey);

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Toolbar sx={{ px: 3, gap: 1 }}>
        {onToggleSidebarHidden ? (
          <IconButton
            aria-label={sidebarHidden ? "사이드바 펼치기" : "사이드바 접기"}
            onClick={onToggleSidebarHidden}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            {sidebarHidden ? (
              <MenuOutlinedIcon fontSize="small" />
            ) : (
              <MenuOpenOutlinedIcon fontSize="small" />
            )}
          </IconButton>
        ) : null}
        <Link href="/" style={{ display: "inline-flex" }}>
          <img
            src="/logo.png"
            alt="logo"
            style={{ height: 32, cursor: "pointer", display: "block" }}
          />
        </Link>

        <Stack direction="row" spacing={2} sx={{ ml: "auto", alignItems: "center" }}>
          <Stack direction="row" spacing={1}>
            {items.map((item) => (
              <Tooltip key={item.key} title={isSmDown ? item.label : ""} disableHoverListener={!isSmDown}>
                <Button
                  color="primary"
                  variant={activeKey === item.key ? "contained" : "text"}
                  sx={{ textTransform: "none", fontWeight: 600, minWidth: isSmDown ? 40 : undefined, px: isSmDown ? 1 : 1.5 }}
                  startIcon={!isSmDown ? item.icon : undefined}
                  onClick={(e) => handleOpen(e, item.key)}
                  aria-label={item.label}
                >
                  {isSmDown ? item.icon ?? item.label : item.label}
                </Button>
              </Tooltip>
            ))}
          </Stack>

          {user?.name ? (
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, whiteSpace: "nowrap", color: "text.secondary" }}
            >
              {user.name}님 어서오세요!
            </Typography>
          ) : null}
        </Stack>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          {activeItem?.children?.map((child) => (
            <MenuItem
              key={child?.href}
              onClick={() => {
                handleClose();
                if (child?.href) router.push(child.href);
              }}
            >
              {child.label}
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;

// app/not-found.tsx
"use client";

import Link from "next/link";
import { Box, Typography, Button } from "@mui/material";

export default function NotFound() {
  return (
    <Box
      textAlign="center"
      mt={10}
    >
      <Typography variant="h3" gutterBottom>
        🚫 페이지를 찾을 수 없습니다
      </Typography>

      <Typography variant="body1" color="text.secondary" gutterBottom>
        요청하신 주소가 존재하지 않거나 이동되었을 수 있습니다.
      </Typography>

      <Button
        component={Link}
        href="/"
        variant="contained"
        color="primary"
      >
        메인으로 돌아가기
      </Button>
    </Box>
  );
}

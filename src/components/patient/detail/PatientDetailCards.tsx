"use client";

import * as React from "react";
import Link from "next/link";
import { Button, Divider, Grid, Paper, Stack, Typography } from "@mui/material";

type CardItem = { title: string; desc: string; href: string };

const CARD_ITEMS: Omit<CardItem, "href">[] = [
  { title: "보험", desc: "환자 보험 등록/수정" },
  { title: "동의서", desc: "동의서 등록/파일 관리" },
  { title: "메모", desc: "주의사항/요청사항 기록" },
  { title: "제한", desc: "환자 제한 상태 관리" },
  { title: "플래그", desc: "환자 플래그 관리" },
  { title: "정보 변경 이력", desc: "기본정보 변경 이력" },
  { title: "상태 변경 이력", desc: "환자 상태 변경 이력" },
];

const HREF_SUFFIXES = ["insurance", "consent", "memo", "restriction", "flag", "info-history", "status-history"] as const;

type Props = {
  patientId: number;
};

export default function PatientDetailCards({ patientId }: Props) {
  const items: CardItem[] = CARD_ITEMS.map((item, i) => ({
    ...item,
    href: `/patient/${patientId}/${HREF_SUFFIXES[i]}`,
  }));

  return (
    <Grid container spacing={2}>
      {items.map((card) => (
        <Grid key={card.title} size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 4,
              border: "1px solid var(--line)",
              bgcolor: "white",
              boxShadow: "var(--shadow-1)",
            }}
          >
            <Stack spacing={1}>
              <Typography fontWeight={900}>{card.title}</Typography>
              <Typography color="text.secondary" fontWeight={700}>
                {card.desc}
              </Typography>
              <Divider />
              <Button variant="outlined" component={Link} href={card.href}>
                이동
              </Button>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

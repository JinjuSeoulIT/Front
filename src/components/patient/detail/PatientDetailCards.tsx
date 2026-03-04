"use client";

import * as React from "react";
import Link from "next/link";
import { Button, Divider, Grid, Paper, Stack, Typography } from "@mui/material";

type CardItem = { title: string; desc: string; href: string };

type Props = {
  patientId: number;
  cards: CardItem[];
};

export default function PatientDetailCards({ patientId, cards }: Props) {
  const items =
    cards.length > 0
      ? cards
      : [
          { title: "보험", desc: "환자 보험 등록/수정", href: `/patients/${patientId}/insurances` },
          { title: "동의서", desc: "동의서 등록/파일 관리", href: `/patients/${patientId}/consents` },
          { title: "메모", desc: "주의사항/요청사항 기록", href: `/patients/${patientId}/memos` },
          { title: "제한", desc: "환자 제한 상태 관리", href: `/patients/${patientId}/restrictions` },
          { title: "플래그", desc: "환자 플래그 관리", href: `/patients/${patientId}/flags` },
          { title: "정보 변경 이력", desc: "기본정보 변경 이력", href: `/patients/${patientId}/info-history` },
          { title: "상태 변경 이력", desc: "환자 상태 변경 이력", href: `/patients/${patientId}/status-history` },
        ];

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

"use client";

import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import MainLayout from "@/components/layout/MainLayout";
import ChartLayout from "@/components/chart/ChartLayout";
import PatientListPanel from "@/components/chart/PatientListPanel";
import ClinicalHistoryPanel from "@/components/chart/ClinicalHistoryPanel";
import OrderSetPanel from "@/components/chart/OrderSetPanel";
import PatientRecordsPanel from "@/components/chart/PatientRecordsPanel";
import type { ChartPatient } from "@/components/chart/chartTypes";
import { fetchClinicals } from "@/lib/clinicalApi";

export default function DoctorChartPage() {
  const [selectedPatient, setSelectedPatient] = useState<ChartPatient | null>({
    patientId: "2",
    name: "김메디",
    gender: "남",
    age: 23,
    birthDate: "1999-09-09",
    vip: true,
  });
  const [selectedClinicalId, setSelectedClinicalId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedPatient?.patientId) {
      setSelectedClinicalId(null);
      return;
    }
    fetchClinicals(selectedPatient.patientId)
      .then((list) => setSelectedClinicalId(list.length > 0 ? list[0].clinicalId : null))
      .catch(() => setSelectedClinicalId(null));
  }, [selectedPatient?.patientId]);

  return (
    <MainLayout>
      <ChartLayout selectedPatient={selectedPatient}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "minmax(200px, 1fr) minmax(280px, 1.4fr) minmax(200px, 1fr) minmax(220px, 1fr)",
            gap: 1.5,
            height: "calc(100vh - 220px)",
            minHeight: 420,
          }}
        >
          <PatientListPanel
            selectedPatient={selectedPatient}
            onSelectPatient={setSelectedPatient}
          />
          <ClinicalHistoryPanel patientId={selectedPatient?.patientId ?? null} />
          <OrderSetPanel
            patientId={selectedPatient?.patientId ?? null}
            clinicalId={selectedClinicalId}
          />
          <PatientRecordsPanel patientId={selectedPatient?.patientId ?? null} />
        </Box>
      </ChartLayout>
    </MainLayout>
  );
}

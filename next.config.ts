import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const patientsApiBase =
      process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.60:8181";
    const receptionApiBase =
      process.env.NEXT_PUBLIC_RECEPTION_API_BASE_URL ?? "http://192.168.1.55:8283";

    return [
      {
        source: "/api/patients/:path*",
        destination: `${patientsApiBase}/api/patients/:path*`,
      },
      {
        source: "/api/menus/:path*",
        destination: `${patientsApiBase}/api/menus/:path*`,
      },
      {
        source: "/api/codes/:path*",
        destination: `${patientsApiBase}/api/codes/:path*`,
      },
      {
        source: "/api/consent-types/:path*",
        destination: `${patientsApiBase}/api/consent-types/:path*`,
      },
      {
        source: "/api/insurances/:path*",
        destination: `${patientsApiBase}/api/insurances/:path*`,
      },
      {
        source: "/api/flags/:path*",
        destination: `${patientsApiBase}/api/flags/:path*`,
      },
      {
        source: "/api/memos/:path*",
        destination: `${patientsApiBase}/api/memos/:path*`,
      },
      {
        source: "/api/restrictions/:path*",
        destination: `${patientsApiBase}/api/restrictions/:path*`,
      },
      {
        source: "/api/status-history/:path*",
        destination: `${patientsApiBase}/api/status-history/:path*`,
      },
      {
        source: "/api/patients/:patientId/consents/:path*",
        destination: `${patientsApiBase}/api/patients/:patientId/consents/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${receptionApiBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

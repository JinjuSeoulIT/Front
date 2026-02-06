import Providers from "./providers";


export const metadata = {
  title: "경상대학교 병원",
  description: "경상대학교 병원 운영 시스템",
};

export default function RootLayout({children,}: {children: React.ReactNode;}) 
{
  return (
    <html lang="ko">
      <body>
        <div id="portal-root"></div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

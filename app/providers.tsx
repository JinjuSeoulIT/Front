"use client";

import * as React from "react";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";

import AppShell from "@/widgets/app-shell/ui/AppShell";
import theme from "@/shared/config/theme";
import { store } from "@/shared/store/store";

// Lightweight NoSSRWrapper to prevent server-side rendering of its children
const NoSSRWrapper = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
};

export { NoSSRWrapper };

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NoSSRWrapper>
          <AppShell>{children}</AppShell>
        </NoSSRWrapper>
      </ThemeProvider>
    </Provider>
  );
}

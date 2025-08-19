"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useTheme as useNextTheme } from "next-themes";
import { useMemo } from "react";

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "rgb(17, 24, 39)", // gray-900
      paper: "rgb(31, 41, 55)",   // gray-800
    },
    text: {
      primary: "#fff",
    },
  },
});

export function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useNextTheme();

  const muiTheme = useMemo(
    () => (theme === "dark" ? darkTheme : lightTheme),
    [theme]
  );

  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
}

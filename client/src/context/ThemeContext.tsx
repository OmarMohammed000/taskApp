import React, { createContext, useMemo, useState } from "react";
import { ThemeProvider,createTheme } from "@mui/material/styles";
import { CssBaseline, GlobalStyles } from "@mui/material";


export const ThemeContext = createContext({
  toggleColorMode: () => {},
});

const THEME_STORAGE_KEY = 'task-theme-preference';
const [mode,setMode]= useState<"light" | "dark">(localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light');
export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
// making toggle function
const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          localStorage.setItem(THEME_STORAGE_KEY, newMode);
          return newMode;
        });
      },
    }),
    []
  );

const theme = useMemo(
    () =>
      createTheme({
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                transition: "all 0.3s linear",
              },
            },
          },
        },
        palette: {
          mode,
          ...(mode === "light"
            ? {
                // Light mode colors
                primary: {
                  main: "#0D47A1",
                },
                secondary: {
                  main: "#1565C0",
                },
                background: {
                  default: "#f4f6f8",
                  paper: "#ffffff",
                },
                text: {
                  primary: "#1a1a1a",
                  secondary: "#555",
                },
              }
            : {
                // Dark mode colors
                primary: { main: "#90caf9" },
                secondary: { main: "#64b5f6" },
                background: {
                  default: "#121212",
                  paper: "#1e1e1e",
                },
                text: {
                  primary: "#ffffff",
                  secondary: "#b0b0b0",
                },
              }),
        },
      }),
    [mode]
  );
return(
    <ThemeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
         {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

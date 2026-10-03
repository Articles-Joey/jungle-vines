"use client";

import { Roboto } from "next/font/google";
import { createTheme } from "@mui/material/styles";
import { bootstrapCompatibilityTheme } from "@articles-media/articles-dev-box/bootstrapCompatibilityTheme";

const roboto = Roboto({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"],
    display: "swap",
});

export function createAppTheme(mode = "dark") {
    const cardBackground = "#26491f";

    return createTheme({
        cssVariables: true,
        palette: {
            mode,
            primary: { main: "#f9edcd" },
            game: { card: cardBackground, cardHeader: "#1a3115" },
        },
        typography: {
            fontFamily: roboto.style.fontFamily,
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: { fontSize: "0.7rem", whiteSpace: "pre", borderRadius: 0 },
                },
            },
            MuiAlert: {
                styleOverrides: {
                    root: {
                        variants: [{
                            props: { severity: "info" },
                            style: { backgroundColor: "#60a5fa" },
                        }],
                    },
                },
            },
            MuiCssBaseline: {
                // Dev-box still uses these compatibility utilities internally.
                styleOverrides: (muiTheme) => ({
                    ...bootstrapCompatibilityTheme.MuiCssBaseline.styleOverrides(muiTheme),
                    ":root": {
                        "--card-background-override": cardBackground,
                        "--articles-card-font-color": "#fff",
                        "--articles-button-background-color": mode === "dark" ? "#524219" : "#9f8132",
                        "--articles-button-color": mode === "dark" ? "#fff" : "#212529",
                    },
                    ".stats-overlay": {
                        position: "fixed",
                        top: 0,
                        right: "0 !important",
                        left: "initial !important",
                        zIndex: 4,
                    },
                }),
            },
        },
    });
}

export default createAppTheme();

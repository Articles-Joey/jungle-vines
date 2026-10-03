"use client";

import DevBoxButton from "@articles-media/articles-dev-box/Button";

export default function ArticlesButton({ variant = "articles", active, alt, sx, ...props }) {
    return (
        <DevBoxButton
            {...props}
            variant={variant}
            active={active}
            sx={[
                (theme) => {
                    const dark = theme.palette.mode === "dark";
                    return {
                        borderRadius: 0,
                        fontFamily: "brandon-grotesque, sans-serif",
                        fontStyle: "normal",
                        fontWeight: 900,
                        fontSize: "0.7rem",
                        whiteSpace: "pre",
                        ...(variant === "articles" && {
                            color: dark || alt ? "#fff" : "#212529",
                            bgcolor: active ? (dark ? "#31280f" : "#524219") : alt ? "#000" : dark ? "#524219" : "#9f8132",
                            border: "1px solid",
                            borderColor: dark ? "rgb(29,29,29)" : "#ced4da",
                            borderBottom: `3px solid ${active ? "#000" : "#f9edcd"}`,
                            "&:hover": {
                                bgcolor: active ? (dark ? "#31280f" : "#524219") : alt ? "#585858" : dark ? "#000" : "#e2e6ea",
                                color: dark || alt ? "#fff" : "#212529",
                                textDecoration: "none",
                            },
                            "&:active": { bgcolor: dark ? "#31280f" : "#524219", borderBottomColor: "#000" },
                            "&.Mui-disabled": { filter: "grayscale(1)", color: "darkgray", opacity: 1 },
                        }),
                    };
                },
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
        />
    );
}
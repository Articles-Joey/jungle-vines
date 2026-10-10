"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";

export default function IsDev({ className, noOutline, children, inline, sx }) {
    const userReduxState = false;
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (children && userReduxState?.roles?.isDev && isMounted) {
        return (
            <Box
                className={[
                    "is-dev-content",
                    noOutline ? "no-outline" : "",
                    className,
                ]
                    .filter(Boolean)
                    .join(" ")}
                sx={[
                    { display: inline ? "inline-block" : "block" },
                    ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
                ]}
            >
                {children}
            </Box>
        );
    }

    return null;
}

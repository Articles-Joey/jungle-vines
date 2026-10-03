"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ReplayIcon from "@mui/icons-material/Replay";
import { useStore } from "@/hooks/useStore";
import ArticlesButton from "./Button";

export default function ScoreCard() {
    const maxDistanceTraveled = useStore((state) => state.maxDistanceTraveled);
    const setMaxDistanceTraveled = useStore((state) => state.setMaxDistanceTraveled);

    return (
        <Card sx={{ bgcolor: "game.card", color: "#fff", backgroundImage: "none", fontSize: "0.875rem", border: 1, borderColor: "divider" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "game.cardHeader", p: "0.5rem", borderBottom: 1, borderColor: "divider" }}>
                <Box>High Score</Box>
                <ArticlesButton small aria-label="Reset high score" onClick={() => setMaxDistanceTraveled(0)}>
                    <ReplayIcon fontSize="small" />
                </ArticlesButton>
            </Box>
            <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                <Box component="h1" sx={{ fontFamily: '"Stick", sans-serif', fontWeight: 400, fontStyle: "normal", fontSize: "calc(1.375rem + 1.5vw)", "@media (min-width: 1200px)": { fontSize: "2.5rem" }, lineHeight: 1.2, m: 0 }}>
                    {maxDistanceTraveled.toFixed(0)}m
                </Box>
            </CardContent>
        </Card>
    );
}

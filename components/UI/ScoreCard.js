"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useScoreStore } from "@/hooks/useScoreStore";
import { MAP_CONFIG } from "../Game/mapLayout";

export default function ScoreCard() {
    const best = useScoreStore((state) => state.bestScores.endless);
    const completed = useScoreStore((state) => state.levelCompletion);

    return (
        <Card
            sx={{
                bgcolor: "game.card",
                color: "#fff",
                backgroundImage: "none",
                fontSize: "0.875rem",
                border: 1,
                borderColor: "divider",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    bgcolor: "game.cardHeader",
                    p: "0.5rem",
                    borderBottom: 1,
                    borderColor: "divider",
                }}
            >
                <Box>Saved progress</Box>
            </Box>
            <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                <Box
                    component="div"
                    sx={{
                        fontFamily: '"Stick", sans-serif',
                        fontWeight: 400,
                        fontStyle: "normal",
                        fontSize: "calc(1.375rem + 1.5vw)",
                        "@media (min-width: 1200px)": { fontSize: "2.5rem" },
                        lineHeight: 1.2,
                        m: 0,
                    }}
                >
                    {best} m
                </Box>
                <Box sx={{ mb: 1 }}>Best Endless distance</Box>
                {["easy", "medium", "hard"].map((level) => (
                    <Box
                        key={level}
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 2,
                        }}
                    >
                        <span>{MAP_CONFIG[level].label}</span>
                        <span>
                            {completed[level] ? "Completed ✓" : "Not completed"}
                        </span>
                    </Box>
                ))}
            </CardContent>
        </Card>
    );
}

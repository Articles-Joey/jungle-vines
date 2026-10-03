"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ReplayIcon from "@mui/icons-material/Replay";
import CodeIcon from "@mui/icons-material/Code";
import { useStore } from "@/hooks/useStore";
import ArticlesButton from "./Button";

export default function DebugPanel() {
    const debugMode = useStore((state) => state.debug);
    const setDebugMode = useStore((state) => state.setDebug);
    const reloadScene = useStore((state) => state.reloadScene);

    return (
        <Card sx={{ bgcolor: "game.card", color: "#fff", backgroundImage: "none", fontSize: "0.875rem", border: 1, borderColor: "divider" }}>
            <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                <Box sx={{ fontSize: "0.875em", opacity: 0.75 }}>Debug Controls</Box>
                <Box sx={{ fontSize: "0.875em", border: 1, borderColor: "divider", p: "0.5rem" }} />
                <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                    <ArticlesButton small sx={{ width: "50%" }} startIcon={<ReplayIcon />} onClick={() => reloadScene()}>
                        Reload Game
                    </ArticlesButton>
                    <ArticlesButton small sx={{ width: "50%" }} startIcon={<ReplayIcon />} onClick={() => reloadScene()}>
                        Reset Camera
                    </ArticlesButton>
                    <ArticlesButton small sx={{ width: "50%" }} startIcon={<CodeIcon />} active={debugMode} onClick={() => setDebugMode(!debugMode)}>
                        Debug Mode
                    </ArticlesButton>
                </Box>
            </CardContent>
        </Card>
    );
}
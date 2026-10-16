"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ReplayIcon from "@mui/icons-material/Replay";
import CodeIcon from "@mui/icons-material/Code";
import { useStore } from "@/hooks/useStore";
import { useGameStore } from "@/hooks/useGameStore";
import ArticlesButton from "./Button";

export default function DebugPanel() {
    const debugMode = useStore((state) => state.debug);
    const setDebugMode = useStore((state) => state.setDebug);
    const reloadScene = useStore((state) => state.reloadScene);
    const cameraControlMethod = useStore((state) => state.cameraControlMethod);
    const setCameraControlMethod = useStore(
        (state) => state.setCameraControlMethod,
    );
    const resetCamera = useGameStore((state) => state.resetCamera);
    const playerLocation = useGameStore((state) => state.playerLocation);
    const [cameraAnchor, setCameraAnchor] = useState(null);
    const coordinates = [
        playerLocation?.x ?? 0,
        playerLocation?.y ?? 0,
        playerLocation?.z ?? 0,
    ].join(", ");

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
            <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                <Box sx={{ fontSize: "0.875em", opacity: 0.75 }}>
                    Debug Controls
                </Box>
                <Box
                    sx={{
                        fontSize: "0.875em",
                        border: 1,
                        borderColor: "divider",
                        p: "0.5rem",
                    }}
                >
                    Player location: [{coordinates}]
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                    <ArticlesButton
                        small
                        sx={{ width: "50%" }}
                        startIcon={<ReplayIcon />}
                        onClick={() => reloadScene()}
                    >
                        Reload Game
                    </ArticlesButton>
                    <ArticlesButton
                        small
                        sx={{ width: "50%" }}
                        startIcon={<ReplayIcon />}
                        onClick={() => {
                            setCameraControlMethod("Orbit");
                            resetCamera();
                        }}
                    >
                        Reset Camera
                    </ArticlesButton>
                    <ArticlesButton
                        small
                        id="debug-camera-menu-button"
                        sx={{ width: "50%" }}
                        aria-controls={
                            cameraAnchor ? "debug-camera-menu" : undefined
                        }
                        aria-haspopup="menu"
                        aria-expanded={cameraAnchor ? "true" : undefined}
                        endIcon={<ArrowDropDownIcon />}
                        onClick={(event) => setCameraAnchor(event.currentTarget)}
                    >
                        Camera
                    </ArticlesButton>
                    <ArticlesButton
                        small
                        sx={{ width: "50%" }}
                        startIcon={<CodeIcon />}
                        active={debugMode}
                        onClick={() => setDebugMode(!debugMode)}
                    >
                        Debug Mode
                    </ArticlesButton>
                </Box>
                <Menu
                    id="debug-camera-menu"
                    anchorEl={cameraAnchor}
                    open={Boolean(cameraAnchor)}
                    onClose={() => setCameraAnchor(null)}
                    slotProps={{
                        list: { "aria-labelledby": "debug-camera-menu-button" },
                    }}
                >
                    <Box sx={{ p: "0.5rem" }}>
                        Camera: {cameraControlMethod}
                    </Box>
                    <Divider />
                    {[
                        "Side Scroll",
                        "First Person",
                        "Third Person",
                        "Orbit",
                    ].map((item) => (
                        <MenuItem
                            key={item}
                            selected={cameraControlMethod === item}
                            onClick={() => {
                                setCameraControlMethod(item);
                                setCameraAnchor(null);
                            }}
                        >
                            {item}
                        </MenuItem>
                    ))}
                </Menu>
            </CardContent>
        </Card>
    );
}

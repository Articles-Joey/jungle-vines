"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import GameMenuPrimaryButtonGroup from "@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup";
import ArticlesButton from "@/components/UI/Button";
import { useSocketStore } from "@/hooks/useSocketStore";
import { useStore } from "@/hooks/useStore";
import ScoreCard from "../UI/ScoreCard";
import DebugPanel from "../UI/DebugPanel";

export default function LeftPanelContent() {
    const socket = useSocketStore((state) => state.socket);
    const connected = useSocketStore((state) => state.connected);
    const debug = useStore((state) => state.debug);
    const cameraControlMethod = useStore((state) => state.cameraControlMethod);
    const setCameraControlMethod = useStore(
        (state) => state.setCameraControlMethod,
    );
    const server = useSearchParams().get("server");
    const [cameraAnchor, setCameraAnchor] = useState(null);

    return (
        <Box sx={{ width: "100%" }}>
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
                    <Box sx={{ display: "flex", flexWrap: "wrap", mb: "1rem" }}>
                        <GameMenuPrimaryButtonGroup
                            useStore={useStore}
                            type="GameMenu"
                            useRouter={useRouter}
                        />
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Box>Server: {server || "Single player"}</Box>
                        <Box>Players: {0}/4</Box>
                    </Box>
                    {!connected && (
                        <Box>
                            <Box
                                sx={{
                                    fontSize: "1rem",
                                    fontWeight: 500,
                                    mb: "0.25rem",
                                }}
                            >
                                Not connected
                            </Box>
                            <ArticlesButton
                                small
                                onClick={() => socket?.connect()}
                                sx={{ width: "100%", mb: "1rem" }}
                            >
                                Reconnect!
                            </ArticlesButton>
                        </Box>
                    )}
                    <ArticlesButton
                        id="camera-menu-button"
                        sx={{ width: "50%" }}
                        aria-controls={cameraAnchor ? "camera-menu" : undefined}
                        aria-haspopup="menu"
                        aria-expanded={cameraAnchor ? "true" : undefined}
                        endIcon={<ArrowDropDownIcon />}
                        onClick={(event) =>
                            setCameraAnchor(event.currentTarget)
                        }
                    >
                        Camera
                    </ArticlesButton>
                    <Menu
                        id="camera-menu"
                        anchorEl={cameraAnchor}
                        open={Boolean(cameraAnchor)}
                        onClose={() => setCameraAnchor(null)}
                        slotProps={{
                            list: { "aria-labelledby": "camera-menu-button" },
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
            <ScoreCard />
            {debug && <DebugPanel />}
        </Box>
    );
}

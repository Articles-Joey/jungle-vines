"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import ArticlesButton from "./Button";
import { useStore } from "@/hooks/useStore";
import { useScoreStore } from "@/hooks/useScoreStore";
import { CHUNK_LENGTH, GAME_MODES, MAP_CONFIG } from "../Game/mapLayout";
import Link from "next/link";

export default function GameModeSelect() {
    const [anchor, setAnchor] = useState(null);
    const mode = useStore((state) => state.gameMode) || "easy";
    const setGameMode = useStore((state) => state.setGameMode);
    const seed = useStore((state) => state.seed);
    const setSeed = useStore((state) => state.setSeed);
    const completed = useScoreStore((state) => state.levelCompletion);
    return (
        <Box>
            <Box
                sx={{
                    mb: 2,
                    display: "flex",
                }}
            >
                <ArticlesButton
                    id="game-mode-button"
                    sx={{ width: "100%" }}
                    endIcon={<ArrowDropDownIcon />}
                    aria-haspopup="menu"
                    aria-controls={anchor ? "game-mode-menu" : undefined}
                    aria-expanded={anchor ? "true" : undefined}
                    onClick={(event) => setAnchor(event.currentTarget)}
                >
                    {MAP_CONFIG[mode].label}
                </ArticlesButton>
                <Menu
                    id="game-mode-menu"
                    anchorEl={anchor}
                    open={Boolean(anchor)}
                    onClose={() => setAnchor(null)}
                    slotProps={{
                        list: { "aria-labelledby": "game-mode-button" },
                    }}
                >
                    {GAME_MODES.map((item) => (
                        <MenuItem
                            key={item}
                            selected={mode === item}
                            onClick={() => {
                                setGameMode(item);
                                setAnchor(null);
                            }}
                            sx={{ gap: 1, minWidth: 180 }}
                        >
                            {MAP_CONFIG[item].label}
                            {completed[item] && (
                                <CheckCircleIcon
                                    fontSize="small"
                                    aria-label="Completed"
                                />
                            )}
                        </MenuItem>
                    ))}
                </Menu>
                <Link href="/play">
                    <ArticlesButton
                        id="game-mode-button"
                        sx={{ width: "100%" }}
                        endIcon={<PlayCircleIcon />}
                        aria-haspopup="menu"
                        onClick={(event) => {}}
                    >
                        Play
                    </ArticlesButton>
                </Link>
                {/* <Box sx={{ mt: 1, fontSize: "0.875rem" }}>
                    {mode === "endless" ? "Travel as far as you can. The same seed recreates the same course."
                        : `Reach the finish platform · ${MAP_CONFIG[mode].chunks * CHUNK_LENGTH} m`}
                </Box> */}
                {/* <Box sx={{ mt: 1, fontSize: "0.8rem", opacity: 0.8 }}>
                    A/D: move · W/S: climb ropes · Hold S: crouch on platforms · Space: jump / release
                </Box> */}
            </Box>
            {mode === "endless" && (
                <TextField
                    label="Endless seed"
                    value={seed}
                    size="small"
                    fullWidth
                    sx={{ mt: 1 }}
                    onChange={(event) =>
                        setSeed(event.target.value.slice(0, 64))
                    }
                />
            )}
        </Box>
    );
}

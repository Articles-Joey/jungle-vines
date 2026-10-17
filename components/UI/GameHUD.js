"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import ArticlesButton from "./Button";
import { useGameStore } from "@/hooks/useGameStore";
import { useScoreStore } from "@/hooks/useScoreStore";
import { useStore } from "@/hooks/useStore";
import { CHUNK_LENGTH, GAME_MODES, MAP_CONFIG } from "../Game/mapLayout";

export default function GameHUD() {
    const mode = useGameStore((state) => state.runMode);
    const status = useGameStore((state) => state.runStatus);
    const distance = useGameStore((state) => state.runDistance);
    const seed = useGameStore((state) => state.runSeed);
    const restart = useGameStore((state) => state.startRun);
    const best = useScoreStore((state) => state.bestScores.endless);
    const setMode = useStore((state) => state.setGameMode);
    const screenshotMode = useStore((state) => state.screenshotMode);
    const ended = status === "dead" || status === "completed";
    const config = MAP_CONFIG[mode];
    const next = GAME_MODES[GAME_MODES.indexOf(mode) + 1];
    return (
        <>
            {!screenshotMode && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        zIndex: 40,
                        p: 1.5,
                        bgcolor: "#142013dd",
                        color: "white",
                        borderRadius: 1,
                        pointerEvents: "none",
                    }}
                >
                    <Box sx={{ fontWeight: 700 }}>
                        {config.label} · {distance} m
                        {config.chunks
                            ? ` / ${config.chunks * CHUNK_LENGTH} m`
                            : ""}
                    </Box>
                    {mode === "endless" && (
                        <Box sx={{ fontSize: "0.8rem" }}>
                            Best: {best} m · Seed: {seed}
                        </Box>
                    )}
                </Box>
            )}
            {ended && (
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 50,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "#0006",
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: "#192419",
                            color: "white",
                            p: 3,
                            maxWidth: 420,
                            width: "calc(100% - 32px)",
                            border: "1px solid #8aad62",
                            textAlign: "center",
                        }}
                    >
                        <Box
                            component="h2"
                            aria-live="polite"
                            sx={{ mt: 0 }}
                        >
                            {status === "completed"
                                ? `${config.label} complete!`
                                : "Run over"}
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            {status === "completed"
                                ? "Your level completion has been saved."
                                : `You reached ${distance} m.`}
                        </Box>
                        {mode === "endless" && (
                            <Box sx={{ mb: 2 }}>Best distance: {best} m</Box>
                        )}
                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 1,
                                justifyContent: "center",
                            }}
                        >
                            <ArticlesButton onClick={() => restart()}>
                                Play again
                            </ArticlesButton>
                            {status === "completed" && next && (
                                <ArticlesButton onClick={() => setMode(next)}>
                                    {next === "endless"
                                        ? "Play Endless"
                                        : `Next: ${MAP_CONFIG[next].label}`}
                                </ArticlesButton>
                            )}
                            <ArticlesButton
                                component={Link}
                                href="/"
                            >
                                Choose level
                            </ArticlesButton>
                        </Box>
                    </Box>
                </Box>
            )}
        </>
    );
}

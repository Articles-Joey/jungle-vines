"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoIcon from "@mui/icons-material/Info";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { PieMenu } from "@articles-media/articles-gamepad-helper";
import PageTemplateLandingPage from "@articles-media/articles-dev-box/PageTemplateLandingPage";
import { useSocketStore } from "@/hooks/useSocketStore";
import { useStore } from "@/hooks/useStore";
import ScoreCard from "@/components/UI/ScoreCard";

const LandingBackgroundAnimation = dynamic(
    () => import("@/components/Game/LandingBackgroundAnimation"),
    { ssr: false },
);

export default function LobbyPage() {
    const darkMode = useStore((state) => state.darkMode);
    const maxDistanceTraveled = useStore((state) => state.maxDistanceTraveled);

    const pieOptions = [
        {
            label: "Settings",
            Icon: SettingsIcon,
            callback: () => {
                const state = useStore.getState();
                state.setShowSettingsModal(!state.showSettingsModal);
            },
        },
        {
            label: "Go Back",
            Icon: ArrowBackIcon,
            callback: () => window.history.back(),
        },
        {
            label: "Credits",
            Icon: InfoIcon,
            callback: () => useStore.getState().setShowCreditsModal(true),
        },
        {
            label: "Game Launcher",
            Icon: SportsEsportsIcon,
            callback: () => {
                window.location.href = "https://games.articles.media";
            },
        },
    ];

    return (
        <Box
            sx={{
                position: "relative",
                isolation: "isolate",
                "& .landing-page": {
                    flexGrow: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                },
                "& .servers": {
                    display: "grid",
                    gap: "5px",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                },
                "& .server": {
                    p: "0.5rem",
                    border: "1px solid rgba(0,0,0,0.25)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                },
                "& .ad-wrap": {
                    mt: "1rem",
                    "@media (min-width: 992px)": {
                        mt: 0,
                        display: "block",
                        position: "absolute",
                        right: "1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                    },
                },
                "& .background-wrap": {
                    position: "fixed",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: -1,
                    "& img": {
                        filter:
                            darkMode === false
                                ? "blur(5px)"
                                : "blur(5px) brightness(0.5) !important",
                        transform: "scale(1.05)",
                        objectFit: "cover",
                    },
                },
            }}
        >
            <Suspense>
                <Box data-hide-in-screenshot-mode="true">
                    <PieMenu
                        options={pieOptions.map(
                            ({ label, Icon, callback }) => ({
                                label: (
                                    <Box
                                        component="span"
                                        sx={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 0.5,
                                        }}
                                    >
                                        <Icon fontSize="small" />
                                        {label}
                                    </Box>
                                ),
                                callback,
                            }),
                        )}
                        onFinish={(event) => event.callback?.()}
                    />
                </Box>
            </Suspense>
            <PageTemplateLandingPage
                useSocketStore={useSocketStore}
                useStore={useStore}
                Link={Link}
                useRouter={useRouter}
                logoImage="img/icon.png"
                LandingBackgroundAnimation={<LandingBackgroundAnimation />}
                heroOverride={
                    <Box className="hero">
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                mb: 0,
                            }}
                        >
                            <Box
                                component="img"
                                className="hero-icon"
                                src="/img/icon.png"
                                alt="Jungle Vines"
                                sx={{ maxWidth: "100%" }}
                            />
                        </Box>
                        <Box
                            sx={{
                                fontFamily: '"Stick", sans-serif',
                                fontWeight: 400,
                                fontStyle: "normal",
                                fontSize: "3rem",
                                textAlign: "center",
                                color: "#c0c554",
                                textShadow: "1px 4px 5px rgb(84,126,7)",
                                mb: "1rem",
                                WebkitTextStroke: "2px black",
                            }}
                        >
                            {process.env.NEXT_PUBLIC_GAME_NAME}
                        </Box>
                    </Box>
                }
                PostHeroContent={
                    maxDistanceTraveled ? (
                        <Box sx={{ mb: "1rem" }}>
                            <ScoreCard />
                        </Box>
                    ) : null
                }
                NicknameInputConfig={{
                    PreComponent: (
                        <Box
                            component="img"
                            className="panel-bg"
                            src="/img/icon.png"
                            alt=""
                            width={70}
                            height={70}
                            sx={{ mr: "0.5rem" }}
                        />
                    ),
                }}
                backgroundImage="/img/background.webp"
                singlePlayerConfig={{
                    attachServerType: "single-player",
                }}
                multiplayerConfig={{
                    type: "WebSocket",
                    comingSoon: true,
                    defaultServers: 2,
                    privateServerSupport: false,
                    onlinePlayersTemplate: "2.0",
                }}
            />
        </Box>
    );
}

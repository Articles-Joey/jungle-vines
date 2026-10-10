"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import classNames from "classnames";
import useFullscreen from "@articles-media/articles-dev-box/useFullscreen";
import GameMenu from "@articles-media/articles-dev-box/GameMenu";
import LeftPanelContent from "@/components/Game/LeftPanel";
import { useSocketStore } from "@/hooks/useSocketStore";
import { useStore } from "@/hooks/useStore";

const GameCanvas = dynamic(() => import("@/components/Game/GameCanvas"), {
    ssr: false,
});

export default function GamePage() {
    const socket = useSocketStore((state) => state.socket);
    const connected = useSocketStore((state) => state.connected);
    const server = useSearchParams().get("server");
    const sceneKey = useStore((state) => state.sceneKey);
    const showMenu = useStore((state) => state.showMenu);
    const sidebar = useStore((state) => state.sidebar);
    const nickname = useStore((state) => state.nickname);
    const { isFullscreen } = useFullscreen();

    useEffect(() => {
        if (server && socket?.connected) {
            socket.emit("join-room", `game:cannon-room-${server}`, {
                game_id: server,
                nickname,
                client_version: "1",
            });
        }
    }, [server, socket, connected, nickname]);

    return (
        <Box
            className={classNames(
                `${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`,
                {
                    "menu-open": showMenu,
                    fullscreen: isFullscreen,
                    "show-sidebar": sidebar,
                },
            )}
            id={`${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`}
            sx={{
                position: "relative",
                display: "flex",
                "& .background": {
                    position: "fixed",
                    inset: 0,
                    height: "100%",
                    width: "100%",
                    zIndex: 0,
                    overflow: "hidden",
                    "& img": {
                        filter: "blur(2px) brightness(0.8)",
                        transform: "scale(1.05)",
                    },
                },
                "& .container": { position: "relative", zIndex: 1 },
                "& .touch-controls-area": {
                    position: "fixed",
                    bottom: 50,
                    left: 0,
                    width: "100%",
                    height: 150,
                    zIndex: 1,
                    bgcolor: "rgba(0,0,0,0.5)",
                    p: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                },
                "& .debug-info, & .game-info": {
                    height: "calc(100vh - 100px)",
                    width: 300,
                    flexShrink: 0,
                    "& .card, & .MuiCard-root": { height: "100%" },
                },
                "& .game": {
                    p: "0.5rem 1rem",
                    display: "flex",
                    justifyContent: "center",
                },
                "& .game-panel": { width: "100%" },
            }}
        >
            <GameMenu
                useStore={useStore}
                LeftPanelContent={LeftPanelContent}
                menuBarConfig={{
                    style: "Corner Button",
                    menuBarButtonPosition: "Left",
                }}
                sidebarConfig={{ style: "Static Panel" }}
            />
            <Box
                className="canvas-wrap"
                sx={{
                    position: "relative",
                    width: "100vw",
                    height: "100vh",
                    "& canvas": {
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        left: 0,
                        top: 0,
                    },
                }}
            >
                <GameCanvas key={sceneKey} />
            </Box>
        </Box>
    );
}

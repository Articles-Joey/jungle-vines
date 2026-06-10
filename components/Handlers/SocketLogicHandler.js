"use client";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { useSocketStore } from "@/hooks/useSocketStore";
import { useStore } from '@/hooks/useStore';
import { useGameStore } from '@/hooks/useGameStore';

import ReusedSocketLogicHandler from '@articles-media/articles-dev-box/ReusedSocketLogicHandler';

export default function SocketLogicHandler(props) {
    const _hasHydrated = useStore((state) => state._hasHydrated);

    // const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { server } = params

    if (!_hasHydrated) return null;

    return <>
        <ReusedSocketLogicHandler
            pathname={pathname}
            useStore={useStore}
            useGameStore={useGameStore}
            useSocketStore={useSocketStore}
            debugConfig={{
                enabled: true,
                // autoHide: true,
                autoHideDelay: 5000,
            }}
            landingConfig={{
                handleLandingDetails: true,
                onLandingDetails: (data) => {
                    console.log("[SocketLogicHandler] onLandingDetails", data)
                }
            }}
            gameConfig={{
                handleGameUpdates: true,
                onGameUpdate: (data) => {
                    console.log("[SocketLogicHandler] onGameUpdate", data)
                }
            }}
            server={server}
        />
    </>
}
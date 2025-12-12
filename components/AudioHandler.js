"use client";

import { useEffect } from "react";
import { useStore } from "@/hooks/useStore";
import { usePathname } from "next/navigation";

export default function AudioHandler() {

    const pathname = usePathname();

    const audioSettings = useStore((state) => state?.audioSettings);
    const setAudioSettings = useStore((state) => state?.setAudioSettings);

    let music

    if (typeof window !== 'undefined') {
        music = new Audio(`/audio/Jungle Vines.mp3`);
        music.volume = audioSettings?.backgroundMusicVolume ? (audioSettings?.backgroundMusicVolume / 100) : 0; // Set volume based on initial state
    }

    useEffect(() => {

        if (pathname === "/") {
            return () => {
                music.pause();
            };
        }

        if (audioSettings?.enabled) {
            music.currentTime = 0;
            const playPromise = music.play();

            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Auto-play was prevented or interrupted
                });
            }

            music.onended = function () {
                console.log('audio ended');
                music.currentTime = 0;
                music.play().catch(() => {});
            };
        }

        return () => {
            music.pause();
        };
    }, [audioSettings, pathname]);

    return null;

}
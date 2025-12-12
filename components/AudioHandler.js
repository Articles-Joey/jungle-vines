"use client";

import { useEffect } from "react";
import { useStore } from "@/hooks/useStore";

export default function AudioHandler() {

    const audioSettings = useStore((state) => state?.audioSettings);
    const setAudioSettings = useStore((state) => state?.setAudioSettings);

    let music

    if (typeof window !== 'undefined') {
        music = new Audio(`/audio/Jungle Vines.mp3`);
        music.volume = audioSettings?.backgroundMusicVolume ? (audioSettings?.backgroundMusicVolume / 100) : 0; // Set volume based on initial state
    }

    useEffect(() => {

        if (audioSettings?.enabled) {
            music.currentTime = 0;
            music.play();

            music.onended = function () {
                console.log('audio ended');
                music.currentTime = 0;
                music.play();
            };
        }

        return () => {
            music.pause();
        };
    }, [audioSettings]);

    return null;

}
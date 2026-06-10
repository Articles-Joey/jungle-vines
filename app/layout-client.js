"use client"
import { Suspense } from 'react';
import packageInfo from '@/package.json';

import GlobalBody from '@articles-media/articles-dev-box/GlobalBody';

import { useStore } from '@/hooks/useStore';

import GlobalClientModals from '@articles-media/articles-dev-box/GlobalClientModals';
import DarkModeHandler from "@articles-media/articles-dev-box/DarkModeHandler";
import ToontownModeHandler from '@articles-media/articles-dev-box/ToontownModeHandler';
import { useAudioStore } from '@/hooks/useAudioStore';
import useTouchControlsStore from '@/hooks/useTouchControlsStore';
import { useSocketStore } from '@/hooks/useSocketStore';
import { useHotkeys } from 'react-hotkeys-hook';

export default function LayoutClient({ children }) {

    const darkMode = useStore((state) => state?.darkMode);

    useHotkeys('r', () => {
        console.log("Reloading Scene")
        useStore.getState().reloadScene();
    }, [])

    return (
        <>
            <GlobalBody />
            <DarkModeHandler
                useStore={useStore}
            />
            <ToontownModeHandler 
                useStore={useStore}
            />
            <Suspense>
                <GlobalClientModals
                    useStore={useStore}
                    useAudioStore={useAudioStore}
                    useTouchControlsStore={useTouchControlsStore}
                    useSocketStore={useSocketStore}

                    packageInfo={packageInfo}
                    settingsModalConfig={{
                        tabs: {
                            'Graphics': {
                                darkMode: true,
                                landingAnimation: true
                            },
                            'Audio': {
                                sliders: [
                                    ...useAudioStore.getState().audioSettings ?
                                        Object.keys(useAudioStore.getState().audioSettings).filter(key => key !== "enabled").map(key => ({
                                            key,
                                            label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                        }))
                                        :
                                        [],
                                ]
                            },
                            'Controls': {
                                touchControls: true
                                // defaultKeyBindings: {
                                //     // moveUp: "W",
                                //     // moveDown: "S",
                                //     // moveLeft: "A",
                                //     // moveRight: "D",
                                // }
                            },
                            'Multiplayer': {
                                serverUrl: true,
                            },
                            'Other': {
                                toontownMode: true,
                            },
                            'Debug': {
                                showStats: true,
                                children: <>

                                </>,
                            }
                        },
                        reset: () => {
                            useAudioStore.getState().resetAudioSettings();
                        }
                    }}
                    infoModalConfig={{
                        previewImage: darkMode ? "img/preview-dark.webp" : "img/preview.webp",
                    }}
                />
            </Suspense>
        </>
    );
}

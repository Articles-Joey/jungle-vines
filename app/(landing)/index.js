"use client"
import { useEffect, useContext, useState, Suspense } from 'react';

import Link from 'next/link'
import dynamic from 'next/dynamic'

import ArticlesButton from '@/components/UI/Button';

import { useSocketStore } from '@/hooks/useSocketStore';
import { useStore } from '@/hooks/useStore';
import ScoreCard from '@/components/UI/ScoreCard';

import { PieMenu } from '@articles-media/articles-gamepad-helper';
import PageTemplateLandingPage from '@articles-media/articles-dev-box/PageTemplateLandingPage';

// const backgroundImage = `img/preview.webp`;
const LandingBackgroundAnimation = dynamic(() =>
    import('@/components/Game/LandingBackgroundAnimation'),
    {
        ssr: false,
        // loading: () => <img
        //     src={backgroundImage.src}
        //     alt=""
        //     // fill
        //     style={{ objectFit: 'cover', objectPosition: 'center', filter: 'blur(10px)' }}
        // />
    }
);

export default function LobbyPage() {

    const darkMode = useStore((state) => state.darkMode)
    const toontownMode = useStore(state => state.toontownMode);

    const maxDistanceTraveled = useStore((state) => state.maxDistanceTraveled);

    const setShowSettingsModal = useStore((state) => state.setShowSettingsModal);
    const setShowCreditsModal = useStore((state) => state.setShowCreditsModal);

    return (
        <>
            <Suspense>
                <PieMenu
                    options={[
                        {
                            label: 'Settings',
                            icon: 'fad fa-cog',
                            callback: () => {
                                setShowSettingsModal(prev => !prev)
                            }
                        },
                        {
                            label: 'Go Back',
                            icon: 'fad fa-cog',
                            callback: () => {
                                window.history.back()
                            }
                        },
                        {
                            label: 'Credits',
                            icon: 'fad fa-cog',
                            callback: () => {
                                setShowCreditsModal(true)
                            }
                        },
                        {
                            label: 'Game Launcher',
                            icon: 'fad fa-cog',
                            callback: () => {
                                window.location.href = 'https://games.articles.media';
                            }
                        }
                    ]}
                    onFinish={(event) => {
                        console.log("Event", event)
                        if (event.callback) {
                            event.callback()
                        }
                    }}
                />
            </Suspense>
            <PageTemplateLandingPage
                useSocketStore={useSocketStore}
                useStore={useStore}
                // RotatingMascot={RotatingMascot}
                Link={Link}
                logoImage={`img/icon.png`}
                LandingBackgroundAnimation={
                    <LandingBackgroundAnimation />
                }
                heroOverride={<>
                    <div className='hero'>

                        <div
                            className='d-flex justify-content-center mb-0'
                        >
                            <img className='hero-icon' src={"/img/icon.png"}></img>
                        </div>

                        <div className='hero-title stick-regular'>
                            {process.env.NEXT_PUBLIC_GAME_NAME}
                        </div>

                    </div>
                </>}
                PostHeroContent={
                    <>
                        {maxDistanceTraveled ?
                            <div
                                className='mb-3'
                            >
                                <ScoreCard />
                            </div>
                            :
                            null
                        }
                    </>
                }
                NicknameInputConfig={{
                    PreComponent:
                        <>
                            <img
                                className='panel-bg me-2'
                                src="img/icon.png"
                                width={70}
                                height={70}
                            />
                        </>
                }}
                backgroundImage={
                    toontownMode ?
                        darkMode ?
                            `/img/background.webp`
                            :
                            `/img/background.webp`
                        :
                        darkMode ?
                            `/img/background.webp`
                            :
                            `/img/background.webp`
                }
                singlePlayerConfig={{

                }}
                multiplayerConfig={{
                    type: "WebSocket",
                    comingSoon: true,
                    defaultServers: 2,
                    privateServerSupport: false,
                    onlinePlayersTemplate: "2.0",
                }}
            // brandingTextClass="jaro-primary"
            // disableGameScoreboard={true}
            />
        </>
    );
}
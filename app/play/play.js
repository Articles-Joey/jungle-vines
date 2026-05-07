"use client"
import { useEffect, useContext, useState, useRef, useMemo } from 'react';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic'


import useFullscreen from '@articles-media/articles-dev-box/useFullscreen';

import LeftPanelContent from '@/components/Game/LeftPanel';
import { useSocketStore } from '@/hooks/useSocketStore';
import { useGameStore } from '@/hooks/useGameStore';
import { useStore } from '@/hooks/useStore';
import classNames from 'classnames';

import GameMenu from '@articles-media/articles-dev-box/GameMenu';
import { useHotkeys } from 'react-hotkeys-hook';

const GameCanvas = dynamic(() => import('@/components/Game/GameCanvas'), {
    ssr: false,
});

export default function GamePage() {

    const {
        socket,
        connected
    } = useSocketStore(state => ({
        socket: state.socket,
        connected: state.connected
    }));

    // const router = useRouter()
    // const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { server } = params

    // const showMenu = useStore(state => state.showMenu)
    const sceneKey = useStore(state => state.sceneKey)
    const showMenu = useStore(state => state.showMenu)
    const sidebar = useStore(state => state.sidebar)
    const nickname = useStore(state => state.nickname)
    const reloadScene = useStore(state => state.reloadScene)

    useHotkeys('r', () => {
        reloadScene();
    }, []);

    // const { controllerState, setControllerState } = useControllerStore()
    // const [showControllerState, setShowControllerState] = useState(false)

    // const [ cameraMode, setCameraMode ] = useState('Player')

    // const [players, setPlayers] = useState([])

    useEffect(() => {

        if (server && socket.connected) {
            socket.emit('join-room', `game:cannon-room-${server}`, {
                game_id: server,
                nickname: nickname,
                client_version: '1',

            });
        }

        // return function cleanup() {
        //     socket.emit('leave-room', 'game:glass-ceiling-landing')
        // };

    }, [server, connected, nickname]);

    // const [showMenu, setShowMenu] = useState(false)

    // const [touchControlsEnabled, setTouchControlsEnabled] = useLocalStorageNew("game:touchControlsEnabled", false)

    // const [sceneKey, setSceneKey] = useState(0);

    // const [gameState, setGameState] = useState(false)

    const setPlayerDisabled = useGameStore(state => state.setPlayerDisabled)

    // Function to handle scene reload
    // const reloadScene = () => {
    //     setSceneKey((prevKey) => prevKey + 1);
    //     setPlayerDisabled(false);
    // };

    // const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    return (

        <div
            className={classNames(
                `${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`,
                {
                    'menu-open': showMenu,
                    'fullscreen': useFullscreen().isFullscreen,
                    'show-sidebar': sidebar,
                }
            )}
            id={`${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`}
        >

            <GameMenu
                useStore={useStore}
                LeftPanelContent={LeftPanelContent}
                menuBarConfig={{
                    style: "Corner Button",
                    menuBarButtonPosition: "Left"
                }}
                sidebarConfig={{
                    style: "Static Panel",
                }}
            />

            <div className='canvas-wrap'>

                <GameCanvas
                    key={sceneKey}
                />

            </div>

        </div>
    );
}
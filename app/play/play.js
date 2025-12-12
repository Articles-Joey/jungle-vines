"use client"
import { useEffect, useContext, useState, useRef, useMemo } from 'react';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic'
import Script from 'next/script'

// import { useSelector, useDispatch } from 'react-redux'

// import ROUTES from '@/components/constants/routes';

import ArticlesButton from '@/components/UI/Button';

import useFullscreen from '@/hooks/useFullScreen';
import { useControllerStore } from '@/hooks/useControllerStore';
// import ControllerPreview from '@/components/Games/ControllerPreview';
// import { useGameStore } from '@/components/Games/Ocean Rings/hooks/useGameStore';
// import { Dropdown, DropdownButton } from 'react-bootstrap';
// import TouchControls from 'app/(site)/community/games/glass-ceiling/components/UI/TouchControls';
import { useLocalStorageNew } from '@/hooks/useLocalStorageNew';
import LeftPanelContent from '@/components/Game/LeftPanel';
import { useSocketStore } from '@/hooks/useSocketStore';
import { useGameStore } from '@/hooks/useGameStore';

const GameCanvas = dynamic(() => import('@/components/Game/GameCanvas'), {
    ssr: false,
});

export default function GamePage() {

    const {
        socket
    } = useSocketStore(state => ({
        socket: state.socket
    }));

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { server } = params

    const { controllerState, setControllerState } = useControllerStore()
    const [showControllerState, setShowControllerState] = useState(false)

    // const [ cameraMode, setCameraMode ] = useState('Player')

    const [players, setPlayers] = useState([])

    useEffect(() => {

        if (server && socket.connected) {
            socket.emit('join-room', `game:cannon-room-${server}`, {
                game_id: server,
                nickname: JSON.parse(localStorage.getItem('game:nickname')),
                client_version: '1',

            });
        }

        // return function cleanup() {
        //     socket.emit('leave-room', 'game:glass-ceiling-landing')
        // };

    }, [server, socket.connected]);

    const [showMenu, setShowMenu] = useState(false)

    const [touchControlsEnabled, setTouchControlsEnabled] = useLocalStorageNew("game:touchControlsEnabled", false)

    const [sceneKey, setSceneKey] = useState(0);

    const [gameState, setGameState] = useState(false)

    const setPlayerDisabled = useGameStore(state => state.setPlayerDisabled)

    // Function to handle scene reload
    const reloadScene = () => {
        setSceneKey((prevKey) => prevKey + 1);
        setPlayerDisabled(false);
    };

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    let panelProps = {
        server,
        players,
        touchControlsEnabled,
        setTouchControlsEnabled,
        reloadScene,
        // controllerState,
        isFullscreen,
        requestFullscreen,
        exitFullscreen,
        setShowMenu
    }

    const game_name = 'Jungle Vines'
    const game_key = 'jungle-vines'

    return (

        <div
            className={`jungle-vines-game-page ${isFullscreen && 'fullscreen'}`}
            id="jungle-vines-game-page"
        >

            <div className="menu-bar card card-articles p-1 justify-content-center">

                <div className='flex-header align-items-center'>

                    <div>
                        <ArticlesButton
                            small
                            active={showMenu}
                            onClick={() => {
                                setShowMenu(prev => !prev)
                            }}
                        >
                            <i className="fad fa-bars"></i>
                            <span>Menu</span>
                        </ArticlesButton>
                        <ArticlesButton
                            small
                            className="px-4"
                            // active={showMenu}
                            onClick={() => {

                            }}
                        >
                            <i className="fad fa-arrow-up"></i>
                            Jump
                        </ArticlesButton>
                    </div>

                    <div>

                        <ArticlesButton
                            small
                            // onMouseDown={() => handleHoldStart("left")}
                            // onMouseUp={handleHoldEnd}
                            // onMouseLeave={handleHoldEnd}
                        >
                            <i className="fad fa-arrow-left me-0 px-3"></i>
                        </ArticlesButton>

                        <ArticlesButton
                            small
                            // onMouseDown={() => handleHoldStart("right")}
                            // onMouseUp={handleHoldEnd}
                            // onMouseLeave={handleHoldEnd}
                        >
                            <i className="fad fa-arrow-right me-0 px-3"></i>
                        </ArticlesButton>

                    </div>

                </div>

            </div>

            <div className={`mobile-menu ${showMenu && 'show'}`}>
                <LeftPanelContent
                    {...panelProps}
                />
            </div>

            {/* <TouchControls
                touchControlsEnabled={touchControlsEnabled}
            /> */}

            <div className='panel-left card rounded-0 d-none d-lg-flex'>

                <LeftPanelContent
                    {...panelProps}
                />

            </div>

            {/* <div className='game-info'>
                <div className="card card-articles card-sm">
                    <div className="card-body">
                        <pre> 
                            {JSON.stringify(playerData, undefined, 2)}
                        </pre>
                    </div>
                </div>
            </div> */}

            <div className='canvas-wrap'>

                <GameCanvas
                    key={sceneKey}
                    gameState={gameState}
                    // playerData={playerData}
                    // setPlayerData={setPlayerData}
                    players={players}
                />

            </div>

        </div>
    );
}
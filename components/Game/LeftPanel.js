import Link from "next/link";

// import ROUTES from '@/components/constants/routes';
// import { useGameStore } from "../hooks/useGameStore";
import ArticlesButton from "@/components/UI/Button";

// import ControllerPreview from "../../ControllerPreview";

import { useSocketStore } from "@/hooks/useSocketStore";
import { useStore } from "@/hooks/useStore";
import ScoreCard from "../UI/ScoreCard";
import { Dropdown } from "react-bootstrap";
// import { useIceSlideStore } from "./hooks/useIceSlideStore";
// import { useEffect, useRef } from "react";
// import { useHotkeys } from "react-hotkeys-hook";

export default function LeftPanelContent(props) {

    const {
        server,
        // players,
        touchControlsEnabled,
        setTouchControlsEnabled,
        reloadScene,
        controllerState,
        isFullscreen,
        requestFullscreen,
        exitFullscreen,
        setShowMenu
    } = props;

    // const {
    //     hitRotation,
    //     setHitRotation,
    //     hitPower,
    //     setHitPower
    // } = useIceSlideStore(state => ({
    //     hitRotation: state.hitRotation,
    //     setHitRotation: state.setHitRotation,
    //     hitPower: state.hitPower,
    //     setHitPower: state.setHitPower,
    // }));

    const {
        socket,
    } = useSocketStore(state => ({
        socket: state.socket,
    }));

    const darkMode = useStore((state) => state.darkMode);
    const toggleDarkMode = useStore((state) => state.toggleDarkMode);
    const setShowSettingsModal = useStore((state) => state.setShowSettingsModal);
    const debugMode = useStore((state) => state.debugMode);
    const setDebugMode = useStore((state) => state.setDebugMode);
    const cameraControlMethod = useStore((state) => state.cameraControlMethod);
    const setCameraControlMethod = useStore((state) => state.setCameraControlMethod);

    return (
        <div className='w-100'>

            <div className="card card-articles card-sm">

                <div className="card-body">

                    <div className='flex-header'>
                        <div>Server: {server}</div>
                        <div>Players: {0}/4</div>
                    </div>

                    {!socket?.connected &&
                        <div
                            className=""
                        >

                            <div className="">

                                <div className="h6 mb-1">Not connected</div>

                                <ArticlesButton
                                    onClick={() => {
                                        console.log("Reconnect")
                                        socket.connect()
                                    }}
                                    className="w-100 mb-3"
                                    size="sm"
                                >
                                    Reconnect!
                                </ArticlesButton>

                            </div>

                        </div>
                    }

                    <Link
                        href={'/'}
                        className=""
                    >
                        <ArticlesButton
                            className='w-50'
                            small
                        >
                            <i className="fad fa-arrow-alt-square-left"></i>
                            <span>Leave Game</span>
                        </ArticlesButton>
                    </Link>

                    <ArticlesButton
                        small
                        className="w-50"
                        active={isFullscreen}
                        onClick={() => {
                            if (isFullscreen) {
                                exitFullscreen()
                            } else {
                                requestFullscreen('jungle-vines-game-page')
                            }
                        }}
                    >
                        {isFullscreen && <span>Exit </span>}
                        {!isFullscreen && <span><i className='fad fa-expand'></i></span>}
                        <span>Fullscreen</span>
                    </ArticlesButton>

                    <ArticlesButton
                        className='w-50'
                        small
                        active={darkMode}
                        onClick={() => {
                            toggleDarkMode()
                        }}
                    >
                        <i className="fad fa-sun"></i>
                        <span>Dark Mode</span>
                    </ArticlesButton>

                    <ArticlesButton
                        className='w-50'
                        small
                        // active={darkMode}
                        onClick={() => {
                            setShowSettingsModal(true)
                        }}
                    >
                        <i className="fad fa-cog"></i>
                        <span>Settings</span>
                    </ArticlesButton>

                    <Dropdown>
                        <Dropdown.Toggle variant="articles" className="w-50" id="dropdown-basic">
                            Camera
                        </Dropdown.Toggle>

                        <Dropdown.Menu>

                            <div className="p-2 border">
                                Camera: {cameraControlMethod}
                            </div>

                            {[
                                'Side Scroll', 'First Person', 'Third Person', 'Orbit'
                            ].map((item, index) => (
                                <Dropdown.Item
                                    onClick={() => {
                                        setCameraControlMethod(item)
                                    }
                                    }
                                    key={index}
                                >
                                    {item}
                                </Dropdown.Item>
                            ))}

                        </Dropdown.Menu>
                    </Dropdown>

                </div>
            </div>

            {/* <div
                className="card card-articles card-sm"
            >
                <div className="card-body d-flex justify-content-between">

                    <div>
                        <div className="small text-muted">playerData</div>
                        <div className="small">
                            <div>X: {playerLocation?.x}</div>
                            <div>Y: {playerLocation?.y}</div>
                            <div>Z: {playerLocation?.z}</div>
                            <div>Shift: {shift ? 'True' : 'False'}</div>
                            <div>Score: 0</div>
                        </div>
                    </div>

                    <div>
                        <div className="small text-muted">maxHeight</div>
                        <div>Y: {maxHeight}</div>
                        <ArticlesButton
                            small
                            onClick={() => {
                                setMaxHeight(playerLocation?.y)
                            }}
                        >
                            Reset
                        </ArticlesButton>
                    </div>

                </div>
            </div> */}

            {/* Score */}
            <ScoreCard />

            {/* Touch Controls */}
            <div
                className="card card-articles card-sm"
            >
                <div className="card-body">

                    <div className="small text-muted">Touch Controls</div>

                    <div className='d-flex flex-column'>

                        <div>
                            <ArticlesButton
                                size="sm"
                                className="w-50"
                                active={!touchControlsEnabled}
                                onClick={() => {
                                    setTouchControlsEnabled(false)
                                }}
                            >
                                <i className="fad fa-redo"></i>
                                Off
                            </ArticlesButton>

                            <ArticlesButton
                                size="sm"
                                className="w-50"
                                active={touchControlsEnabled}
                                onClick={() => {
                                    setTouchControlsEnabled(true)
                                }}
                            >
                                <i className="fad fa-redo"></i>
                                On
                            </ArticlesButton>
                        </div>

                    </div>

                </div>
            </div>

            {/* Debug Controls */}
            <div
                className="card card-articles card-sm"
            >
                <div className="card-body">

                    <div className="small text-muted">Debug Controls</div>

                    <div className="small border p-2">
                        {/* <div>Rotation Angle: {hitRotation}</div> */}
                        {/* <div>Power: {hitPower}/100</div> */}
                    </div>

                    <div className='d-flex flex-column'>

                        <div>

                            <ArticlesButton
                                size="sm"
                                className="w-50"
                                onClick={reloadScene}
                            >
                                <i className="fad fa-redo"></i>
                                Reload Game
                            </ArticlesButton>

                            <ArticlesButton
                                size="sm"
                                className="w-50"
                                onClick={reloadScene}
                            >
                                <i className="fad fa-redo"></i>
                                Reset Camera
                            </ArticlesButton>

                            <ArticlesButton
                                size="sm"
                                className="w-50"
                                active={debugMode}
                                onClick={() => {
                                    setDebugMode(!debugMode)
                                }}
                            >
                                <i className="fad fa-code"></i>
                                Debug Mode
                            </ArticlesButton>

                        </div>

                    </div>

                </div>
            </div>

            {controllerState?.connected &&
                <div className="panel-content-group p-0 text-dark">

                    <div className="p-1 border-bottom border-dark">
                        <div className="fw-bold" style={{ fontSize: '0.7rem' }}>
                            {controllerState?.id}
                        </div>
                    </div>

                    <div className='p-1'>
                        <ArticlesButton
                            small
                            className="w-100"
                            active={showControllerState}
                            onClick={() => {
                                setShowControllerState(prev => !prev)
                            }}
                        >
                            {showControllerState ? 'Hide' : 'Show'} Controller Preview
                        </ArticlesButton>
                    </div>

                    {/* {showControllerState && <div className='p-3'>

                        <ControllerPreview
                            controllerState={controllerState}
                            showJSON={true}
                            showVibrationControls={true}
                            maxHeight={300}
                            showPreview={true}
                        />
                    </div>} */}

                </div>
            }

        </div>
    )

}
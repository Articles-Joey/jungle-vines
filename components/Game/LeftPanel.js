import Link from "next/link";

import ArticlesButton from "@/components/UI/Button";

import { useSocketStore } from "@/hooks/useSocketStore";
import { useStore } from "@/hooks/useStore";
import ScoreCard from "../UI/ScoreCard";
import { Dropdown } from "react-bootstrap";

import GameMenuPrimaryButtonGroup from '@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup';
import DebugPanel from "../UI/DebugPanel";
import { useRouter } from "next/navigation";

export default function LeftPanelContent(props) {

    const {
        socket,
        connected
    } = useSocketStore(state => ({
        socket: state.socket,
        connected: state.connected
    }));

    const debug = useStore(state => state.debug);

    const cameraControlMethod = useStore((state) => state.cameraControlMethod);
    const setCameraControlMethod = useStore((state) => state.setCameraControlMethod);

    return (
        <div className='w-100'>

            <div className="card card-articles card-sm">

                <div className="card-body">

                    <div className="d-flex flex-wrap mb-3">
                        <GameMenuPrimaryButtonGroup
                            useStore={useStore}
                            type="GameMenu"
                            useRouter={useRouter}
                        />
                    </div>

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
            {/* <div
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
            </div> */}

            {/* Debug Controls */}
            {debug && <DebugPanel />}

        </div>
    )

}
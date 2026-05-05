import { createContext, createRef, forwardRef, memo, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Sky, useDetectGPU, useTexture, OrbitControls, Cylinder, QuadraticBezierLine, Text, Image } from "@react-three/drei";

import { NearestFilter, RepeatWrapping, TextureLoader, Vector3 } from "three";

import { Debug, Physics, useBox, useCylinder, useSphere } from "@react-three/cannon";
import { degToRad } from "three/src/math/MathUtils";

// import { Model as ModelKingMen } from "@/components/Games/Assets/Quaternius/men/King";
import Player from "./Player";
import WaterPlane from "./WaterPlane";
import { ModelQuaterniusFishingPiranha } from "@/components/Models/Piranha";
import { ModelQuaterniusFishingShark } from "@/components/Models/Shark";
import FlyingEnemy from "./FlyingEnemy";
import RopeSwing from "./RopeSwing";
import Platform from "./Platform";
import MovingPlatform from "./MovingPlatform";
import { ModelFly } from "../Models/Fly";
import { ModelSpider } from "../Models/Spider";
import BobbingSharkField from "./BobbingSharkField";
import ProcedurallyGeneratedMapElements from "./ProcedurallyGeneratedMapElements";
import { useStore } from "@/hooks/useStore";
import BobbingCrocodileField from "./BobbingCrocodileField";

function GameCanvas(props) {

    const [[a, b, c, d, e]] = useState(() => [...Array(5)].map(createRef))

    const debug = useStore(state => state.debug);
    const showStats = useStore(state => state.showStats);
    const darkMode = useStore(state => state.darkMode);
    const toontownMode = useStore(state => state.toontownMode);

    return (
        <Canvas camera={{ position: [0, 10, 30], fov: 50 }}>

            {showStats && <>
                <Stats className="stats-overlay" />
            </>}

            <OrbitControls
            // autoRotate={gameState?.status == 'In Lobby'}
            />

            {darkMode ?
                <>
                    <ambientLight intensity={3} />
                    <Sky
                        sunPosition={[0, -10, 0]}
                        // intensity={0.1}
                    />
                </>
                :
                <>
                    <ambientLight intensity={3} />
                    <Sky
                        sunPosition={[0, 10, 0]}
                    />
                </>
            }

            {/* <spotLight intensity={30000} position={[0, -10, 0]} angle={5} penumbra={1} /> */}

            {/* <Image
                url={`${process.env.NEXT_PUBLIC_CDN}games/Jungle Vines/jungle-vines-game-background.svg`}
                scale={[100, 50]}
                position={[0, 10, -40]}
            /> */}

            {[...Array(9)].map((_, i) => (
                <Image
                    key={i}
                    url={toontownMode ? `img/toon-background.png` : `img/background.webp`}
                    scale={[50, 50]}
                    position={[(-100 + (i * 50)), 10, -40]}
                    color={darkMode ? "#888888" : "white"}
                />
            ))}

            {/* <pointLight position={[-10, -10, -10]} /> */}

            {/* <FlatRing
                args={[3, 5, 32]}
                color={"gold"}
            />

            <FlatRing
                args={[6, 8, 32]}
                color={"white"}
            /> */}

            {/* <Rocks /> */}

            {/* <ModelGoogleIglooOpen
                position={[100, 30, 0]}
                scale={3}
                rotation={[0, degToRad(-55), 0]}
            />

            <ModelKennyNLMiniGolfFlagRed
                position={[100, 30, 10]}
                scale={10}
                rotation={[0, degToRad(-90), 0]}
            /> */}

            <WaterPlane
                position={[0, -15, 0]}
            />

            {/* <ModelQuaterniusFishingShark
                position={[10, -15, 0]}
                scale={2}
                rotation={[0, degToRad(-90), 0]}
            /> */}

            <BobbingSharkField
                count={10}
                range={[100, 0, -100]}
                basePosition={[0, -15, 0]}
            />

            <BobbingCrocodileField
                count={10}
                range={[100, 0, -100]}
                basePosition={[0, -17, 0]}
            />

            {/* <ModelFly
                position={[0, 10, 0]}
                rotation={[0, degToRad(-90), 0]}
                
            /> */}

            {/* <ModelSpider
                scale={1}
                // position={[0, 10, 0]}
            /> */}
            {/* <ModelSpider
                scale={1}
                // position={[20, 10, 0]}
            /> */}

            <Physics>

                <Debug
                    scale={debug ? 1 : 0}
                >

                    <ProcedurallyGeneratedMapElements
                        seed={12345}
                        count={20}
                        range={[200, 10]}
                        startPosition={[3, 10, 0]}
                    />

                    <MovingPlatform
                        position={[-20, 5, 0]}
                        args={[5, 1, 5]}
                        range={5}
                        speed={1}
                    />

                    <Platform
                        position={[-10, -1, 0]}
                        args={[25, 1, 2.5]}
                        color={"saddlebrown"}
                    />

                    <Platform
                        position={[-10, 0, 0]}
                        args={[25, 1, 2.5]}
                        color={"green"}
                    />

                    <Player />

                    {/* <ModelKingMen
                    scale={3}
                    rotation={[0, degToRad(90), 0]}
                    position={[0, 0.5, 0]}
                /> */}

                    {/* <>
                        <RopeSwing
                            position={[
                                10,
                                10,
                                0
                            ]}
                            args={[0.1, 0.1, 15, 8]}
                        />
    
                        <RopeSwing
                            position={[
                                20,
                                10,
                                0
                            ]}
                            args={[0.1, 0.1, 15, 8]}
                        />
    
                        <RopeSwing
                            position={[
                                30,
                                10,
                                0
                            ]}
                            args={[0.1, 0.1, 15, 8]}
                        />
                    </> */}

                    <Platform
                        position={[50, -1, 0]}
                        args={[25, 1, 2.5]}
                        color={"saddlebrown"}
                    />

                    <Platform
                        position={[50, 0, 0]}
                        args={[25, 1, 2.5]}
                        color={"green"}
                    />

                    <RopeSwing
                        position={[
                            70,
                            10,
                            0
                        ]}
                        args={[0.1, 0.1, 15, 8]}
                    />

                    <RopeSwing
                        position={[
                            80,
                            10,
                            0
                        ]}
                        args={[0.1, 0.1, 15, 8]}
                    />

                    <RopeSwing
                        position={[
                            90,
                            10,
                            0
                        ]}
                        args={[0.1, 0.1, 15, 8]}
                    />

                    <FlyingEnemy

                    />

                    <MovingPlatform
                        position={[100, 5, 0]}
                        args={[5, 1, 5]}
                        range={5}
                        speed={1}
                    />

                    <Platform
                        position={[225, -1, 0]}
                        args={[25, 1, 2.5]}
                        color={"saddlebrown"}
                    />

                    <Platform
                        position={[225, 0, 0]}
                        args={[25, 1, 2.5]}
                        color={"green"}
                    />

                </Debug>

            </Physics>

        </Canvas>
    )
}

export default memo(GameCanvas)
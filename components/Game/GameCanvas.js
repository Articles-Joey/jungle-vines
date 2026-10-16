import { memo, Suspense, useEffect, useRef } from "react";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Stats, Image } from "@react-three/drei";

import { Physics } from "@react-three/rapier";

import Player from "./Player";
import WaterPlane from "./WaterPlane";
import TerrainBank from "./TerrainBank";
import SceneLighting from "./SceneLighting";

import FlyingEnemy from "./FlyingEnemy";
import RopeSwing from "./RopeSwing";
import Platform from "./Platform";
import MovingPlatform from "./MovingPlatform";

import BobbingSharkField from "./BobbingSharkField";
import ProcedurallyGeneratedMapElements from "./ProcedurallyGeneratedMapElements";
import { useStore } from "@/hooks/useStore";
import { useGameStore } from "@/hooks/useGameStore";
import BobbingCrocodileField from "./BobbingCrocodileField";

const INITIAL_CAMERA_POSITION = [0, 10, 30];

function GameCameraControls({ landingAnimationMode }) {
    const controlsRef = useRef(null);
    const { camera, invalidate } = useThree();
    const cameraControlMethod = useStore((state) => state.cameraControlMethod);
    const cameraMode = useGameStore((state) => state.cameraMode);
    const resetRequest = useGameStore((state) => state.cameraResetRequest);
    const handledReset = useRef(resetRequest);

    useEffect(() => {
        const controls = controlsRef.current;
        if (!controls || handledReset.current === resetRequest) return;
        handledReset.current = resetRequest;

        // Clear pending pan/rotation inertia before restoring the starting view.
        const damping = controls.enableDamping;
        controls.enableDamping = false;
        controls.update();
        controls.position0.fromArray(INITIAL_CAMERA_POSITION);
        controls.target0.set(0, 0, 0);
        controls.zoom0 = 1;
        controls.reset();
        controls.enableDamping = damping;
        camera.updateMatrixWorld();
        invalidate();
    }, [resetRequest, camera, invalidate]);

    return (
        <OrbitControls
            ref={controlsRef}
            makeDefault
            enabled={
                landingAnimationMode ||
                cameraControlMethod === "Orbit" ||
                cameraMode !== "Player"
            }
        />
    );
}

function GameCanvas({ landingAnimationMode = false }) {
    const showStats = useStore((state) => state?.debugConfig?.showStats);
    const showPhysicsDebug = useStore(
        (state) => state?.debugConfig?.showPhysicsDebug,
    );
    const darkMode = useStore((state) => state.darkMode);
    const toontownMode = useStore((state) => state.toontownMode);
    const seed = useStore((state) => state.seed);

    return (
        <Canvas
            shadows="percentage"
            camera={{ position: INITIAL_CAMERA_POSITION, fov: 50 }}
        >
            {showStats && (
                <>
                    <Stats className="stats-overlay" />
                </>
            )}

            <GameCameraControls landingAnimationMode={landingAnimationMode} />

            <SceneLighting />

            {/* <Image
                url={`${process.env.NEXT_PUBLIC_CDN}games/Jungle Vines/jungle-vines-game-background.svg`}
                scale={[100, 50]}
                position={[0, 10, -40]}
            /> */}

            {/* Overlap tile edges and stagger their depth to avoid gaps and flicker. */}
            {[...Array(9)].map((_, i) => (
                <Image
                    key={i}
                    url={
                        toontownMode
                            ? `img/toon-background.png`
                            : `img/background.webp`
                    }
                    scale={[75.2, 75]}
                    position={[-100 + i * 75, 19, -40 - i * 0.02]}
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

            <WaterPlane position={[0, -15, 0]} />
            <TerrainBank
                position={[-125, -15, -50]}
                width={450}
                seed={seed}
            />

            {/* <ModelQuaterniusFishingShark
                position={[10, -15, 0]}
                scale={2}
                rotation={[0, degToRad(-90), 0]}
            /> */}

            <BobbingSharkField
                count={10}
                range={[100, 0, -60]}
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

            <Suspense fallback={null}>
                <Physics
                    gravity={[0, -9.81, 0]}
                    debug={showPhysicsDebug}
                    colliders={false}
                >
                    <ProcedurallyGeneratedMapElements
                        seed={12345}
                        count={20}
                        range={[200, 10]}
                        startPosition={[3, 10, 0]}
                    />

                    {/* <MovingPlatform
                        position={[-20, 5, 0]}
                        args={[5, 1, 5]}
                        range={5}
                        speed={1}
                    /> */}

                    <Platform
                        position={[-10, -1, 0]}
                        args={[25, 1, 2.5]}
                        surface="dirt"
                    />

                    <Platform
                        position={[-10, 0, 0]}
                        args={[25, 1, 2.5]}
                        surface="grass"
                    />

                    {!landingAnimationMode && <Player />}

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
                        surface="dirt"
                    />

                    <Platform
                        position={[50, 0, 0]}
                        args={[25, 1, 2.5]}
                        surface="grass"
                    />

                    <RopeSwing
                        position={[70, 20, 0]}
                        args={[0.1, 0.1, 25, 8]}
                    />

                    <RopeSwing
                        position={[80, 17, 0]}
                        args={[0.1, 0.1, 21, 8]}
                    />

                    <RopeSwing
                        position={[90, 22, 0]}
                        args={[0.1, 0.1, 29, 8]}
                    />

                    <FlyingEnemy />

                    <MovingPlatform
                        position={[100, 5, 0]}
                        args={[5, 1, 5]}
                        range={5}
                        speed={1}
                    />

                    <Platform
                        position={[225, -1, 0]}
                        args={[25, 1, 2.5]}
                        surface="dirt"
                    />

                    <Platform
                        position={[225, 0, 0]}
                        args={[25, 1, 2.5]}
                        surface="grass"
                    />
                </Physics>
            </Suspense>
        </Canvas>
    );
}

export default memo(GameCanvas);

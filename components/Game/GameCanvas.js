import { memo, Suspense, useEffect, useLayoutEffect, useRef } from "react";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Stats, Image } from "@react-three/drei";

import { Physics, useBeforePhysicsStep } from "@react-three/rapier";

import Player from "./Player";
import WaterPlane from "./WaterPlane";
import TerrainBank from "./TerrainBank";
import SceneLighting from "./SceneLighting";

import FlyingEnemy from "./FlyingEnemy";

import WildlifeField from "./WildlifeField";
import DebugTeleport from "./DebugTeleport";
import CourseMap from "./CourseMap";
import { CHUNK_LENGTH, MAP_CONFIG } from "./mapLayout";
import { GRAVITY } from "./movementConfig";
import { useStore } from "@/hooks/useStore";
import { useGameStore } from "@/hooks/useGameStore";
import { useKeyboard } from "@/hooks/useKeyboard";

const INITIAL_CAMERA_POSITION = [0, 10, 30];

function GameCameraControls({ landingAnimationMode }) {
    const controlsRef = useRef(null);
    const { camera, invalidate } = useThree();
    const cameraControlMethod = useStore((state) => state.cameraControlMethod);
    const cameraMode = useGameStore((state) => state.cameraMode);
    const resetRequest = useGameStore((state) => state.cameraResetRequest);
    const handledReset = useRef(resetRequest);
    const originX = useGameStore((state) => state.originX);
    const runId = useGameStore((state) => state.runId);
    const previousOrigin = useRef(originX);
    const previousRun = useRef(runId);

    useLayoutEffect(() => {
        const shift = originX - previousOrigin.current;
        if (!landingAnimationMode && shift && previousRun.current === runId) {
            camera.position.x -= shift;
            if (controlsRef.current) controlsRef.current.target.x -= shift;
            camera.updateMatrixWorld();
        }
        previousOrigin.current = originX;
    }, [originX, runId, camera, landingAnimationMode]);

    useEffect(() => {
        const controls = controlsRef.current;
        if (
            !controls ||
            (handledReset.current === resetRequest &&
                previousRun.current === runId)
        )
            return;
        handledReset.current = resetRequest;
        previousRun.current = runId;

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
    }, [resetRequest, runId, camera, invalidate]);

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

function SimulationClock() {
    useBeforePhysicsStep((world) => {
        const state = useGameStore.getState();
        if (state.runStatus === "playing")
            state.simulationClock.elapsed += world.timestep;
    });
    return null;
}

function CourseEnvironment({ mode, seed, activeChunk, originX }) {
    const darkMode = useStore((state) => state.darkMode);
    const toontownMode = useStore((state) => state.toontownMode);
    const first = mode === "endless" ? activeChunk - 3 : -2;
    const last =
        mode === "endless" ? activeChunk + 4 : MAP_CONFIG[mode].chunks + 2;
    const firstTile = Math.floor((first * CHUNK_LENGTH) / 75);
    const lastTile = Math.ceil((last * CHUNK_LENGTH) / 75);
    const center =
        mode === "endless"
            ? activeChunk * CHUNK_LENGTH - originX
            : (MAP_CONFIG[mode].chunks * CHUNK_LENGTH) / 2;
    return (
        <>
            {Array.from({ length: lastTile - firstTile + 1 }, (_, offset) => {
                const tile = firstTile + offset;
                return (
                    <Image
                        key={tile}
                        url={
                            toontownMode
                                ? "/img/toon-background.png"
                                : "/img/background.webp"
                        }
                        scale={[75.2, 75]}
                        position={[
                            tile * 75 - originX,
                            19,
                            -40 - (tile % 2) * 0.02,
                        ]}
                        color={darkMode ? "#888888" : "white"}
                    />
                );
            })}
            {Array.from({ length: last - first + 1 }, (_, offset) => {
                const index = first + offset;
                return (
                    <TerrainBank
                        key={index}
                        position={[index * CHUNK_LENGTH - originX, -15, -50]}
                        width={CHUNK_LENGTH}
                        sectionWidth={CHUNK_LENGTH}
                        worldOffsetX={index * CHUNK_LENGTH}
                        seed={seed}
                    />
                );
            })}
            <WaterPlane position={[center, -15, 0]} />
            <WildlifeField
                seed={seed}
                worldCenter={center + originX}
                originX={originX}
            />
        </>
    );
}

function GameWorld({ landingAnimationMode }) {
    // Keep held keys alive when the physics world is recentered in endless mode.
    const keyboard = useKeyboard(!landingAnimationMode);
    const selectedMode = useStore((state) => state.gameMode);
    const selectedSeed = useStore((state) => state.seed);
    const runMode = useGameStore((state) => state.runMode);
    const runSeed = useGameStore((state) => state.runSeed);
    const runId = useGameStore((state) => state.runId);
    const runStatus = useGameStore((state) => state.runStatus);
    const teleportPicking = useGameStore((state) => state.teleportPicking);
    const debug = useStore((state) => state.debug);
    const runOrigin = useGameStore((state) => state.originX);
    const playerChunk = useGameStore((state) =>
        Math.max(
            0,
            Math.floor(
                (state.originX + (state.playerLocation?.x ?? 0)) / CHUNK_LENGTH,
            ),
        ),
    );
    const showPhysicsDebug = useStore(
        (state) => state.debugConfig?.showPhysicsDebug,
    );
    const mode = (landingAnimationMode ? selectedMode : runMode) || "easy";
    const seed = landingAnimationMode ? selectedSeed : runSeed;
    const originX = landingAnimationMode ? 0 : runOrigin;
    const activeChunk = landingAnimationMode ? 0 : playerChunk;
    const config = MAP_CONFIG[mode];
    return (
        <DebugTeleport enabled={!landingAnimationMode && debug}>
            <CourseEnvironment
                mode={mode}
                seed={seed}
                activeChunk={activeChunk}
                originX={originX}
            />
            <Physics
                key={`${runId}:${originX}:${mode}`}
                gravity={[0, -GRAVITY, 0]}
                debug={showPhysicsDebug}
                colliders={false}
                paused={
                    !landingAnimationMode &&
                    (runStatus !== "playing" || teleportPicking)
                }
            >
                {!landingAnimationMode && <SimulationClock />}
                <CourseMap
                    mode={mode}
                    seed={seed}
                    activeChunk={activeChunk}
                    originX={originX}
                />
                {!landingAnimationMode && <Player controls={keyboard} />}
                {!landingAnimationMode &&
                    Array.from({ length: config.enemies }, (_, id) => (
                        <FlyingEnemy
                            key={id}
                            id={id}
                            speed={config.enemySpeed}
                            yRange={mode === "easy" ? [1, 8] : [-1, 15]}
                        />
                    ))}
            </Physics>
        </DebugTeleport>
    );
}

function GameCanvas({ landingAnimationMode = false }) {
    const showStats = useStore((state) => state.debugConfig?.showStats);
    return (
        <Canvas
            shadows="percentage"
            camera={{ position: INITIAL_CAMERA_POSITION, fov: 50 }}
        >
            {showStats && <Stats className="stats-overlay" />}
            <GameCameraControls landingAnimationMode={landingAnimationMode} />
            <SceneLighting />
            <Suspense fallback={null}>
                <GameWorld landingAnimationMode={landingAnimationMode} />
            </Suspense>
        </Canvas>
    );
}

export default memo(GameCanvas);

import { memo, useMemo } from "react";
import { Html } from "@react-three/drei";
import Platform from "./Platform";
import RopeSwing from "./RopeSwing";
import { CHUNK_LENGTH, createMapChunk, MAP_CONFIG } from "./mapLayout";

function RestPlatform({ x, width, finish = false, mode }) {
    const userData = useMemo(
        () => ({
            tag: finish ? "finish" : "rest",
            level: mode,
        }),
        [finish, mode],
    );
    return (
        <>
            <Platform
                position={[x, -1, 0]}
                args={[width, 1, 5]}
                surface="dirt"
                userData={{ teleportTopOffset: 1.5 }}
            />
            <Platform
                position={[x, 0, 0]}
                args={[width, 1, 5]}
                userData={userData}
            />
            {finish && (
                <group position={[x, 0.5, -2]}>
                    <mesh
                        position={[0, 3, 0]}
                        castShadow
                    >
                        <cylinderGeometry args={[0.12, 0.12, 6, 8]} />
                        <meshStandardMaterial color="#eee3b0" />
                    </mesh>
                    <mesh
                        position={[1.3, 5.2, 0]}
                        castShadow
                    >
                        <boxGeometry args={[2.6, 1.5, 0.08]} />
                        <meshStandardMaterial color="#8bdd64" />
                    </mesh>
                    <Html
                        position={[0, 7, 0]}
                        center
                        distanceFactor={30}
                        zIndexRange={[10, 0]}
                        style={{
                            color: "white",
                            fontWeight: 900,
                            textShadow: "0 2px 4px black",
                            pointerEvents: "none",
                        }}
                    >
                        FINISH
                    </Html>
                </group>
            )}
        </>
    );
}

const MapChunk = memo(function MapChunk({ mode, seed, index, originX }) {
    const chunk = useMemo(
        () => createMapChunk(mode, seed, index),
        [mode, seed, index],
    );
    return (
        <>
            <RestPlatform
                x={chunk.start - originX}
                width={chunk.platformWidth}
                mode={mode}
            />
            {chunk.ropes.map(({ position, length, ...rope }, index) => (
                <RopeSwing
                    key={index}
                    {...rope}
                    position={[position[0] - originX, position[1], position[2]]}
                    args={[0.1, 0.1, length, 8]}
                />
            ))}
        </>
    );
});

export default function CourseMap({
    mode,
    seed,
    activeChunk = 0,
    originX = 0,
}) {
    const config = MAP_CONFIG[mode];
    const first = mode === "endless" ? Math.max(0, activeChunk - 2) : 0;
    const last = mode === "endless" ? activeChunk + 3 : config.chunks - 1;
    return (
        <>
            {Array.from({ length: last - first + 1 }, (_, index) => (
                <MapChunk
                    key={first + index}
                    mode={mode}
                    seed={seed}
                    index={first + index}
                    originX={originX}
                />
            ))}
            {mode !== "endless" && (
                <RestPlatform
                    x={config.chunks * CHUNK_LENGTH}
                    width={config.platformWidth}
                    finish
                    mode={mode}
                />
            )}
        </>
    );
}

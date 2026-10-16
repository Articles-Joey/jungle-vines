import { useEffect, useMemo } from "react";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useStore } from "@/hooks/useStore";
import createPlatformMaterial from "./platformMaterial";
import PlatformGrass from "./PlatformGrass";

export default function Platform({
    args,
    position,
    surface = "grass",
    userData,
}) {
    const darkMode = useStore((state) => state.darkMode);
    const [width, height, depth] = args;
    const material = useMemo(
        () => createPlatformMaterial(surface, height, darkMode),
        [surface, height, darkMode],
    );
    useEffect(() => () => material.dispose(), [material]);

    return (
        <RigidBody
            type="fixed"
            position={position}
            colliders={false}
            userData={{
                ...userData,
                teleportPlatform: {
                    width,
                    top: userData?.teleportTopOffset ?? height / 2,
                },
            }}
        >
            <CuboidCollider args={args.map((size) => size / 2)} />
            <mesh
                castShadow
                receiveShadow
                material={material}
            >
                <boxGeometry args={args} />
            </mesh>
            {surface === "grass" && (
                <PlatformGrass
                    width={width}
                    depth={depth}
                    y={height / 2}
                />
            )}
        </RigidBody>
    );
}

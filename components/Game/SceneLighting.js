import { useFrame } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { Object3D, Vector3 } from "three";
import { useStore } from "@/hooks/useStore";
import { useGameStore } from "@/hooks/useGameStore";

export const SCENE_LIGHT_OFFSET = [-28, 45, 22];
const SHADOW_MAP_SIZE = 2048;
const SHADOW_EXTENT = 64;

export default function SceneLighting() {
    const darkMode = useStore((state) => state.darkMode);
    const light = useRef(null);
    const target = useMemo(() => new Object3D(), []);
    const scratch = useMemo(() => {
        const offset = new Vector3(...SCENE_LIGHT_OFFSET);
        const direction = offset.clone().normalize();
        const right = new Vector3()
            .crossVectors(new Vector3(0, 1, 0), direction)
            .normalize();
        return {
            offset,
            right,
            up: new Vector3().crossVectors(direction, right).normalize(),
            focus: new Vector3(),
        };
    }, []);

    useFrame(({ controls }) => {
        if (!light.current) return;
        const location = useGameStore.getState().playerLocation;
        if (controls?.enabled && controls.target) {
            scratch.focus.copy(controls.target);
        } else if (location) {
            scratch.focus.copy(location);
        } else {
            scratch.focus.set(0, 0, 0);
        }
        scratch.focus.y += 3;

        // Keep shadow detail near the active view instead of spreading one map
        // over the entire course. Snap in light space to reduce shadow crawling.
        const texel = (SHADOW_EXTENT * 2) / SHADOW_MAP_SIZE;
        const x = scratch.focus.dot(scratch.right);
        const y = scratch.focus.dot(scratch.up);
        scratch.focus.addScaledVector(
            scratch.right,
            Math.round(x / texel) * texel - x,
        );
        scratch.focus.addScaledVector(
            scratch.up,
            Math.round(y / texel) * texel - y,
        );
        target.position.copy(scratch.focus);
        light.current.position.copy(scratch.focus).add(scratch.offset);
    });

    return (
        <>
            <ambientLight intensity={darkMode ? 0.16 : 0.2} />
            <hemisphereLight
                args={[
                    darkMode ? "#8babe0" : "#c5e4ff",
                    darkMode ? "#182418" : "#443a25",
                    darkMode ? 0.7 : 1.1,
                ]}
            />
            <primitive object={target} />
            <directionalLight
                ref={light}
                target={target}
                position={SCENE_LIGHT_OFFSET}
                color={darkMode ? "#b6cbff" : "#fff2d6"}
                intensity={darkMode ? 1.65 : 3}
                castShadow
                shadow-mapSize={[SHADOW_MAP_SIZE, SHADOW_MAP_SIZE]}
                shadow-camera-left={-SHADOW_EXTENT}
                shadow-camera-right={SHADOW_EXTENT}
                shadow-camera-top={SHADOW_EXTENT}
                shadow-camera-bottom={-SHADOW_EXTENT}
                shadow-camera-near={0.5}
                shadow-camera-far={180}
                shadow-bias={-0.0001}
                shadow-normalBias={0.03}
                shadow-radius={2}
            />
            <Sky sunPosition={darkMode ? [0, -10, 0] : SCENE_LIGHT_OFFSET} />
        </>
    );
}

import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";

export default function MovingPlatform({ args = [5, 1, 5], position = [0, 0, 0], range = 5, speed = 2, color = "orange" }) {
    const [ref, api] = useBox(() => ({
        mass: 0,
        type: 'Kinematic',
        args: args,
        position: position,
    }));

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime();
        // Calculate new Y position based on sine wave
        const yOffset = Math.sin(time * speed) * range;
        const velocity = Math.cos(time * speed) * speed * range;
        
        api.position.set(
            position[0],
            position[1] + yOffset,
            position[2]
        );
        api.velocity.set(0, velocity, 0);
    });

    return (
        <mesh ref={ref} castShadow receiveShadow>
            <boxGeometry args={args} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

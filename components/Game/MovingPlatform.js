import { useThree } from "@react-three/fiber";
import { CuboidCollider, RigidBody, useBeforePhysicsStep } from "@react-three/rapier";
import { useRef } from "react";

export default function MovingPlatform({ args = [5, 1, 5], position = [0, 0, 0], range = 5, speed = 2, color = "orange" }) {
    const rigidBodyRef = useRef(null);
    const clock = useThree((state) => state.clock);

    useBeforePhysicsStep(() => {
        rigidBodyRef.current?.setNextKinematicTranslation({
            x: position[0],
            y: position[1] + Math.sin(clock.elapsedTime * speed) * range,
            z: position[2],
        });
    });

    return (
        <RigidBody
            ref={rigidBodyRef}
            type="kinematicPosition"
            position={position}
            colliders={false}
        >
            <CuboidCollider args={args.map((size) => size / 2)} />
            <mesh
                castShadow
                receiveShadow
            >
                <boxGeometry args={args} />
                <meshStandardMaterial color={color} />
            </mesh>
        </RigidBody>
    );
}

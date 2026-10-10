import { useThree } from "@react-three/fiber";
import { CuboidCollider, RigidBody, useBeforePhysicsStep, useRapier } from "@react-three/rapier";
import { useRef } from "react";
import { useGameStore } from "@/hooks/useGameStore";
import { ModelBat } from "../Models/Bat";
import { degToRad } from "three/src/math/MathUtils";
import { useStore } from "@/hooks/useStore";

export default function FlyingEnemy({ args = [1, 1, 1], position = [0, 4, 0] }) {
    const rigidBodyRef = useRef(null);
    const clock = useThree((state) => state.clock);
    const { rapier } = useRapier();
    const debug = useStore((state) => state.debug);

    const handlePlayerContact = ({ other }) => {
        if (other.rigidBodyObject?.userData?.tag !== "player") return;
        const state = useGameStore.getState();
        state.setPlayerDisabled(true);
        state.setAttachedRope(null);
    };

    useBeforePhysicsStep(() => {
        const progress = clock.elapsedTime % 20;
        rigidBodyRef.current?.setNextKinematicTranslation({
            x: 200 - (progress / 20) * 200,
            y: position[1],
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
            <CuboidCollider
                args={args.map((size) => size / 2)}
                sensor
                activeCollisionTypes={rapier.ActiveCollisionTypes.ALL}
                onIntersectionEnter={handlePlayerContact}
            />
            {debug && (
                <mesh>
                    <boxGeometry args={args} />
                    <meshStandardMaterial color="red" />
                </mesh>
            )}
            <group rotation={[0, 0, degToRad(60)]}>
                <ModelBat
                    rotation={[0, Math.PI / -2, 0]}
                    position={[0, -2, 0]}
                />
            </group>
        </RigidBody>
    );
}

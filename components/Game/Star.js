import { useRef, useState } from "react";
import { CuboidCollider, RigidBody, useRapier } from "@react-three/rapier";
import { useGameStore } from "@/hooks/useGameStore";

export default function Star({ position, value }) {
    const [collected, setCollected] = useState(false);
    const collectedRef = useRef(false);
    const { rapier } = useRapier();
    const increaseScore = useGameStore((state) => state.increaseScore);

    const handlePlayerContact = ({ other }) => {
        if (collectedRef.current || other.rigidBodyObject?.userData?.tag !== "player") return;
        collectedRef.current = true;
        setCollected(true);
        increaseScore(value);
    };

    if (collected) return null;

    return (
        <RigidBody
            type="fixed"
            position={position}
            colliders={false}
        >
            <CuboidCollider
                args={[0.25, 0.25, 0.25]}
                sensor
                activeCollisionTypes={rapier.ActiveCollisionTypes.ALL}
                onIntersectionEnter={handlePlayerContact}
            />
            <mesh>
                <dodecahedronGeometry args={[0.4, 0]} />
                <meshStandardMaterial
                    color="yellow"
                    emissive="yellow"
                    emissiveIntensity={0.5}
                />
            </mesh>
        </RigidBody>
    );
}

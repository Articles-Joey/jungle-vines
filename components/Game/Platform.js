import { CuboidCollider, RigidBody } from "@react-three/rapier";

export default function Platform({ args, position, color }) {
    return (
        <RigidBody
            type="fixed"
            position={position}
            colliders={false}
        >
            <CuboidCollider args={args.map((size) => size / 2)} />
            <mesh castShadow>
                <boxGeometry args={args} />
                <meshStandardMaterial color={color} />
            </mesh>
        </RigidBody>
    );
}

import { useThree } from "@react-three/fiber";
import {
    BallCollider,
    CylinderCollider,
    RigidBody,
    useBeforePhysicsStep,
    useRapier,
} from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";
import { Quaternion, Vector3 } from "three";
import { useGameStore } from "@/hooks/useGameStore";
import { useStore } from "@/hooks/useStore";
import { ModelSpider } from "../Models/Spider";
import RopeMesh from "./RopeMesh";

function RopeEnemy({ position, args, swingSpeed, swingPhase, swingAmplitude }) {
    const rigidBodyRef = useRef(null);
    const initialRotation = useRef(null);
    const clock = useThree((state) => state.clock);
    const { rapier } = useRapier();
    const seed = useStore((state) => state.seed);
    const offset = useMemo(() => new Vector3(), []);
    const pivot = useMemo(() => new Vector3(), []);

    const climbSpeed = useMemo(() => {
        const s = Number(seed) || 0;
        const rand = Math.abs(
            Math.sin(s + position[0] * 12.9898 + position[1] * 78.233),
        );
        return 0.2 + rand * 0.8;
    }, [seed, position]);
    const climbRange = args[2] / 2;

    const handlePlayerContact = ({ other }) => {
        const state = useGameStore.getState();
        if (
            other.rigidBodyObject?.userData?.tag === "player" &&
            state.attachedRope
        ) {
            state.setPlayerDisabled(true);
            state.setAttachedRope(null);
        }
    };

    useBeforePhysicsStep(() => {
        const body = rigidBodyRef.current;
        if (!body) return;
        if (!initialRotation.current) {
            initialRotation.current = new Quaternion().copy(body.rotation());
            pivot.copy(body.translation());
        }

        const time = clock.elapsedTime;
        const angle = Math.sin(time * swingSpeed + swingPhase) * swingAmplitude;
        const climbPosition =
            -climbRange + Math.sin(time * climbSpeed) * climbRange;
        offset.set(
            -climbPosition * Math.sin(angle),
            climbPosition * Math.cos(angle),
            0,
        );
        offset.applyQuaternion(initialRotation.current).add(pivot);
        body.setNextKinematicTranslation(offset);
    });

    return (
        <RigidBody
            ref={rigidBodyRef}
            type="kinematicPosition"
            position={position}
            colliders={false}
        >
            <BallCollider
                args={[1]}
                sensor
                activeCollisionTypes={rapier.ActiveCollisionTypes.ALL}
                onIntersectionEnter={handlePlayerContact}
            />
            <ModelSpider scale={0.5} />
        </RigidBody>
    );
}

export default function RopeSwing({
    args = [0.1, 0.1, 15, 8],
    position,
    rotation,
    swingSpeed: propSwingSpeed,
    swingPhase: propSwingPhase,
    hasEnemy: propHasEnemy,
}) {
    const rigidBodyRef = useRef(null);
    const initialRotation = useRef(null);
    const clock = useThree((state) => state.clock);
    const { rapier } = useRapier();
    const swingAxis = useMemo(() => new Vector3(0, 0, 1), []);
    const swingRotation = useMemo(() => new Quaternion(), []);
    const nextRotation = useMemo(() => new Quaternion(), []);

    const { swingSpeed, swingPhase, hasEnemy } = useMemo(
        () => ({
            swingSpeed: propSwingSpeed ?? 1.5 + Math.random(),
            swingPhase: propSwingPhase ?? Math.random() * Math.PI * 2,
            hasEnemy: propHasEnemy ?? Math.random() > 0.5,
        }),
        [propSwingSpeed, propSwingPhase, propHasEnemy],
    );
    const swingAmplitude = Math.PI / 6;
    const ropeRadius = Math.max(args[0], args[1]) * 2;

    useEffect(() => {
        const ropeBody = rigidBodyRef.current;
        return () => {
            const state = useGameStore.getState();
            if (state.attachedRope?.ropeBody === ropeBody) {
                state.setAttachedRope(null);
            }
        };
    }, []);

    const handlePlayerContact = ({ other }) => {
        const state = useGameStore.getState();
        const ropeBody = rigidBodyRef.current;
        if (
            !ropeBody ||
            other.rigidBodyObject?.userData?.tag !== "player" ||
            state.attachedRope ||
            state.playerDisabled ||
            Date.now() - state.lastRopeDetachTime < 200
        )
            return;

        const pivot = ropeBody.translation();
        state.setAttachedRope({
            ropeBody,
            position: [pivot.x, pivot.y, pivot.z],
            rotation:
                initialRotation.current?.clone() ??
                new Quaternion().copy(ropeBody.rotation()),
            swingSpeed,
            swingPhase,
            swingAmplitude,
            length: args[2],
        });
    };

    useBeforePhysicsStep(() => {
        const body = rigidBodyRef.current;
        if (!body) return;
        // Compose the swing with the parent's world rotation around the anchor.
        if (!initialRotation.current) {
            initialRotation.current = new Quaternion().copy(body.rotation());
        }
        const angle =
            Math.sin(clock.elapsedTime * swingSpeed + swingPhase) *
            swingAmplitude;
        swingRotation.setFromAxisAngle(swingAxis, angle);
        nextRotation.copy(initialRotation.current).multiply(swingRotation);
        body.setNextKinematicRotation(nextRotation);
    });

    return (
        <group rotation={rotation}>
            <mesh
                position={position}
                castShadow
            >
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="saddlebrown" />
            </mesh>
            <RigidBody
                ref={rigidBodyRef}
                type="kinematicPosition"
                position={position}
                colliders={false}
            >
                <CylinderCollider
                    args={[args[2] / 2, ropeRadius]}
                    position={[0, -args[2] / 2, 0]}
                    sensor
                    activeCollisionTypes={rapier.ActiveCollisionTypes.ALL}
                    onIntersectionEnter={handlePlayerContact}
                />
                <RopeMesh
                    length={args[2]}
                    radius={ropeRadius}
                    position={[0, -args[2] / 2, 0]}
                />
            </RigidBody>
            {hasEnemy && (
                <RopeEnemy
                    position={position}
                    args={args}
                    swingSpeed={swingSpeed}
                    swingPhase={swingPhase}
                    swingAmplitude={swingAmplitude}
                />
            )}
        </group>
    );
}

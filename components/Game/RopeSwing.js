import { useThree } from "@react-three/fiber";
import {
    BallCollider,
    CapsuleCollider,
    RigidBody,
    useBeforePhysicsStep,
    useRapier,
} from "@react-three/rapier";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Quaternion, Vector3 } from "three";
import { useGameStore } from "@/hooks/useGameStore";
import { useStore } from "@/hooks/useStore";
import { ModelSpider } from "../Models/Spider";
import RopeMesh, { OverheadRope } from "./RopeMesh";
import {
    createRopeMotion,
    getLocalRopePoint,
    getRopePoint,
    ROPE_SEGMENT_COUNT,
} from "./ropeMotion";

const UP = new Vector3(0, 1, 0);

function RopeEnemy({ motion, climbSpeed }) {
    const rigidBodyRef = useRef(null);
    const clock = useThree((state) => state.clock);
    const { rapier } = useRapier();
    const offset = useMemo(() => new Vector3(), []);

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
        const time = clock.elapsedTime;
        const fraction =
            (Math.sin(time * climbSpeed + motion.swingPhase) + 1) / 2;
        const distance = 1 + fraction * (motion.length - 1);
        getRopePoint(motion, distance, time, offset);
        body.setNextKinematicTranslation(offset);
    });

    return (
        <RigidBody
            ref={rigidBodyRef}
            type="kinematicPosition"
            position={[0, -motion.length / 2, 0]}
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
    const root = useRef(null);
    const segmentBodies = useRef([]);
    const clock = useThree((state) => state.clock);
    const { rapier } = useRapier();
    const seed = useStore((state) => state.seed);
    const [x, y, z] = position;
    const length = Math.max(2, args[2]);
    const ropeRadius = Math.max(args[0], args[1]) * 2;
    const scratch = useMemo(
        () => ({
            start: new Vector3(),
            end: new Vector3(),
            center: new Vector3(),
            direction: new Vector3(),
            rotation: new Quaternion(),
        }),
        [],
    );

    const { motion, hasEnemy, climbSpeed } = useMemo(() => {
        let variation = (Number(seed) || 0) + x * 12.9898 + y * 78.233 + z * 37.719;
        const random = () => {
            variation += 1;
            const value = Math.sin(variation) * 43758.5453;
            return value - Math.floor(value);
        };
        return {
            motion: createRopeMotion({
                length,
                swingSpeed: propSwingSpeed ?? 1.4 + random() * 0.8,
                swingPhase: propSwingPhase ?? random() * Math.PI * 2,
                swingAmplitude: 0.45 + random() * 0.2,
                bendAmplitude: 0.08 + random() * 0.06,
            }),
            hasEnemy: propHasEnemy ?? random() > 0.5,
            climbSpeed: 0.2 + random() * 0.8,
        };
    }, [seed, x, y, z, length, propSwingSpeed, propSwingPhase, propHasEnemy]);

    const initialSegments = useMemo(
        () =>
            Array.from({ length: ROPE_SEGMENT_COUNT }, (_, index) => {
                const start = getLocalRopePoint(
                    motion,
                    index * motion.segmentLength,
                    0,
                    new Vector3(),
                );
                const end = getLocalRopePoint(
                    motion,
                    (index + 1) * motion.segmentLength,
                    0,
                    new Vector3(),
                );
                return {
                    position: start.clone().add(end).multiplyScalar(0.5).toArray(),
                    rotation: new Quaternion().setFromUnitVectors(
                        UP,
                        end.sub(start).normalize(),
                    ),
                };
            }),
        [motion],
    );

    const updateTransform = useCallback(() => {
        if (!root.current) return;
        root.current.updateWorldMatrix(true, false);
        motion.matrixWorld.copy(root.current.matrixWorld);
        motion.inverseMatrixWorld.copy(motion.matrixWorld).invert();
    }, [motion]);

    useLayoutEffect(updateTransform, [updateTransform]);

    useEffect(() => {
        return () => {
            const state = useGameStore.getState();
            if (state.attachedRope?.motion === motion) {
                state.setAttachedRope(null);
            }
        };
    }, [motion]);

    const handlePlayerContact = useCallback(
        ({ other }) => {
            const state = useGameStore.getState();
            const ropeBody = segmentBodies.current[0];
            if (
                !ropeBody ||
                other.rigidBodyObject?.userData?.tag !== "player" ||
                state.attachedRope ||
                state.playerDisabled ||
                Date.now() - state.lastRopeDetachTime < 200
            )
                return;

            state.setAttachedRope({
                ropeBody,
                motion,
                length: motion.length,
            });
        },
        [motion],
    );

    useBeforePhysicsStep(() => {
        updateTransform();
        const time = clock.elapsedTime;
        for (let index = 0; index < ROPE_SEGMENT_COUNT; index += 1) {
            const body = segmentBodies.current[index];
            if (!body) continue;
            getRopePoint(motion, index * motion.segmentLength, time, scratch.start);
            getRopePoint(
                motion,
                (index + 1) * motion.segmentLength,
                time,
                scratch.end,
            );
            scratch.center.copy(scratch.start).add(scratch.end).multiplyScalar(0.5);
            scratch.direction.subVectors(scratch.end, scratch.start).normalize();
            scratch.rotation.setFromUnitVectors(UP, scratch.direction);
            body.setNextKinematicTranslation(scratch.center);
            body.setNextKinematicRotation(scratch.rotation);
        }
    });

    return (
        <group
            ref={root}
            position={position}
            rotation={rotation}
        >
            <OverheadRope
                radius={ropeRadius}
                swingLength={length}
            />
            <RopeMesh
                length={length}
                radius={ropeRadius}
                motion={motion}
            />
            {initialSegments.map((segment, index) => (
                <RigidBody
                    key={index}
                    ref={(body) => {
                        segmentBodies.current[index] = body;
                    }}
                    type="kinematicPosition"
                    position={segment.position}
                    quaternion={segment.rotation}
                    colliders={false}
                >
                    <CapsuleCollider
                        args={[motion.segmentLength / 2, ropeRadius]}
                        sensor
                        activeCollisionTypes={rapier.ActiveCollisionTypes.ALL}
                        onIntersectionEnter={handlePlayerContact}
                    />
                </RigidBody>
            ))}
            {hasEnemy && (
                <RopeEnemy
                    motion={motion}
                    climbSpeed={climbSpeed}
                />
            )}
        </group>
    );
}

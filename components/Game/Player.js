import { useFrame, useThree } from "@react-three/fiber";
import {
    CapsuleCollider,
    RigidBody,
    useAfterPhysicsStep,
    useBeforePhysicsStep,
    useRapier,
} from "@react-three/rapier";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Vector3 } from "three";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useAudioStore } from "@/hooks/useAudioStore";
import { ModelCharacterUAL } from "@/public/models/Characters/UAL1_Standard";
import { useControllerStore } from "@/hooks/useControllerStore";
import { useControlsStore, useGameStore } from "@/hooks/useGameStore";
import { useStore } from "@/hooks/useStore";
import { degToRad } from "three/src/math/MathUtils";
import { getClosestRopeDistance, getRopePoint } from "./ropeMotion";

const JUMP_FORCE = 6;
const SPEED = 4;
const AIR_CONTROL = 12;
// The capsule center sits this far above the rigid body's origin.
const CAPSULE_HALF_HEIGHT = 2.25;
const CAPSULE_RADIUS = 0.5;
const GROUND_CONTACT_DISTANCE = 0.03;

function PlayerBase() {
    const rigidBodyRef = useRef(null);
    const colliderRef = useRef(null);
    const ropeHeight = useRef(0);
    const previousRope = useRef(null);
    const lastLocation = useRef(null);
    const grounded = useRef(false);
    const takingOff = useRef(false);
    const currentAnimation = useRef("Jump_Loop");
    const currentLocomotion = useRef("Idle_Loop");
    const { camera, clock } = useThree();
    const { rapier } = useRapier();
    const ropeOffset = useMemo(() => new Vector3(), []);
    const nextRopeOffset = useMemo(() => new Vector3(), []);
    const launchVelocity = useMemo(() => new Vector3(), []);
    const playerUserData = useMemo(() => ({ tag: "player" }), []);

    const cameraMode = useGameStore((state) => state.cameraMode);
    const playerDisabled = useGameStore((state) => state.playerDisabled);
    const playSound = useAudioStore((state) => state.playSound);
    const cameraControlMethod = useStore((state) => state.cameraControlMethod);
    const debug = useStore((state) => state.debug);
    const showPhysicsDebug = useStore(
        (state) => state?.debugConfig?.showPhysicsDebug,
    );
    const { moveBackward, moveForward, moveRight, moveLeft, jump } =
        useKeyboard();
    const [lastMove, setLastMove] = useState("Right");
    const [animation, setAnimation] = useState("Jump_Loop");
    const [locomotionAnimation, setLocomotionAnimation] = useState("Idle_Loop");

    const playAnimation = useCallback((nextAnimation) => {
        if (currentAnimation.current === nextAnimation) return;
        currentAnimation.current = nextAnimation;
        setAnimation(nextAnimation);
    }, []);

    const handleAnimationFinished = useCallback(
        (finishedAnimation) => {
            if (finishedAnimation !== currentAnimation.current) return;

            if (finishedAnimation === "Jump_Start") {
                playAnimation(grounded.current ? "Jump_Land" : "Jump_Loop");
            } else if (finishedAnimation === "Jump_Land") {
                playAnimation(
                    grounded.current ? currentLocomotion.current : "Jump_Loop",
                );
            }
        },
        [playAnimation],
    );

    useEffect(() => {
        if (playerDisabled) {
            playSound("/audio/death-sound.mp3");
        }
    }, [playerDisabled, playSound]);

    // Read the store during physics updates so grabs, death, and teleports take
    // effect even before React has rendered the new state.
    useBeforePhysicsStep((world) => {
        const body = rigidBodyRef.current;
        if (!body) return;
        let state = useGameStore.getState();

        if (state.teleport) {
            const [x, y, z] = state.teleport;
            body.setBodyType(rapier.RigidBodyType.Dynamic, true);
            body.setTranslation({ x, y, z }, true);
            body.setLinvel({ x: 0, y: 0, z: 0 }, true);
            grounded.current = false;
            takingOff.current = false;
            playAnimation("Jump_Loop");
            state.setAttachedRope(null);
            state.setTeleport(false);
            state = useGameStore.getState();
        }

        if (body.translation().y < -15) {
            body.setBodyType(rapier.RigidBodyType.Dynamic, true);
            body.setTranslation({ x: 0, y: 10, z: 0 }, true);
            body.setLinvel({ x: 0, y: 0, z: 0 }, true);
            grounded.current = false;
            takingOff.current = false;
            playAnimation("Jump_Loop");
            state.setAttachedRope(null);
            state.setPlayerDisabled(false);
            state = useGameStore.getState();
        }

        const collisionGroups = state.playerDisabled ? 0 : 0xffffffff;
        if (colliderRef.current?.collisionGroups() !== collisionGroups) {
            colliderRef.current?.setCollisionGroups(collisionGroups);
        }

        const rope = state.playerDisabled ? null : state.attachedRope;
        const bodyType = rope
            ? rapier.RigidBodyType.KinematicPositionBased
            : rapier.RigidBodyType.Dynamic;
        if (body.bodyType() !== bodyType) {
            body.setBodyType(bodyType, true);
        }

        if (state.playerDisabled) {
            previousRope.current = null;
            grounded.current = false;
            takingOff.current = false;
            return;
        }

        const { touchControls, setTouchControls } = useControlsStore.getState();
        const axes = useControllerStore.getState().controllerState?.axes;
        const controllerX = axes && Math.abs(axes[0]) > 0.3 ? axes[0] : 0;

        if (rope) {
            grounded.current = false;
            takingOff.current = false;
            playAnimation("Jump_Loop");
            if (previousRope.current !== rope) {
                // Find the nearest point along the bent rope to avoid snapping
                // the player onto an imaginary straight line when grabbing it.
                const playerPosition = body.translation();
                ropeOffset.set(
                    playerPosition.x,
                    playerPosition.y + CAPSULE_HALF_HEIGHT,
                    playerPosition.z,
                );
                ropeHeight.current = Math.max(
                    1,
                    getClosestRopeDistance(
                        rope.motion,
                        ropeOffset,
                        clock.elapsedTime,
                    ),
                );
                body.setLinvel({ x: 0, y: 0, z: 0 }, true);
            }
            previousRope.current = rope;

            const climbSpeed = 6;
            const previousHeight = ropeHeight.current;
            const climbDirection =
                (moveBackward ? 1 : 0) - (moveForward ? 1 : 0);
            ropeHeight.current = Math.max(
                1,
                Math.min(
                    previousHeight +
                        climbDirection * climbSpeed * world.timestep,
                    rope.length,
                ),
            );
            const climbVelocity =
                (ropeHeight.current - previousHeight) / world.timestep;
            const time = clock.elapsedTime;
            getRopePoint(rope.motion, ropeHeight.current, time, ropeOffset);
            const nextPosition = {
                x: ropeOffset.x,
                // The player stays upright; place its capsule center on the rope.
                y: ropeOffset.y - CAPSULE_HALF_HEIGHT,
                z: ropeOffset.z,
            };

            if (jump || touchControls.jump) {
                // Sample the same curved path one step ahead so releasing a
                // rope preserves both its swing momentum and the climb motion.
                getRopePoint(
                    rope.motion,
                    ropeHeight.current + climbVelocity * world.timestep,
                    time + world.timestep,
                    nextRopeOffset,
                );
                launchVelocity
                    .subVectors(nextRopeOffset, ropeOffset)
                    .multiplyScalar(1 / world.timestep);
                launchVelocity.y += JUMP_FORCE;

                // Switch immediately so Rapier integrates the release velocity
                // as a dynamic body in this same step.
                body.setBodyType(rapier.RigidBodyType.Dynamic, true);
                body.setTranslation(nextPosition, true);
                body.setLinvel(launchVelocity, true);
                takingOff.current = true;
                playAnimation("Jump_Start");
                state.setAttachedRope(null);
                state.setLastRopeDetachTime(Date.now());
                previousRope.current = null;
                if (touchControls.jump) {
                    setTouchControls({ ...touchControls, jump: false });
                }
            } else {
                body.setNextKinematicTranslation(nextPosition);
            }
            return;
        }

        previousRope.current = null;
        const direction =
            (moveRight || touchControls.right ? 1 : 0) -
                (moveLeft || touchControls.left ? 1 : 0) || controllerX;
        if (direction > 0) setLastMove("Right");
        if (direction < 0) setLastMove("Left");

        const nextLocomotion =
            Math.abs(direction) > 0.05 ? "Walk_Loop" : "Idle_Loop";
        if (currentLocomotion.current !== nextLocomotion) {
            currentLocomotion.current = nextLocomotion;
            setLocomotionAnimation(nextLocomotion);
        }

        const velocity = body.linvel();
        const shouldJump = (jump || touchControls.jump) && grounded.current;
        if (shouldJump) {
            grounded.current = false;
            takingOff.current = true;
            playAnimation("Jump_Start");
        }
        const moveVelocity = direction * SPEED * (state.shift ? 2 : 1);
        const airAdjustment = Math.max(
            -AIR_CONTROL * world.timestep,
            Math.min(AIR_CONTROL * world.timestep, moveVelocity - velocity.x),
        );
        // Keep the rope's horizontal release momentum, with gradual steering
        // in the air instead of replacing that velocity on the very next step.
        const horizontalVelocity =
            grounded.current || shouldJump
                ? moveVelocity
                : velocity.x + (direction ? airAdjustment : 0);
        body.setLinvel(
            {
                x: horizontalVelocity,
                y: shouldJump ? JUMP_FORCE : velocity.y,
                z: 0,
            },
            true,
        );
        if (shouldJump && touchControls.jump) {
            setTouchControls({ ...touchControls, jump: false });
        }
    });

    useAfterPhysicsStep((world) => {
        const body = rigidBodyRef.current;
        const collider = colliderRef.current;
        const state = useGameStore.getState();
        if (!body || !collider || state.playerDisabled || state.attachedRope)
            return;

        let touchingGround = false;
        world.contactPairsWith(collider, (other) => {
            if (touchingGround || other.isSensor()) return;

            // The other collider's outward normal must point up. Side and
            // ceiling contacts cannot ground the player or trigger a landing.
            const contact = other.contactCollider(
                collider,
                GROUND_CONTACT_DISTANCE,
            );
            touchingGround = contact !== null && contact.normal1.y > 0.5;
        });

        // A takeoff can retain its previous floor contact for one physics step.
        // Wait for separation or a blocked takeoff to settle before landing.
        if (takingOff.current) {
            if (!touchingGround || body.linvel().y <= 0) takingOff.current = false;
            touchingGround = false;
        }

        const wasGrounded = grounded.current;
        grounded.current = touchingGround;
        if (touchingGround) {
            if (!wasGrounded) {
                playAnimation("Jump_Land");
            } else if (currentAnimation.current !== "Jump_Land") {
                playAnimation(currentLocomotion.current);
            }
        } else if (currentAnimation.current !== "Jump_Start") {
            playAnimation("Jump_Loop");
        }
    });

    useFrame(() => {
        const body = rigidBodyRef.current;
        if (!body) return;
        const { x, y, z } = body.translation();

        const newLocation = new Vector3(
            Math.floor(x * 100) / 100,
            Math.floor(y * 100) / 100,
            Math.floor(z * 100) / 100,
        );
        if (!lastLocation.current?.equals(newLocation)) {
            useGameStore.getState().setPlayerLocation(newLocation);
            lastLocation.current = newLocation;
        }
        const state = useStore.getState();
        if (x > state.maxDistanceTraveled) state.setMaxDistanceTraveled(x);

        if (cameraMode !== "Player") return;
        if (cameraControlMethod === "Side Scroll") {
            camera.position.set(x, y + 8, 50);
            camera.lookAt(x, y, 0);
        } else if (cameraControlMethod === "Third Person") {
            const offset = lastMove === "Right" ? -10 : 10;
            const lookDir = lastMove === "Right" ? 10 : -10;
            camera.position.set(x + offset, y + 5, 0);
            camera.lookAt(x + lookDir, y, 0);
        } else if (cameraControlMethod === "First Person") {
            const lookDir = lastMove === "Right" ? 10 : -10;
            camera.position.set(x, y + 0.5, 0);
            camera.lookAt(x + lookDir, y, 0);
        }
    });

    return (
        <RigidBody
            ref={rigidBodyRef}
            position={[0, 2, 0]}
            colliders={false}
            lockRotations
            ccd
            userData={playerUserData}
        >
            <CapsuleCollider
                ref={colliderRef}
                args={[CAPSULE_HALF_HEIGHT, CAPSULE_RADIUS]}
                position={[0, CAPSULE_HALF_HEIGHT, 0]}
                mass={1}
                friction={0.3}
                restitution={0}
                collisionGroups={playerDisabled ? 0 : 0xffffffff}
            />
            {showPhysicsDebug && (
                <mesh position={[0, CAPSULE_HALF_HEIGHT, 0]}>
                    <capsuleGeometry
                        args={[CAPSULE_RADIUS, CAPSULE_HALF_HEIGHT * 2, 8, 16]}
                    />
                    <meshStandardMaterial
                        color="red"
                        wireframe
                    />
                </mesh>
            )}
            <ModelCharacterUAL
                castShadow
                receiveShadow
                animation={animation}
                locomotionAnimation={locomotionAnimation}
                onAnimationFinished={handleAnimationFinished}
                animationPaused={playerDisabled}
                scale={3}
                rotation={[
                    0,
                    lastMove === "Right" ? degToRad(90) : degToRad(-90),
                    0,
                ]}
                position={[0, -0.5, 0]}
            />
        </RigidBody>
    );
}

export default PlayerBase;

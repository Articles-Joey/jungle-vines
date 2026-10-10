import { useFrame, useThree } from "@react-three/fiber";
import { CapsuleCollider, RigidBody, useBeforePhysicsStep, useRapier } from "@react-three/rapier";
import { useEffect, useMemo, useRef, useState } from "react";
import { Vector3 } from "three";
import { useKeyboard } from "@/hooks/useKeyboard";
import { Model as ModelKingMen } from "@/components/Models/King";
import { useControllerStore } from "@/hooks/useControllerStore";
import { useControlsStore, useGameStore } from "@/hooks/useGameStore";
import { useStore } from "@/hooks/useStore";
import { degToRad } from "three/src/math/MathUtils";

const JUMP_FORCE = 6;
const SPEED = 4;
// The capsule center sits this far above the rigid body's origin.
const CAPSULE_HALF_HEIGHT = 2.25;
const CAPSULE_RADIUS = 0.5;

function PlayerBase() {
    const rigidBodyRef = useRef(null);
    const colliderRef = useRef(null);
    const ropeHeight = useRef(0);
    const previousRope = useRef(null);
    const lastLocation = useRef(null);
    const { camera, clock } = useThree();
    const { rapier } = useRapier();
    const ropeOffset = useMemo(() => new Vector3(), []);
    const launchVelocity = useMemo(() => new Vector3(), []);
    const swingAxis = useMemo(() => new Vector3(0, 0, 1), []);
    const playerUserData = useMemo(() => ({ tag: "player" }), []);

    const cameraMode = useGameStore((state) => state.cameraMode);
    const playerDisabled = useGameStore((state) => state.playerDisabled);
    const cameraControlMethod = useStore((state) => state.cameraControlMethod);
    const debug = useStore((state) => state.debug);
    const { moveBackward, moveForward, moveRight, moveLeft, jump } = useKeyboard();
    const [lastMove, setLastMove] = useState("Right");

    useEffect(() => {
        if (playerDisabled) {
            const audio = new Audio("/audio/roblox-death-sound.mp3");
            audio.play();
        }
    }, [playerDisabled]);

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
            state.setAttachedRope(null);
            state.setTeleport(false);
            state = useGameStore.getState();
        }

        if (body.translation().y < -15) {
            body.setBodyType(rapier.RigidBodyType.Dynamic, true);
            body.setTranslation({ x: 0, y: 10, z: 0 }, true);
            body.setLinvel({ x: 0, y: 0, z: 0 }, true);
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
            return;
        }

        const { touchControls, setTouchControls } = useControlsStore.getState();
        const axes = useControllerStore.getState().controllerState?.axes;
        const controllerX = axes && Math.abs(axes[0]) > 0.3 ? axes[0] : 0;

        if (rope) {
            if (previousRope.current !== rope) {
                // Measure from the capsule center along the rotated rope.
                const playerPosition = body.translation();
                ropeOffset.set(
                    playerPosition.x - rope.position[0],
                    playerPosition.y + CAPSULE_HALF_HEIGHT - rope.position[1],
                    playerPosition.z - rope.position[2],
                );
                ropeOffset.applyQuaternion(rope.rotation.clone().invert());
                const angle = Math.sin(clock.elapsedTime * rope.swingSpeed + rope.swingPhase) * rope.swingAmplitude;
                ropeOffset.applyAxisAngle(swingAxis, -angle);
                ropeHeight.current = Math.max(1, Math.min(-ropeOffset.y, rope.length));
                body.setLinvel({ x: 0, y: 0, z: 0 }, true);
            }
            previousRope.current = rope;

            const climbSpeed = 6;
            const previousHeight = ropeHeight.current;
            const climbDirection = (moveBackward ? 1 : 0) - (moveForward ? 1 : 0);
            ropeHeight.current = Math.max(
                1,
                Math.min(previousHeight + climbDirection * climbSpeed * world.timestep, rope.length),
            );
            const climbVelocity = (ropeHeight.current - previousHeight) / world.timestep;
            const time = clock.elapsedTime;
            const angle = Math.sin(time * rope.swingSpeed + rope.swingPhase) * rope.swingAmplitude;

            ropeOffset.set(
                ropeHeight.current * Math.sin(angle),
                -ropeHeight.current * Math.cos(angle),
                0,
            ).applyQuaternion(rope.rotation);
            const nextPosition = {
                x: rope.position[0] + ropeOffset.x,
                // The player stays upright; place its capsule center on the rope.
                y: rope.position[1] + ropeOffset.y - CAPSULE_HALF_HEIGHT,
                z: rope.position[2] + ropeOffset.z,
            };

            if (jump || touchControls.jump) {
                const thetaDot = rope.swingAmplitude * rope.swingSpeed *
                    Math.cos(time * rope.swingSpeed + rope.swingPhase);
                launchVelocity.set(
                    ropeHeight.current * Math.cos(angle) * thetaDot + climbVelocity * Math.sin(angle),
                    ropeHeight.current * Math.sin(angle) * thetaDot - climbVelocity * Math.cos(angle),
                    0,
                ).applyQuaternion(rope.rotation);
                launchVelocity.y += JUMP_FORCE;

                // Switch immediately so Rapier integrates the release velocity
                // as a dynamic body in this same step.
                body.setBodyType(rapier.RigidBodyType.Dynamic, true);
                body.setTranslation(nextPosition, true);
                body.setLinvel(launchVelocity, true);
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
        const direction = (
            (moveRight || touchControls.right ? 1 : 0) -
            (moveLeft || touchControls.left ? 1 : 0)
        ) || controllerX;
        if (direction > 0) setLastMove("Right");
        if (direction < 0) setLastMove("Left");

        const velocity = body.linvel();
        const shouldJump = (jump || touchControls.jump) && Math.abs(velocity.y) < 0.05;
        body.setLinvel({
            x: direction * SPEED * (state.shift ? 2 : 1),
            y: shouldJump ? JUMP_FORCE : velocity.y,
            z: 0,
        }, true);
        if (shouldJump && touchControls.jump) {
            setTouchControls({ ...touchControls, jump: false });
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
            {debug && (
                <mesh position={[0, CAPSULE_HALF_HEIGHT, 0]}>
                    <capsuleGeometry args={[CAPSULE_RADIUS, CAPSULE_HALF_HEIGHT * 2, 8, 16]} />
                    <meshStandardMaterial
                        color="red"
                        wireframe
                    />
                </mesh>
            )}
            <ModelKingMen
                scale={3}
                rotation={[0, lastMove === "Right" ? degToRad(90) : degToRad(-90), 0]}
                position={[0, -0.5, 0]}
            />
        </RigidBody>
    );
}

export default PlayerBase;

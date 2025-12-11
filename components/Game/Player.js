import { useFrame, useThree } from "@react-three/fiber"
import { useSphere } from "@react-three/cannon"
import { memo, useEffect, useRef, useState } from "react"
import { Vector3 } from "three"
import * as THREE from 'three';
import { useKeyboard } from "@/hooks/useKeyboard"

import { Model as ModelKingMen } from "@/components/Models/King";

import { useControllerStore } from '@/hooks/useControllerStore';
import { useControlsStore, useGameStore } from "@/hooks/useGameStore";
import { useStore } from "@/hooks/useStore";
import { degToRad } from "three/src/math/MathUtils";

const JUMP_FORCE = 6;
const SPEED = 4;

let lastLocation

function myToFixed(i, digits) {
    var pow = Math.pow(10, digits);

    return Math.floor(i * pow) / pow;
}

function PlayerBase(props) {

    const playerModelRef = useRef()

    // const { setPlayerData, teleportPlayer, setTeleportPlayer } = props;

    const {
        cameraMode, setCameraMode,
        teleport, setTeleport,
        setPlayerLocation,
        // maxHeight, setMaxHeight,
        shift, setShift,
        attachedRope, setAttachedRope,
        setLastRopeDetachTime,
        playerDisabled,
    } = useGameStore()

    const {
        touchControls, setTouchControls
    } = useControlsStore()

    // const { maxDistanceTraveled, setMaxDistanceTraveled } = useStore()
    const maxDistanceTraveled = useStore((state) => state.maxDistanceTraveled)
    const setMaxDistanceTraveled = useStore((state) => state.setMaxDistanceTraveled)
    const setPlayerDisabled = useGameStore((state) => state.setPlayerDisabled)

    const { controllerState, setControllerState } = useControllerStore()

    const ropeHeight = useRef(0)

    useEffect(() => {
        if (attachedRope) {
            const pivotY = attachedRope.position[1]
            const playerY = pos.current[1]
            let h = pivotY - playerY
            h = Math.max(1, Math.min(h, attachedRope.length))
            ropeHeight.current = h
            api.velocity.set(0, 0, 0)
        }
    }, [attachedRope])

    // Attach event listeners when the component mounts
    useEffect(() => {

        if (controllerState.axes && Math.abs(controllerState?.axes[0]) > 0.3) {

            if (controllerState?.axes[0] > 0) {
                api.position.set([-1, 5, 0]);
            } else {
                api.position.set([1, 5, 0]);
            }

        }

    }, [controllerState]);

    useEffect(() => {

        if (teleport) {

            console.log("Teleport has been called!", teleport)
            setAttachedRope(null)
            api.position.set(teleport[0], teleport[1], teleport[2]);
            api.velocity.set(0, 0, 0);
            setTeleport(false)

        }

    }, [teleport]);

    const { moveBackward, moveForward, moveRight, moveLeft, jump, shift: isShifting, crouch } = useKeyboard()

    const [lastMove, setLastMove] = useState("Right");
    useEffect(() => {
        if (moveRight) {
            setLastMove("Right")
        }
        if (moveLeft) {
            setLastMove("Left")
        }
    }, [moveRight, moveLeft])

    const { camera } = useThree()

    const [ref, api] = useSphere(() => ({
        mass: 1,
        args: [0.5],
        position: [0, 2, 0],
        userData: { tag: 'player' }
    }))

    const material = new THREE.MeshPhysicalMaterial({
        color: 'red',
    });

    const vel = useRef([0, 0, 0])
    useEffect(() => {
        api.velocity.subscribe((v) => vel.current = v)
    }, [api.velocity])

    const pos = useRef([0, 0, 0])
    useEffect(() => {

        api.position.subscribe((p) => {

            pos.current = p

            if (p[1] < -15) {
                console.log("Y position below 0. Reset player.");

                api.position.set(
                    0, 10, 0
                );

                setPlayerDisabled(false)

                camera.lookAt(0, 0, -50);
                api.velocity.set(0, 0, 0);
            }

            if (playerModelRef.current) {
                playerModelRef.current.position.set(...p);
            }

        })

    }, [api.position])

    // useEffect(() => {
    //     console.log("Shift", isShifting)
    //     setShift(isShifting)
    // }, [isShifting])

    useFrame(({ clock }) => {

        if (playerDisabled) {
            if (cameraMode == "Player") {
                camera.position.copy(new Vector3(pos.current[0], pos.current[1] + 8, 50))
                camera.lookAt(new Vector3(pos.current[0], pos.current[1], 0))
            }
            return
        }

        if (attachedRope) {
            if (moveForward) ropeHeight.current -= 0.1
            if (moveBackward) ropeHeight.current += 0.1
            ropeHeight.current = Math.max(1, Math.min(ropeHeight.current, attachedRope.length))

            const time = clock.getElapsedTime();
            const angle = Math.sin(time * attachedRope.swingSpeed) * attachedRope.swingAmplitude;
            
            const pivot = new Vector3(...attachedRope.position)
            const offset = new Vector3(0, -ropeHeight.current, 0)
            offset.applyAxisAngle(new Vector3(0, 0, 1), angle)
            
            const newPos = pivot.clone().add(offset)
            
            api.position.set(newPos.x, newPos.y, newPos.z)
            api.velocity.set(0, 0, 0)

            if (cameraMode == "Player") {
                camera.position.copy(new Vector3(newPos.x, newPos.y + 8, 50))
                camera.lookAt(new Vector3(newPos.x, newPos.y, 0))
            }

            if ((jump || touchControls.jump)) {
                console.log("Jump off rope")
                setAttachedRope(null)
                setLastRopeDetachTime(Date.now())

                const w = attachedRope.swingSpeed;
                const A = attachedRope.swingAmplitude;
                const L = ropeHeight.current;
                
                const thetaDot = A * w * Math.cos(time * w);
                
                const vx = L * Math.cos(angle) * thetaDot;
                const vy = L * Math.sin(angle) * thetaDot;

                api.velocity.set(vx, vy + JUMP_FORCE, 0)

                if (touchControls.jump) {
                    setTouchControls({ ...touchControls, jump: false })
                }
            }
            return
        }

        if (cameraMode == "Player") {
            camera.position.copy(new Vector3(pos.current[0], pos.current[1] + 8, 50))
            camera.lookAt(new Vector3(pos.current[0], pos.current[1], 0))
        }

        let posX = 0
        if (pos.current[0]) {
            posX = myToFixed(pos.current[0], 2)
        }

        // console.log(pos.current[1])
        let posY = 0
        if (pos.current[1]) {
            posY = myToFixed(pos.current[1], 2)
        }

        let posZ = 0
        if (pos.current[2]) {
            posZ = myToFixed(pos.current[2], 2)
        }

        // console.log(posX)

        let newLocation = new Vector3(posX, posY, posZ)

        if (JSON.stringify(lastLocation) !== JSON.stringify(newLocation)) {
            // console.log(newLocation, lastLocation)
            setPlayerLocation(newLocation)
            lastLocation = newLocation
        }
        // else {
        //     console.log("location unchanged")
        // }

        // if (pos.current[1] > maxHeight) {
        //     setMaxHeight(pos.current[1].toFixed(2))
        // }

        if (pos.current[0] > maxDistanceTraveled) {
            setMaxDistanceTraveled(pos.current[0])
        }

        const direction = new Vector3()

        const frontVector = new Vector3(
            0,
            0,
            // Disabled for now
            // (moveBackward ? 1 : 0) - (moveForward ? 1 : 0)
            0
        )

        const sideVector = new Vector3(
            (moveLeft || touchControls.left ? 1 : 0) - (moveRight || touchControls.right ? 1 : 0),
            0,
            0,
        )

        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .multiplyScalar(SPEED * (shift ? 2 : 1))
        // .applyEuler(camera.rotation)

        api.velocity.set(direction.x, vel.current[1], direction.z)

        if ((jump || touchControls.jump) && Math.abs(vel.current[1]) < 0.05) {

            console.log("Jump understood")

            api.velocity.set(vel.current[0], JUMP_FORCE, vel.current[2])

            if (
                touchControls.jump
                // ||
                // touchControls.left
                // ||
                // touchControls.right
            ) {
                setTouchControls({
                    ...touchControls,
                    jump: false,
                    // left: false,
                    // right: false
                })
            }
        }

    })

    return (
        <group>

            <mesh
                ref={ref}
                // {...props}
                // position={position}
                material={material}
            >
                <sphereGeometry args={[0.5, 32, 32]} />
    
            </mesh>

            <group ref={playerModelRef}>
                <ModelKingMen
                    scale={3}
                    rotation={[
                        0, 
                        lastMove == "Right" ? degToRad(90) : degToRad(-90),
                        0
                    ]}
                    position={[0, -0.5, 0]}
                />
            </group>

        </group>
    )
}

export default PlayerBase
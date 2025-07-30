import { useFrame, useThree } from "@react-three/fiber"
import { useSphere } from "@react-three/cannon"
import { memo, useEffect, useRef, useState } from "react"
import { Vector3 } from "three"
import * as THREE from 'three';
import { useKeyboard } from "@/hooks/useKeyboard"

import { Model as ModelKingMen } from "@/components/Models/King";

import { useControllerStore } from '@/hooks/useControllerStore';
import { useControlsStore, useGameStore } from "@/hooks/useGameStore";
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
        maxHeight, setMaxHeight,
        shift, setShift,
    } = useGameStore()

    const {
        touchControls, setTouchControls
    } = useControlsStore()

    const { controllerState, setControllerState } = useControllerStore()

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

    // useEffect(() => {

    //     if (teleport) {

    //         console.log("Teleport has been called!", teleport)
    //         api.position.set(teleport[0], teleport[1], teleport[2]);
    //         setTeleport(false)

    //     }

    // }, [teleport]);

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
        position: [0, 2, 0]
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

    useFrame(() => {

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

        if (pos.current[1] > maxHeight) {
            setMaxHeight(pos.current[1].toFixed(2))
        }

        const direction = new Vector3()

        const frontVector = new Vector3(
            0,
            0,
            (moveBackward ? 1 : 0) - (moveForward ? 1 : 0)
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
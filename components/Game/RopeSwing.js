import { createContext, createRef, forwardRef, memo, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Canvas, useFrame, useThree } from "@react-three/fiber"

import { Debug, Physics, useBox, useCylinder, useSphere } from "@react-three/cannon";
import { useGameStore } from "@/hooks/useGameStore";

export default function RopeSwing({ args, position, rotation }) {

    const groupRef = useRef();
    const swingSpeed = 2; // Adjust the speed of the swing
    const swingAmplitude = Math.PI / 6; // Adjust the angle range (e.g., 30 degrees)

    // const enemeyRef = useRef();
    const climbSpeed = 1; // Speed of the enemy's climb
    const climbRange = args[2] / 2;

    const setAttachedRope = useGameStore(state => state.setAttachedRope)
    const setPlayerDisabled = useGameStore(state => state.setPlayerDisabled)

    const [enemyRef, enemyApi] = useSphere(() => ({
        mass: 0,
        type: 'Kinematic',
        args: [1],
        position: position,
        onCollide: (e) => {
            if (e.body.userData?.tag === 'player' && useGameStore.getState().attachedRope) {
                console.log("Enemy collided with player on rope!");
                setPlayerDisabled(true)
                setAttachedRope(null)
            }
        }
    }))

    const [ref, api] = useCylinder(() => ({
        mass: 0,
        type: 'Kinematic',
        args: args,
        position: [position[0], position[1] - args[2] / 2, position[2]],
        onCollide: (e) => {
            // console.log("Player collided with the rope swing, stick player to swing!")
            const { attachedRope, lastRopeDetachTime, playerDisabled } = useGameStore.getState();
            if (e.body.userData?.tag === 'player' && !attachedRope && !playerDisabled) {
                // TODO - Delay should be unique to last rope, each rope should generate unique id on mount and use this to track in store?
                if (Date.now() - lastRopeDetachTime < 200) return;
                console.log("Attaching to rope")
                setAttachedRope({
                    position: position,
                    swingSpeed: swingSpeed,
                    swingAmplitude: swingAmplitude,
                    length: args[2]
                })
            }
        }
    }))

    useFrame(({ clock }) => {

        const time = clock.getElapsedTime();
        const angle = Math.sin(time * swingSpeed) * swingAmplitude;

        if (groupRef.current) {
            // const time = clock.getElapsedTime();
            // Update rotation on the X-axis to create a back-and-forth motion
            groupRef.current.rotation.z = angle;
        }

        const r = args[2] / 2;
        const xOffset = r * Math.sin(angle);
        const yOffset = -r * Math.cos(angle);

        api.position.set(
            position[0] + xOffset,
            position[1] + yOffset,
            position[2]
        )
        api.rotation.set(0, 0, angle)

        // Enemy climbing movement
        // if (enemeyRef.current) {
        //     const climbPosition = Math.sin(time * climbSpeed) * climbRange; // Oscillates between -climbRange and climbRange
        //     enemeyRef.current.position.set(0, climbPosition, 0); // Move along Y-axis in groupRef's local space
        // }

        const climbPosition = -climbRange + Math.sin(time * climbSpeed) * climbRange;
        
        const xEnemy = position[0] - climbPosition * Math.sin(angle);
        const yEnemy = position[1] + climbPosition * Math.cos(angle);
        const zEnemy = position[2];

        enemyApi.position.set(xEnemy, yEnemy, zEnemy);

    });

    return (
        <group rotation={rotation}>

            <mesh ref={ref} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="saddlebrown" />
            </mesh>

            <group ref={groupRef} position={position}>

                <mesh position={[0, -args[2] / 2, 0]} castShadow>
                    <cylinderGeometry args={args} />
                    <meshStandardMaterial color="green" />
                </mesh>

                {/* <mesh ref={enemeyRef} castShadow>
                    <sphereGeometry args={[1, 10, 10]} />
                    <meshStandardMaterial color="red" />
                </mesh> */}

            </group>

            <mesh ref={enemyRef} castShadow>
                <sphereGeometry args={[1, 10, 10]} />
                <meshStandardMaterial color="red" />
            </mesh>

        </group>
    )

}
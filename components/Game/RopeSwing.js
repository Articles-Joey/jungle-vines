import { createContext, createRef, forwardRef, memo, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Canvas, useFrame, useThree } from "@react-three/fiber"

import { Debug, Physics, useBox, useCylinder, useSphere } from "@react-three/cannon";
import { useGameStore } from "@/hooks/useGameStore";
import { useStore } from "@/hooks/useStore";
import { ModelSpider } from "../Models/Spider";

function RopeEnemy({ position, args, swingSpeed, swingPhase, swingAmplitude }) {

    const seed = useStore(state => state.seed);

    const setAttachedRope = useGameStore(state => state.setAttachedRope)
    const setPlayerDisabled = useGameStore(state => state.setPlayerDisabled)

    // const climbSpeed = 1;
    const climbSpeed = useMemo(() => {
        const s = Number(seed) || 0;
        // Use a pseudo-random function based on seed and position
        const rand = Math.abs(Math.sin(s + position[0] * 12.9898 + position[1] * 78.233));
        return 0.2 + rand * 0.8; // Speed between 0.2 and 1.0
    }, [seed, position]);

    const climbRange = args[2] / 2;

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

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime();
        const angle = Math.sin(time * swingSpeed + swingPhase) * swingAmplitude;

        const climbPosition = -climbRange + Math.sin(time * climbSpeed) * climbRange;

        const xEnemy = position[0] - climbPosition * Math.sin(angle);
        const yEnemy = position[1] + climbPosition * Math.cos(angle);
        const zEnemy = position[2];

        enemyApi.position.set(xEnemy, yEnemy, zEnemy);
    })

    return (
        <group ref={enemyRef}>
            <ModelSpider scale={0.5} />
        </group>
    )
}

export default function RopeSwing({
    args = [0.1, 0.1, 15, 8],
    position,
    rotation,
    swingSpeed: propSwingSpeed,
    swingPhase: propSwingPhase,
    hasEnemy: propHasEnemy
}) {

    const groupRef = useRef();

    const { swingSpeed, swingPhase, hasEnemy } = useMemo(() => ({
        swingSpeed: propSwingSpeed ?? (1.5 + Math.random() * 1), // Random speed between 1.5 and 2.5
        swingPhase: propSwingPhase ?? (Math.random() * Math.PI * 2), // Random starting point
        hasEnemy: propHasEnemy ?? (Math.random() > 0.5) // 50% chance of enemy
    }), [propSwingSpeed, propSwingPhase, propHasEnemy])

    const swingAmplitude = Math.PI / 6; // Adjust the angle range (e.g., 30 degrees)

    // const enemeyRef = useRef();
    const climbSpeed = 1; // Speed of the enemy's climb
    const climbRange = args[2] / 2;

    const setAttachedRope = useGameStore(state => state.setAttachedRope)
    const setPlayerDisabled = useGameStore(state => state.setPlayerDisabled)

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
                    swingPhase: swingPhase,
                    swingAmplitude: swingAmplitude,
                    length: args[2]
                })
            }
        }
    }))

    useFrame(({ clock }) => {

        const time = clock.getElapsedTime();
        const angle = Math.sin(time * swingSpeed + swingPhase) * swingAmplitude;

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

    });

    return (
        <group rotation={rotation}>

            {/* Fixed Anchor */}
            <mesh position={position} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="saddlebrown" />
            </mesh>

            {/* Moving Collision Body */}
            <mesh ref={ref} visible={false}>
                <cylinderGeometry args={args} />
            </mesh>

            <group ref={groupRef} position={position}>

                <mesh position={[0, -args[2] / 2, 0]} castShadow>
                    <cylinderGeometry args={args} />
                    <meshStandardMaterial color="green" />
                </mesh>

            </group>

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
    )

}
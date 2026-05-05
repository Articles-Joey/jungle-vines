import { Canvas, useFrame, useThree } from "@react-three/fiber"

import { Debug, Physics, useBox, useCylinder, useSphere } from "@react-three/cannon";
import { useGameStore } from "@/hooks/useGameStore";
import { ModelBat } from "../Models/Bat";
import { degToRad } from "three/src/math/MathUtils";
import { useStore } from "@/hooks/useStore";

export default function FlyingEnemy({  args = [1, 1, 1], position = [0, 4, 0] }) {

    const debug = useStore(state => state.debug);

    const setTeleport = useGameStore(state => state.setTeleport)
    const setPlayerDisabled = useGameStore(state => state.setPlayerDisabled)
    const setAttachedRope = useGameStore(state => state.setAttachedRope)

    const [ref, api] = useBox(() => ({
        mass: 0,
        type: 'Dynamic',
        args: args,
        position: position,
        onCollide: (e) => {
            if (e.body.userData?.tag === 'player') {
                console.log("Player collided with a flying enemy!")
                setPlayerDisabled(true)
                setAttachedRope(null)
            }
        }
    }))

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime();
        const cycleDuration = 5 * 4; // Time it takes to move from x=50 to x=0 and reset
        const progress = time % cycleDuration; // Get progress within the current cycle

        let xPosition;
        if (progress < cycleDuration) {
            // Animate x from 50 to 0
            xPosition = 200 - (progress / cycleDuration) * 200;
        } else {
            // Instant jump back to x = 200
            xPosition = 200;
        }

        // Update position via the physics API
        api.position.set(xPosition, position[1], position[2]);
    });

    return (
        <mesh ref={ref} castShadow>

            {debug && <>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="red" />
            </>}

            <group
                rotation={[0, 0, degToRad(60)]}
            >
                <ModelBat 
                    rotation={[0, Math.PI / -2, 0]}
                    position={[0, -2, 0]}
                />
            </group>

        </mesh>
    )

}
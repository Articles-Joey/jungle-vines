import { Canvas, useFrame, useThree } from "@react-three/fiber"

import { Debug, Physics, useBox, useCylinder, useSphere } from "@react-three/cannon";
import { useGameStore } from "@/hooks/useGameStore";

export default function FlyingEnemy({  args = [1, 1, 1], position = [0, 4, 0] }) {

    const setTeleport = useGameStore(state => state.setTeleport)
    const setPlayerDisabled = useGameStore(state => state.setPlayerDisabled)

    const [ref, api] = useBox(() => ({
        mass: 0,
        type: 'Dynamic',
        args: args,
        position: position,
        onCollide: (e) => {
            if (e.body.userData?.tag === 'player') {
                console.log("Player collided with a flying enemy!")
                setPlayerDisabled(true)
            }
        }
    }))

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime();
        const cycleDuration = 5; // Time it takes to move from x=50 to x=0 and reset
        const progress = time % cycleDuration; // Get progress within the current cycle

        let xPosition;
        if (progress < cycleDuration) {
            // Animate x from 50 to 0
            xPosition = 50 - (progress / cycleDuration) * 50;
        } else {
            // Instant jump back to x = 50
            xPosition = 50;
        }

        // Update position via the physics API
        api.position.set(xPosition, position[1], position[2]);
    });

    return (
        <mesh ref={ref} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="red" />
        </mesh>
    )

}
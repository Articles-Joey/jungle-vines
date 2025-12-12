import React, { useState } from 'react';
import { useBox } from '@react-three/cannon';
import { useGameStore } from '@/hooks/useGameStore';

export default function Star({ position, value }) {
    const [collected, setCollected] = useState(false);
    const increaseScore = useGameStore(state => state.increaseScore);

    const [ref] = useBox(() => ({
        isSensor: true, // Prevents physical interaction (bouncing/stopping), only detects overlap
        position,
        args: [0.5, 0.5, 0.5],
        onCollide: (e) => {
            if (!collected) {
                // Check if the colliding body is the player
                // We check for the 'player' tag in userData to ensure only the player collects it
                if (e.body.userData && e.body.userData.tag === 'player') {
                    setCollected(true);
                    increaseScore(value);
                    
                    // Play a sound effect if desired
                    // const audio = new Audio("/audio/collect.mp3");
                    // audio.play();
                }
            }
        }
    }));

    if (collected) return null;

    return (
        <mesh ref={ref}>
            <dodecahedronGeometry args={[0.4, 0]} />
            <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={0.5} />
        </mesh>
    );
}

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ModelQuaterniusFishingShark } from '../Models/Shark';
import { degToRad } from 'three/src/math/MathUtils';

const BobbingShark = ({ position, speed, offset, scale = 2 }) => {
    const ref = useRef();
    // Initial Y position is taken from the passed position
    const initialY = position[1];

    useFrame(({ clock }) => {
        if (ref.current) {
            // Bobbing motion: sin wave based on time, speed, and random offset
            // Amplitude is set to 1.5, can be adjusted or passed as prop
            const yOffset = Math.sin(clock.getElapsedTime() * speed + offset) * 1.5;
            ref.current.position.y = initialY + yOffset;
        }
    });

    return (
        <group ref={ref} position={position}>
            <ModelQuaterniusFishingShark 
                scale={scale} 
                rotation={[0, degToRad(-90), 0]} 
            />
        </group>
    );
};

const BobbingSharkField = ({ count = 10, range = [100, 0, 20], basePosition = [0, -15, 0] }) => {
    const sharks = useMemo(() => {
        return new Array(count).fill(0).map((_, i) => {
            return {
                position: [
                    basePosition[0] + (Math.random() - 0.5) * range[0],
                    basePosition[1],
                    basePosition[2] + (Math.random() - 0.5) * range[2]
                ],
                speed: 0.5 + Math.random() * 1.5, // Random speed between 0.5 and 2
                offset: Math.random() * Math.PI * 2, // Random starting phase
                key: i
            };
        });
    }, [count, range, basePosition]);

    return (
        <>
            {sharks.map(shark => (
                <BobbingShark 
                    key={shark.key} 
                    position={shark.position} 
                    speed={shark.speed} 
                    offset={shark.offset} 
                />
            ))}
        </>
    );
};

export default BobbingSharkField;

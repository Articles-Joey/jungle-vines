import React, { useMemo } from 'react';
import RopeSwing from './RopeSwing';
import Star from './Star';
import { useStore } from '@/hooks/useStore';

export default function ProcedurallyGeneratedMapElements({ 
    // seed = 12345, 
    count = 10, 
    range = [100, 20], // [Total X distance, Y variation range]
    startPosition = [0, 10, 0] 
}) {

    const seed = useStore(state => state.seed);

    const ropes = useMemo(() => {
        // Simple LCG (Linear Congruential Generator) for deterministic randomness
        const m = 2147483647;
        const a = 16807;
        let state = seed % m;
        if (state === 0) state = 1;

        const random = () => {
            state = (a * state) % m;
            return (state - 1) / (m - 1);
        };

        const items = [];
        // Calculate average step size to cover the X range
        const avgStepX = range[0] / count;
        
        let currentX = startPosition[0];
        
        for (let i = 0; i < count; i++) {
            // Move X forward by a random amount around the average step
            // This ensures we cover roughly the range[0] distance but with variation
            const stepX = avgStepX * (0.5 + random()); 
            currentX += stepX;
            
            // Calculate Y position
            // Randomly offset from the start Y position within the Y range
            // (random() - 0.5) gives -0.5 to 0.5
            const yOffset = (random() - 0.5) * range[1];
            const currentY = startPosition[1] + yOffset;
            
            // Generate rope properties deterministically
            const hasEnemy = random() > 0.5;
            const swingSpeed = 1.5 + random() * 1;
            const swingPhase = random() * Math.PI * 2;

            items.push({
                position: [currentX, currentY, startPosition[2]],
                hasEnemy,
                swingSpeed,
                swingPhase
            });
        }
        
        return items;
    }, [seed, count, range, startPosition]);

    const stars = useMemo(() => {
        // Simple LCG (Linear Congruential Generator) for deterministic randomness
        const m = 2147483647;
        const a = 16807;
        // Offset seed for stars so they don't align exactly with ropes
        let state = (seed + 12345) % m;
        if (state === 0) state = 1;

        const random = () => {
            state = (a * state) % m;
            return (state - 1) / (m - 1);
        };

        const items = [];
        // Calculate average step size to cover the X range
        const avgStepX = range[0] / count;
        
        let currentX = startPosition[0];
        
        for (let i = 0; i < count; i++) {
            // Move X forward by a random amount around the average step
            const stepX = avgStepX * (0.5 + random()); 
            currentX += stepX;
            
            // Calculate Y position
            const yOffset = (random() - 0.5) * range[1];
            const currentY = startPosition[1] + yOffset;
            
            // Generate star value: 1, 5, or 10
            const valRand = random();
            let value = 1;
            if (valRand > 0.9) value = 10;
            else if (valRand > 0.6) value = 5;

            items.push({
                position: [currentX, currentY, startPosition[2]],
                value
            });
        }
        
        return items;
    }, [seed, count, range, startPosition]);

    return (
        <>
            {ropes.map((rope, i) => (
                <group key={i}>
                    <mesh position={rope.position}>
                        <sphereGeometry args={[0.5, 16, 16]} />
                        <meshStandardMaterial color="red" />
                    </mesh>
                    <RopeSwing 
                        position={rope.position}
                        hasEnemy={rope.hasEnemy}
                        swingSpeed={rope.swingSpeed}
                        swingPhase={rope.swingPhase}
                    />
                </group>
            ))}
            {stars.map((star, i) => (
                <Star 
                    key={`star-${i}`} 
                    position={star.position} 
                    value={star.value} 
                />
            ))}
        </>
    )
}
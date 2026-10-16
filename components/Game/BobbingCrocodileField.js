import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

import { ModelCrocodile } from "../Models/Crocodile";

import { degToRad } from "three/src/math/MathUtils";

const BobbingCrocodile = ({ position, speed, offset, scale = 0.01 }) => {
    const ref = useRef();
    // Initial Y position is taken from the passed position
    const initialY = position[1];

    useFrame(({ clock }) => {
        if (ref.current) {
            // Bobbing motion: sin wave based on time, speed, and random offset
            // Amplitude is set to 1.5, can be adjusted or passed as prop
            const yOffset =
                Math.sin(clock.getElapsedTime() * speed + offset) * 1.5;
            ref.current.position.y = initialY + yOffset;
        }
    });

    return (
        <group
            ref={ref}
            position={position}
        >
            <ModelCrocodile
                scale={scale}
                rotation={[0, degToRad(-90), 0]}
            />
        </group>
    );
};

const BobbingCrocodileField = ({ animals: crocodiles = [] }) => {
    return (
        <>
            {crocodiles.map((crocodile) => (
                <BobbingCrocodile
                    key={crocodile.key}
                    position={crocodile.position}
                    speed={crocodile.speed}
                    offset={crocodile.offset}
                />
            ))}
        </>
    );
};

export default BobbingCrocodileField;

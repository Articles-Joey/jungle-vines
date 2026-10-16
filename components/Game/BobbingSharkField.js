import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ModelQuaterniusFishingShark } from "../Models/Shark";

const BobbingShark = ({
    position,
    speed,
    offset,
    scale = 2,
    rotationY = 0,
}) => {
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
            <ModelQuaterniusFishingShark
                scale={scale}
                rotation={[0, rotationY, 0]}
            />
        </group>
    );
};

const BobbingSharkField = ({ animals: sharks = [] }) => {
    return (
        <>
            {sharks.map((shark) => (
                <BobbingShark
                    key={shark.key}
                    position={shark.position}
                    speed={shark.speed}
                    offset={shark.offset}
                    rotationY={shark.rotationY}
                />
            ))}
        </>
    );
};

export default BobbingSharkField;

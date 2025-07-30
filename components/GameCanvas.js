import { createContext, createRef, forwardRef, memo, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Sky, useDetectGPU, useTexture, OrbitControls, Cylinder, QuadraticBezierLine, Text } from "@react-three/drei";

import { NearestFilter, RepeatWrapping, TextureLoader, Vector3 } from "three";
// import GameGrid from "./GameGrid";
// import Tree from "@/components/Games/Epcot/Tree";
// import Witch from "../Race Game/PlayerModels/Witch";
// import Duck from "../Race Game/PlayerModels/Duck";
// import { Star } from "../Race Game/Star";

// import Sand from '../USA Tycoon/Floors/Sand';
// import { Cannon } from "./Models/Cannon";
// import { PaintBucket } from "./Models/PaintBucket";
// import { Farm } from "./Models/Farm";
import { Physics, useBox, useSphere } from "@react-three/cannon";
import { degToRad } from "three/src/math/MathUtils";
// import WaterPlane from "./WaterPlane";
import { useSlingshotStore } from "@/hooks/useSlingshotStore";
import { ModelKennyNLGraveyardRocksTall } from "@/components/Models/rocks-tall";
import { useHotkeys } from "react-hotkeys-hook";
import { MathUtils } from "three";

import { ModelKennyNLMiniGolfFlagRed } from "@/components/Models/flag-red";
import generateRandomInteger from "@/util/generateRandomInteger";

function GameCanvas(props) {

    // const GPUTier = useDetectGPU()

    // const {
    //     playerRotation,
    //     setPlayerRotation
    // } = useCannonStore(state => ({
    //     playerRotation: state.playerRotation,
    //     setPlayerRotation: state.setPlayerRotation
    // }));

    const {
        handleCameraChange,
        gameState,
        players,
        move,
        cameraInfo,
        server
    } = props;

    const [[a, b, c, d, e]] = useState(() => [...Array(5)].map(createRef))

    return (
        <Canvas camera={{ position: [-10, 40, 40], fov: 50 }}>

            <OrbitControls
            // autoRotate={gameState?.status == 'In Lobby'}
            />

            {/* <Sky
                // distance={450000}
                sunPosition={[0, 10, 0]}
            // inclination={0}
            // azimuth={0.25}
            // {...props} 
            /> */}

            <ambientLight intensity={5} />
            <spotLight intensity={30000} position={[-50, 100, 50]} angle={5} penumbra={1} />

            {/* <pointLight position={[-10, -10, -10]} /> */}

            <FlatRing
                args={[3, 5, 32]}
                color={"red"}
                position={[800, 0.5, 0]}
            />

            <FlatRing
                args={[6, 8, 32]}
                color={"red"}
                position={[800, 0.5, 0]}
            />

            {/* <WaterPlane
                position={[0, 0, 0]}
            /> */}

            <Rocks />

            <ModelKennyNLMiniGolfFlagRed
                position={[800, 0, 0]}
                scale={10}
                rotation={[0, degToRad(-90), 0]}
            />

            <Physics>

                <PlayerProjectile />

                <Ground />

                {/* <Walls /> */}

            </Physics>

        </Canvas>
    )
}

export default memo(GameCanvas)

const FlatRing = ({ args, color, position }) => {
    return (
        <mesh
            rotation={[degToRad(-90), 0, 0]}
            position={position}
        >
            <ringGeometry args={args} /> {/* Inner radius, outer radius, segments */}
            <meshStandardMaterial color={color} /> {/* side={2} makes it visible on both sides */}
        </mesh>
    );
};

function Ground() {

    const [ref, api] = useBox(() => ({
        mass: 0,
        type: 'Static',
        args: [1000, 0.5, 100],
        position: [400, 0, 0],
    }))

    return (
        <mesh ref={ref} castShadow>
            <boxGeometry args={[1000, 0.5, 100]} />
            {/* <BeachBall /> */}
            <meshStandardMaterial color="beige" />
        </mesh>
    )

}

function Rocks() {

    return (
        <group>

            {[...Array(40)].map((item, i) => {
                return (
                    <ModelKennyNLGraveyardRocksTall
                        key={i}
                        scale={generateRandomInteger(50,80)}
                        position={[0 + (i * 20), 0, -70]}
                    />
                )
            })}

            {[...Array(40)].map((item, i) => {
                return (
                    <ModelKennyNLGraveyardRocksTall
                        key={i}
                        scale={generateRandomInteger(30, 100)}
                        position={[0 + (i * 20), 0, 70]}
                    />
                )
            })}

            {/* <ModelKennyNLGraveyardRocksTall
                scale={50}
                position={[0, 0, 100]}
            />
            <ModelKennyNLGraveyardRocksTall
                scale={50}
                position={[-100, 0, 0]}
            />
            <ModelKennyNLGraveyardRocksTall
                scale={50}
                position={[100, 0, 0]}
            /> */}

        </group>
    )

}

// function Walls() {

//     const [ref, api] = useBox(() => ({
//         mass: 0,
//         type: 'Static',
//         args: [100, 0.5, 100],
//         position: [0, 0, 0],
//     }))

//     return (
//         <mesh ref={ref} castShadow>
//             <boxGeometry args={[100, 0.5, 100]} />
//             {/* <BeachBall /> */}
//             <meshStandardMaterial color="#08e8de" />
//         </mesh>
//     )

// }

function PlayerProjectile() {

    const puckRef = useRef()

    const [ref, api] = useSphere(() => ({
        mass: 10,
        // type: 'Dynamic',
        args: [1, 1, 1],
        position: [-40, 5, 0],
    }))

    const {
        hitRotation,
        setHitRotation,
        hitPower,
        setHitPower
    } = useSlingshotStore(state => ({
        hitRotation: state.hitRotation,
        setHitRotation: state.setHitRotation,
        hitPower: state.hitPower,
        setHitPower: state.setHitPower,
    }));

    // const nudgePuck = () => {
    //     // Apply impulse or force to the ball
    //     api.applyImpulse([10, 0, 10], [0, 0, 0]); // Pushes the ball along the x-axis
    // };

    const nudgePuck = () => {
        // Convert hitRotation to radians
        const radians = MathUtils.degToRad(hitRotation);

        // Calculate impulse direction based on rotation
        const impulseX = Math.sin(radians) * hitPower; // Z-axis points forward in Three.js, so sin affects X
        const impulseZ = Math.cos(radians) * hitPower; // Cos affects Z

        // Apply impulse to the ball in the calculated direction
        api.applyImpulse([impulseX, 0, impulseZ], [0, 0, 0]); // Apply impulse at the center of the object
    };

    useHotkeys(['Enter'], () => {
        console.log("Launch?")
        nudgePuck()
    });

    // Freeze when movement dies down
    // useEffect(() => {
    //     const unsubscribe = api.velocity.subscribe(([vx, vy, vz]) => {
    //         const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
    //         if (speed < 2) {
    //             api.velocity.set(0, 0, 0);
    //             api.angularVelocity.set(0, 0, 0);
    //         }
    //     });

    //     return () => unsubscribe(); // Clean up subscription when the component unmounts
    // }, [api.velocity]); // Only re-run if api.velocity changes

    useFrame(() => {

        if (puckRef.current) {
            // Get the current position of the sphere from the physics API
            api.position.subscribe((position) => {

                puckRef.current.position.set(...position);

                if (position[1] < -10) {
                    console.log("Y position below 0. Stopping physics.");
                    api.mass.set(0); // Set mass to 0 to deactivate physics
                    api.velocity.set(0, 0, 0); // Stop all motion
                    api.angularVelocity.set(0, 0, 0); // Stop rotation
                }

            });
        }

        // if (ref.current) {
        //     // Monitor velocity of the sphere
        //     api.velocity.subscribe(([vx, vy, vz]) => {
        //         const speed = Math.sqrt(vx * vx + vy * vy + vz * vz); // Calculate total speed

        //         console.log("speed", speed)

        //         // Stop the sphere if its speed is below a threshold (e.g., 0.1)
        //         if (speed < 2) {
        //             console.log("Stopping sphere due to low velocity.");
        //             api.velocity.set(0, 0, 0); // Stop linear velocity
        //             api.angularVelocity.set(0, 0, 0); // Stop angular velocity
        //         }
        //     });
        // }

    })

    return (
        <group>

            <mesh ref={ref} castShadow>

                <sphereGeometry args={[1, 10, 10]} />
                {/* <BeachBall /> */}
                <meshStandardMaterial color="red" />

            </mesh>

            <group ref={puckRef} rotation={[0, degToRad(hitRotation), 0]}>
                <mesh castShadow>
                    <cylinderGeometry args={[3, 3, 1]} />
                    {/* <BeachBall /> */}
                    <meshStandardMaterial color="black" />
                </mesh>
                <mesh castShadow position={[0, 0, (hitPower / 2)]} rotation={[-Math.PI / 2, 0, 0]}>
                    <cylinderGeometry
                        args={[0.5, 0.5, hitPower]}
                    />
                    <meshStandardMaterial color="black" />

                    <mesh
                        castShadow
                        position={[0, -(hitPower / 2), 0]}
                        rotation={[0, 0, 0]}
                    >
                        <cylinderGeometry
                            args={[3, 0, 5]}
                        />
                        <meshStandardMaterial color="black" />
                    </mesh>

                </mesh>
            </group>

        </group>
    )

}
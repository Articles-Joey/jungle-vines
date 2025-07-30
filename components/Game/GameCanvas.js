import { createContext, createRef, forwardRef, memo, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Sky, useDetectGPU, useTexture, OrbitControls, Cylinder, QuadraticBezierLine, Text, Image } from "@react-three/drei";

import { NearestFilter, RepeatWrapping, TextureLoader, Vector3 } from "three";

import { Debug, Physics, useBox, useCylinder, useSphere } from "@react-three/cannon";
import { degToRad } from "three/src/math/MathUtils";

// import { Model as ModelKingMen } from "@/components/Games/Assets/Quaternius/men/King";
import Player from "./Player";
import WaterPlane from "./WaterPlane";
import { ModelQuaterniusFishingPiranha } from "@/components/Models/Piranha";
import { ModelQuaterniusFishingShark } from "@/components/Models/Shark";

const texture = new TextureLoader().load(`${process.env.NEXT_PUBLIC_CDN}games/Race Game/grass.jpg`)

const GrassPlane = () => {

    const width = 110; // Set the width of the plane
    const height = 170; // Set the height of the plane

    texture.magFilter = NearestFilter;
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.repeat.set(5, 5)

    return (
        <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                <planeGeometry attach="geometry" args={[width, height]} />
                <meshStandardMaterial attach="material" map={texture} />
            </mesh>
        </>
    );
};

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
        <Canvas camera={{ position: [0, 10, 30], fov: 50 }}>

            <OrbitControls
            // autoRotate={gameState?.status == 'In Lobby'}
            />

            <Sky
                // distance={450000}
                sunPosition={[0, 10, 0]}
            // inclination={0}
            // azimuth={0.25}
            // {...props} 
            />

            <ambientLight intensity={3} />
            {/* <spotLight intensity={30000} position={[0, -10, 0]} angle={5} penumbra={1} /> */}

            <Image
                url={`${process.env.NEXT_PUBLIC_CDN}games/Jungle Vines/jungle-vines-game-background.svg`}
                scale={[100, 50]}
                position={[0, 10, -40]}
            />

            {/* <pointLight position={[-10, -10, -10]} /> */}

            {/* <FlatRing
                args={[3, 5, 32]}
                color={"gold"}
            />

            <FlatRing
                args={[6, 8, 32]}
                color={"white"}
            /> */}

            {/* <Rocks /> */}

            {/* <ModelGoogleIglooOpen
                position={[100, 30, 0]}
                scale={3}
                rotation={[0, degToRad(-55), 0]}
            />

            <ModelKennyNLMiniGolfFlagRed
                position={[100, 30, 10]}
                scale={10}
                rotation={[0, degToRad(-90), 0]}
            /> */}

            <WaterPlane
                position={[0, -15, 0]}
            />

            <ModelQuaterniusFishingShark
                position={[10, -15, 0]}
                scale={2}
                rotation={[0, degToRad(-90), 0]}
            />

            <Physics>

                <Debug>

                    <Platform
                        position={[-10, -1, 0]}
                        args={[25, 1, 2.5]}
                        color={"saddlebrown"}
                    />

                    <Platform
                        position={[-10, 0, 0]}
                        args={[25, 1, 2.5]}
                        color={"green"}
                    />

                    <Player />

                    {/* <ModelKingMen
                    scale={3}
                    rotation={[0, degToRad(90), 0]}
                    position={[0, 0.5, 0]}
                /> */}

                    <RopeSwing
                        position={[
                            10,
                            15,
                            0
                        ]}
                        args={[0.1, 0.1, 15, 8]}
                    />

                    <RopeSwing
                        position={[
                            20,
                            15,
                            0
                        ]}
                        args={[0.1, 0.1, 15, 8]}
                    />

                    <Platform
                        position={[50, -1, 0]}
                        args={[25, 1, 2.5]}
                        color={"saddlebrown"}
                    />

                    <Platform
                        position={[50, 0, 0]}
                        args={[25, 1, 2.5]}
                        color={"green"}
                    />

                    <FlyingEnemy

                    />

                </Debug>

            </Physics>

        </Canvas>
    )
}

export default memo(GameCanvas)

function Platform({ args, position, color }) {

    const [ref, api] = useBox(() => ({
        mass: 0,
        type: 'Static',
        args: args,
        position: position,
    }))

    return (
        <mesh ref={ref} castShadow>
            <boxGeometry args={args} />
            <meshStandardMaterial color={color} />
        </mesh>
    )

}

function RopeSwing({ args, position, rotation }) {

    const groupRef = useRef();
    const swingSpeed = 2; // Adjust the speed of the swing
    const swingAmplitude = Math.PI / 6; // Adjust the angle range (e.g., 30 degrees)

    const enemeyRef = useRef();
    const climbSpeed = 1; // Speed of the enemy's climb
    const climbRange = args[2] / 2;

    const [ref, api] = useCylinder(() => ({
        mass: 0,
        type: 'Dynamic',
        args: args,
        position: position,
        onCollide: () => {
            console.log("Player collided with the rope swing, stick player to swing!")
        }
    }))

    useFrame(({ clock }) => {

        const time = clock.getElapsedTime();

        if (groupRef.current) {
            // const time = clock.getElapsedTime();
            // Update rotation on the X-axis to create a back-and-forth motion
            groupRef.current.rotation.z = Math.sin(time * swingSpeed) * swingAmplitude;
        }

        // Enemy climbing movement
        if (enemeyRef.current) {
            const climbPosition = Math.sin(time * climbSpeed) * climbRange; // Oscillates between -climbRange and climbRange
            enemeyRef.current.position.set(0, climbPosition, 0); // Move along Y-axis in groupRef's local space
        }

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

                <mesh ref={enemeyRef} castShadow>
                    <sphereGeometry args={[1, 10, 10]} />
                    <meshStandardMaterial color="red" />
                </mesh>

            </group>

        </group>
    )

}

function FlyingEnemy({  args = [1, 1, 1], position = [0, 4, 0] }) {

    const [ref, api] = useBox(() => ({
        mass: 0,
        type: 'Dynamic',
        args: args,
        position: position,
        onCollide: () => {
            console.log("Player collided with a flying enemy!")
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
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
import FlyingEnemy from "./FlyingEnemy";
import RopeSwing from "./RopeSwing";

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
                            10,
                            0
                        ]}
                        args={[0.1, 0.1, 15, 8]}
                    />

                    <RopeSwing
                        position={[
                            20,
                            10,
                            0
                        ]}
                        args={[0.1, 0.1, 15, 8]}
                    />

                    <RopeSwing
                        position={[
                            30,
                            10,
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
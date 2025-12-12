// import { createContext, createRef, forwardRef, memo, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

// import { Canvas, useFrame, useThree } from "@react-three/fiber"
// import { Sky, useDetectGPU, useTexture, OrbitControls, Cylinder, QuadraticBezierLine, Text, Image } from "@react-three/drei";

// import { NearestFilter, RepeatWrapping, TextureLoader, Vector3 } from "three";

import { Debug, Physics, useBox, useCylinder, useSphere } from "@react-three/cannon";
// import { degToRad } from "three/src/math/MathUtils";

// import { Model as ModelKingMen } from "@/components/Games/Assets/Quaternius/men/King";
// import Player from "./Player";
// import WaterPlane from "./WaterPlane";
// import { ModelQuaterniusFishingPiranha } from "@/components/Models/Piranha";
// import { ModelQuaterniusFishingShark } from "@/components/Models/Shark";
// import FlyingEnemy from "./FlyingEnemy";
// import RopeSwing from "./RopeSwing";

export default function Platform({ args, position, color }) {

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
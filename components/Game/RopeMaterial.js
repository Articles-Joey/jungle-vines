import { useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { RepeatWrapping, SRGBColorSpace } from "three";

export default function RopeMaterial({ length, radius }) {
    const source = useTexture("/textures/rope.svg");
    const texture = useMemo(() => {
        // Clone the cached image so different rope lengths can repeat independently.
        const map = source.clone();
        map.wrapS = RepeatWrapping;
        map.wrapT = RepeatWrapping;
        map.colorSpace = SRGBColorSpace;
        map.repeat.set(1, length / (2 * Math.PI * radius));
        map.anisotropy = 8;
        map.needsUpdate = true;
        return map;
    }, [source, length, radius]);

    useEffect(() => () => texture.dispose(), [texture]);

    return (
        <meshStandardMaterial
            map={texture}
            bumpMap={texture}
            bumpScale={radius * 0.035}
            roughness={0.95}
            metalness={0}
        />
    );
}

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry, DoubleSide, Object3D } from "three";
import { useStore } from "@/hooks/useStore";

const COUNT = 900;
const vertexShader = /* glsl */ `
    uniform float uTime;
    varying float vHeight;
    varying float vVariation;
    void main() {
        vHeight = uv.y;
        vec4 p = instanceMatrix * vec4(position, 1.0);
        float phase = instanceMatrix[3].x * 0.7 + instanceMatrix[3].z * 1.2;
        float bend = uv.y * uv.y;
        p.x += sin(uTime * 1.7 + phase) * bend * 0.22;
        p.z += cos(uTime * 1.3 + phase * 0.5) * bend * 0.12;
        vVariation = sin(phase * 2.3) * 0.5 + 0.5;
        gl_Position = projectionMatrix * modelViewMatrix * p;
    }
`;
const fragmentShader = /* glsl */ `
    uniform float uBrightness;
    varying float vHeight;
    varying float vVariation;
    void main() {
        vec3 root = vec3(0.025, 0.10, 0.012);
        vec3 tip = mix(vec3(0.18, 0.38, 0.045), vec3(0.35, 0.49, 0.095), vVariation);
        gl_FragColor = vec4(mix(root, tip, vHeight) * uBrightness, 1.0);
        #include <colorspace_fragment>
    }
`;

function bladeGeometry() {
    const geometry = new BufferGeometry();
    geometry.setAttribute(
        "position",
        new BufferAttribute(
            new Float32Array([
                -0.07, 0, 0, 0.07, 0, 0, -0.035, 0.55, 0.03, 0.035, 0.55, 0.03,
                0, 1.1, 0.14,
            ]),
            3,
        ),
    );
    geometry.setAttribute(
        "uv",
        new BufferAttribute(
            new Float32Array([0, 0, 1, 0, 0, 0.5, 1, 0.5, 0.5, 1]),
            2,
        ),
    );
    geometry.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4]);
    geometry.computeVertexNormals();
    return geometry;
}

export default function PlatformGrass({
    width,
    depth,
    y,
    sampleSurface,
    count = COUNT,
    seed = 7921,
}) {
    const darkMode = useStore((state) => state.darkMode);
    const mesh = useRef();
    const geometry = useMemo(bladeGeometry, []);
    const uniforms = useMemo(
        () => ({ uTime: { value: 0 }, uBrightness: { value: 1 } }),
        [],
    );

    useLayoutEffect(() => {
        let randomSeed = seed >>> 0;
        const random = () => {
            randomSeed = (Math.imul(randomSeed, 1664525) + 1013904223) >>> 0;
            return randomSeed / 4294967296;
        };
        const transform = new Object3D();
        for (let index = 0; index < count; index += 1) {
            const u = random();
            const v = random();
            if (sampleSurface) {
                sampleSurface(u, v, transform.position);
            } else {
                transform.position.set(
                    (u - 0.5) * (width - 0.2),
                    y,
                    (v - 0.5) * (depth - 0.2),
                );
            }
            transform.position.y += 0.005;
            transform.rotation.y = random() * Math.PI * 2;
            const size = 0.6 + random() * 0.5;
            transform.scale.set(size, size, size);
            transform.updateMatrix();
            mesh.current.setMatrixAt(index, transform.matrix);
        }
        mesh.current.instanceMatrix.needsUpdate = true;
        mesh.current.computeBoundingSphere();
        mesh.current.boundingSphere.radius += 0.3;
    }, [width, depth, y, sampleSurface, count, seed]);
    useEffect(() => () => geometry.dispose(), [geometry]);
    useLayoutEffect(() => {
        uniforms.uBrightness.value = darkMode ? 0.6 : 1;
    }, [darkMode, uniforms]);
    useFrame(({ clock }) => {
        uniforms.uTime.value = clock.elapsedTime;
    });

    return (
        <instancedMesh
            ref={mesh}
            args={[geometry, null, count]}
        >
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                side={DoubleSide}
                toneMapped={false}
            />
        </instancedMesh>
    );
}

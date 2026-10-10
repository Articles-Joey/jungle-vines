import { useEffect, useMemo } from "react";
import { CylinderGeometry } from "three";
import RopeMaterial from "./RopeMaterial";

const STRAND_COUNT = 3;
const STRAND_GROOVE_DEPTH = 0.14;
const TWIST_PITCH_IN_RADII = 6;
const RADIAL_SEGMENTS = 48;
const SEGMENTS_PER_TURN = 24;

export default function RopeMesh({ length, radius, position }) {
    const geometry = useMemo(() => {
        const pitch = radius * TWIST_PITCH_IN_RADII;
        const heightSegments = Math.max(
            1,
            Math.min(512, Math.ceil((length / pitch) * SEGMENTS_PER_TURN)),
        );
        const meshGeometry = new CylinderGeometry(
            radius,
            radius,
            length,
            RADIAL_SEGMENTS,
            heightSegments,
            false,
        );
        const vertices = meshGeometry.attributes.position;
        const uv = meshGeometry.attributes.uv;
        const sideVertexCount = (heightSegments + 1) * (RADIAL_SEGMENTS + 1);

        for (let i = 0; i < vertices.count; i++) {
            const x = vertices.getX(i);
            const y = vertices.getY(i);
            const z = vertices.getZ(i);
            const twist = (y / pitch) * Math.PI * 2;
            const angle = Math.atan2(x, z);
            // Three rounded strands wind around a solid core. The outer radius
            // stays within the existing cylinder collider, including the end caps.
            const profile =
                1 -
                STRAND_GROOVE_DEPTH +
                STRAND_GROOVE_DEPTH * Math.cos(STRAND_COUNT * (angle - twist));
            vertices.setXYZ(i, x * profile, y, z * profile);

            if (i < sideVertexCount) {
                // Keep fibers aligned with the spiral instead of stretching a
                // diagonal stripe around an otherwise straight cylinder.
                uv.setX(i, STRAND_COUNT * (uv.getX(i) - y / pitch));
            }
        }

        meshGeometry.computeVertexNormals();
        return meshGeometry;
    }, [length, radius]);

    useEffect(() => () => geometry.dispose(), [geometry]);

    return (
        <mesh
            position={position}
            geometry={geometry}
            castShadow
            receiveShadow
        >
            <RopeMaterial
                length={length}
                radius={radius}
            />
        </mesh>
    );
}

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
    CylinderGeometry,
    DynamicDrawUsage,
    Sphere,
    Vector3,
} from "three";
import RopeMaterial from "./RopeMaterial";
import { getLocalRopePoint } from "./ropeMotion";

const STRAND_COUNT = 3;
const STRAND_GROOVE_DEPTH = 0.14;
const TWIST_PITCH_IN_RADII = 6;
const RADIAL_SEGMENTS = 24;
const SEGMENTS_PER_TURN = 12;

export function OverheadRope({ radius, length = 30, swingLength = 0 }) {
    return (
        <RopeMesh
            length={length}
            radius={radius}
            position={[0, length / 2, 0]}
            twistOffset={(length + swingLength) / 2}
        />
    );
}

export default function RopeMesh({
    length,
    radius,
    position,
    motion,
    twistOffset = 0,
}) {
    const data = useMemo(() => {
        const pitch = radius * TWIST_PITCH_IN_RADII;
        const heightSegments = Math.max(
            1,
            Math.min(128, Math.ceil((length / pitch) * SEGMENTS_PER_TURN)),
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
            // Align the spiral across the fixed and swinging sections' join.
            const strandHeight = y + twistOffset;
            const twist = (strandHeight / pitch) * Math.PI * 2;
            const angle = Math.atan2(x, z);
            // Three rounded strands wind around a solid core. The outer radius
            // stays within the grab sensors, including the end caps.
            const profile =
                1 -
                STRAND_GROOVE_DEPTH +
                STRAND_GROOVE_DEPTH * Math.cos(STRAND_COUNT * (angle - twist));
            vertices.setXYZ(i, x * profile, y, z * profile);

            if (i < sideVertexCount) {
                // Keep fibers aligned with the spiral instead of stretching a
                // diagonal stripe around an otherwise straight cylinder.
                uv.setX(i, STRAND_COUNT * (uv.getX(i) - strandHeight / pitch));
            }
        }

        meshGeometry.computeVertexNormals();
        if (motion) {
            vertices.setUsage(DynamicDrawUsage);
            meshGeometry.attributes.normal.setUsage(DynamicDrawUsage);
            meshGeometry.boundingSphere = new Sphere(
                new Vector3(),
                length + radius,
            );
        }
        return {
            geometry: meshGeometry,
            positions: vertices.array.slice(),
            normals: meshGeometry.attributes.normal.array.slice(),
            heightSegments,
            frames: Array.from({ length: heightSegments + 1 }, () => ({
                center: new Vector3(),
                tangent: new Vector3(),
                normal: new Vector3(),
                binormal: new Vector3(),
            })),
            before: new Vector3(),
            after: new Vector3(),
        };
    }, [length, radius, motion, twistOffset]);

    useEffect(() => () => data.geometry.dispose(), [data]);

    useFrame(({ clock }) => {
        if (!motion) return;
        const { geometry, frames, heightSegments, before, after } = data;
        const time = clock.elapsedTime;
        const tangentStep = motion.segmentLength * 0.25;
        for (let ring = 0; ring <= heightSegments; ring += 1) {
            const distance = (ring / heightSegments) * length;
            const frame = frames[ring];
            getLocalRopePoint(motion, distance, time, frame.center);
            getLocalRopePoint(motion, distance - tangentStep, time, before);
            getLocalRopePoint(motion, distance + tangentStep, time, after);
            frame.tangent.subVectors(after, before).normalize();
            frame.normal.set(-frame.tangent.y, frame.tangent.x, 0).normalize();
            frame.binormal.crossVectors(frame.tangent, frame.normal).normalize();
        }

        const vertices = geometry.attributes.position;
        const normals = geometry.attributes.normal;
        for (let index = 0; index < vertices.count; index += 1) {
            const offset = index * 3;
            const x = data.positions[offset];
            const y = data.positions[offset + 1];
            const z = data.positions[offset + 2];
            const ring = Math.max(
                0,
                Math.min(
                    heightSegments,
                    Math.round(((length / 2 - y) / length) * heightSegments),
                ),
            );
            const { center, tangent, normal, binormal } = frames[ring];
            vertices.setXYZ(
                index,
                center.x + normal.x * x + binormal.x * z,
                center.y + normal.y * x + binormal.y * z,
                center.z + normal.z * x + binormal.z * z,
            );
            const nx = data.normals[offset];
            const ny = data.normals[offset + 1];
            const nz = data.normals[offset + 2];
            normals.setXYZ(
                index,
                normal.x * nx - tangent.x * ny + binormal.x * nz,
                normal.y * nx - tangent.y * ny + binormal.y * nz,
                normal.z * nx - tangent.z * ny + binormal.z * nz,
            );
        }
        vertices.needsUpdate = true;
        normals.needsUpdate = true;
    });

    return (
        <mesh
            position={position}
            geometry={data.geometry}
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

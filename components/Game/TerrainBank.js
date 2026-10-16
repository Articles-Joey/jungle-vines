import { useCallback, useEffect, useMemo } from "react";
import {
    BufferAttribute,
    BufferGeometry,
    ShapeUtils,
    Vector2,
    Vector3,
} from "three";
import { useStore } from "@/hooks/useStore";
import createPlatformMaterial from "./platformMaterial";
import PlatformGrass from "./PlatformGrass";

const TOP_DEPTH_SEGMENTS = 8;
const CLIFF_SEGMENTS = 5;
const CROSS_SECTION_STEPS = [
    ...Array.from(
        { length: TOP_DEPTH_SEGMENTS + 1 },
        (_, index) => index / TOP_DEPTH_SEGMENTS,
    ),
    ...Array.from(
        { length: CLIFF_SEGMENTS },
        (_, index) => 1 + (index + 1) / CLIFF_SEGMENTS,
    ),
    3,
    4,
];

function hash(x, z, seed) {
    let value = Math.imul(x ^ seed, 374761393) ^ Math.imul(z, 668265263);
    value = Math.imul(value ^ (value >>> 13), 1274126177);
    return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function noise(x, z, seed) {
    const ix = Math.floor(x);
    const iz = Math.floor(z);
    const fx = x - ix;
    const fz = z - iz;
    const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
    const v = fz * fz * fz * (fz * (fz * 6 - 15) + 10);
    const a = hash(ix, iz, seed);
    const b = hash(ix + 1, iz, seed);
    const c = hash(ix, iz + 1, seed);
    const d = hash(ix + 1, iz + 1, seed);
    return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
}

function createProfile({ depth, height, submergedDepth, seed, offsetX }) {
    const bankSeed = (Number(seed) || 0) | 0;
    const warpedX = (x) => {
        const worldX = x + offsetX;
        return worldX + (noise(worldX * 0.023, 0, bankSeed + 17) - 0.5) * 35;
    };
    const front = (x) =>
        depth * (0.65 + noise(warpedX(x) * 0.047, 0, bankSeed + 41) * 0.95) +
        (noise((x + offsetX) * 0.19, 0, bankSeed + 73) - 0.5) * 2.8;
    const top = (x, v) => {
        const coarse = noise(warpedX(x) * 0.071, 0, bankSeed + 101);
        const ridges = noise(warpedX(x) * 0.09, v * 2.4, bankSeed + 151);
        const detail = noise((x + offsetX) * 0.28, v * 6.5, bankSeed + 193);
        return (
            height * (0.45 + coarse * 0.85 + (1 - v) * 0.4) +
            Math.sin(v * Math.PI) * (ridges - 0.5) * height * 0.8 +
            (detail - 0.5) * 0.65
        );
    };

    // Coordinates span the whole bank, so neighboring sections sample the
    // same shoreline and height field at their shared boundary.
    const point = (x, progress, target) => {
        const t = ((progress % 4) + 4) % 4;
        const edge = front(x);
        if (t <= 1) {
            target.set(x, top(x, t), -1 + (edge + 1) * t);
            return 1;
        }
        if (t <= 2) {
            const fraction = t - 1;
            const erosion =
                Math.sin(fraction * Math.PI) *
                (noise((x + offsetX) * 0.17, 0, bankSeed + 239) - 0.5) * 2.2;
            target.set(
                x,
                top(x, 1) * (1 - fraction) - submergedDepth * fraction,
                edge + erosion + fraction * 2.5,
            );
            return 1 - fraction;
        }
        if (t <= 3) {
            const fraction = t - 2;
            target.set(
                x,
                -submergedDepth,
                (edge + 2.5) * (1 - fraction) - fraction,
            );
            return 0;
        }
        const fraction = t - 3;
        target.set(x, -submergedDepth * (1 - fraction) + top(x, 0) * fraction, -1);
        return fraction;
    };

    return { point, seed: bankSeed };
}

function createBankGeometry(profile, start, width, closeStart, closeEnd) {
    const columns = Math.max(2, Math.ceil(width / 0.8));
    const rows = CROSS_SECTION_STEPS.length;
    const positions = [];
    const normals = [];
    const heights = [];
    const indices = [];
    const point = new Vector3();
    const before = new Vector3();
    const after = new Vector3();
    const alongX = new Vector3();
    const alongSection = new Vector3();
    const normal = new Vector3();

    for (let column = 0; column <= columns; column += 1) {
        const x = start + (column / columns) * width;
        for (const t of CROSS_SECTION_STEPS) {
            heights.push(profile.point(x, t, point));
            positions.push(point.x, point.y, point.z);
            profile.point(x - 0.01, t, before);
            profile.point(x + 0.01, t, after);
            alongX.subVectors(after, before);
            profile.point(x, t - 0.002, before);
            profile.point(x, t + 0.002, after);
            alongSection.subVectors(after, before);
            // Shared finite differences also keep lighting continuous at joins.
            normal.crossVectors(alongSection, alongX).normalize();
            normals.push(normal.x, normal.y, normal.z);
        }
    }

    for (let column = 0; column < columns; column += 1) {
        for (let row = 0; row < rows - 1; row += 1) {
            const a = column * rows + row;
            const b = a + rows;
            indices.push(a, a + 1, b, b, a + 1, b + 1);
        }
    }

    const closeEndFace = (x, direction) => {
        const offset = positions.length / 3;
        const contour = [];
        for (const t of CROSS_SECTION_STEPS.slice(0, -1)) {
            heights.push(profile.point(x, t, point));
            positions.push(point.x, point.y, point.z);
            normals.push(direction, 0, 0);
            contour.push(new Vector2(point.z, point.y));
        }
        for (const [a, b, c] of ShapeUtils.triangulateShape(contour, [])) {
            const normalX =
                (contour[b].y - contour[a].y) * (contour[c].x - contour[a].x) -
                (contour[b].x - contour[a].x) * (contour[c].y - contour[a].y);
            if (normalX * direction > 0) {
                indices.push(offset + a, offset + b, offset + c);
            } else {
                indices.push(offset + a, offset + c, offset + b);
            }
        }
    };
    if (closeStart) closeEndFace(start, -1);
    if (closeEnd) closeEndFace(start + width, 1);

    const geometry = new BufferGeometry();
    geometry.setAttribute(
        "position",
        new BufferAttribute(new Float32Array(positions), 3),
    );
    geometry.setAttribute(
        "normal",
        new BufferAttribute(new Float32Array(normals), 3),
    );
    geometry.setAttribute(
        "aPlatformHeight",
        new BufferAttribute(new Float32Array(heights), 1),
    );
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();
    return { geometry, columns, rows };
}

function sampleBankTop(data, u, v, target) {
    const column = u * data.columns;
    const row = v * TOP_DEPTH_SEGMENTS;
    const ix = Math.min(data.columns - 1, Math.floor(column));
    const iz = Math.min(TOP_DEPTH_SEGMENTS - 1, Math.floor(row));
    const fx = column - ix;
    const fz = row - iz;
    const a = ix * data.rows + iz;
    const b = a + data.rows;
    const positions = data.geometry.attributes.position;
    // Sample the actual triangles so blades stay planted in the deformed mesh.
    const corners = fx + fz <= 1 ? [a, b, a + 1] : [b, a + 1, b + 1];
    const weights =
        fx + fz <= 1
            ? [1 - fx - fz, fx, fz]
            : [1 - fz, 1 - fx, fx + fz - 1];
    target.set(0, 0, 0);
    for (let index = 0; index < 3; index += 1) {
        target.x += positions.getX(corners[index]) * weights[index];
        target.y += positions.getY(corners[index]) * weights[index];
        target.z += positions.getZ(corners[index]) * weights[index];
    }
    return target;
}

function BankSection({ profile, material, start, width, closeStart, closeEnd }) {
    const data = useMemo(
        () => createBankGeometry(profile, start, width, closeStart, closeEnd),
        [profile, start, width, closeStart, closeEnd],
    );
    useEffect(() => () => data.geometry.dispose(), [data]);
    const sampleSurface = useCallback(
        (u, v, target) => {
            const across = 0.004 + u * 0.992;
            const towardShore = 0.02 + (1 - (1 - v) ** 2) * 0.96;
            return sampleBankTop(data, across, towardShore, target);
        },
        [data],
    );

    return (
        <>
            <mesh
                geometry={data.geometry}
                material={material}
                castShadow
                receiveShadow
            />
            <PlatformGrass
                sampleSurface={sampleSurface}
                count={Math.max(200, Math.round(width * 28))}
                seed={profile.seed + Math.round(start * 113)}
            />
        </>
    );
}

// Position the back edge at water level; width extends along +X and depth along +Z.
export default function TerrainBank({
    position = [0, 0, 0],
    width = 50,
    sectionWidth = 50,
    depth = 14,
    height = 5,
    submergedDepth = 4,
    seed = 12345,
}) {
    const darkMode = useStore((state) => state.darkMode);
    const offsetX = position[0];
    const profile = useMemo(
        () => createProfile({ depth, height, submergedDepth, seed, offsetX }),
        [depth, height, submergedDepth, seed, offsetX],
    );
    const material = useMemo(
        () =>
            createPlatformMaterial("grass", height + submergedDepth, darkMode, {
                useHeightAttribute: true,
            }),
        [height, submergedDepth, darkMode],
    );
    useEffect(() => () => material.dispose(), [material]);

    return (
        <group position={position}>
            {Array.from(
                { length: Math.ceil(width / sectionWidth) },
                (_, index) => (
                    <BankSection
                        key={index}
                        profile={profile}
                        material={material}
                        start={index * sectionWidth}
                        width={Math.min(sectionWidth, width - index * sectionWidth)}
                        closeStart={index === 0}
                        closeEnd={(index + 1) * sectionWidth >= width}
                    />
                ),
            )}
        </group>
    );
}

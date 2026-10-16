import { Matrix4, Vector3 } from "three";

export const ROPE_SEGMENT_COUNT = 16;

export function createRopeMotion({
    length,
    swingSpeed,
    swingPhase,
    swingAmplitude,
    bendAmplitude,
}) {
    return {
        length,
        swingSpeed,
        swingPhase,
        swingAmplitude,
        bendAmplitude,
        segmentLength: length / ROPE_SEGMENT_COUNT,
        points: Array.from(
            { length: ROPE_SEGMENT_COUNT + 1 },
            () => new Vector3(),
        ),
        matrixWorld: new Matrix4(),
        inverseMatrixWorld: new Matrix4(),
        localGrabPoint: new Vector3(),
        time: null,
    };
}

export function updateRopeMotion(rope, time) {
    if (rope.time === time) return;
    rope.time = time;
    rope.points[0].set(0, 0, 0);

    const phase = time * rope.swingSpeed + rope.swingPhase;
    for (let index = 0; index < ROPE_SEGMENT_COUNT; index += 1) {
        const fraction = (index + 0.5) / ROPE_SEGMENT_COUNT;
        const flexibility = Math.sin(fraction * Math.PI / 2);
        // Motion travels down the rope with a delay. Every section retains its
        // length while the changing angles give the free end a softer follow-through.
        const angle = (
            Math.sin(phase - fraction * 1.15) *
                rope.swingAmplitude *
                (0.55 + fraction * 0.65) +
            Math.sin(phase * 1.7 - fraction * 4 + rope.swingPhase) *
                rope.bendAmplitude *
                fraction
        ) * flexibility;
        const previous = rope.points[index];
        rope.points[index + 1].set(
            previous.x + Math.sin(angle) * rope.segmentLength,
            previous.y - Math.cos(angle) * rope.segmentLength,
            0,
        );
    }
}

export function getLocalRopePoint(rope, distance, time, target) {
    updateRopeMotion(rope, time);
    const clampedDistance = Math.max(0, Math.min(distance, rope.length));
    const index = Math.min(
        ROPE_SEGMENT_COUNT - 1,
        Math.floor(clampedDistance / rope.segmentLength),
    );
    const fraction =
        (clampedDistance - index * rope.segmentLength) /
        rope.segmentLength;
    return target.lerpVectors(rope.points[index], rope.points[index + 1], fraction);
}

export function getRopePoint(rope, distance, time, target) {
    return getLocalRopePoint(rope, distance, time, target).applyMatrix4(
        rope.matrixWorld,
    );
}

export function getClosestRopeDistance(rope, worldPoint, time) {
    updateRopeMotion(rope, time);
    const point = rope.localGrabPoint.copy(worldPoint).applyMatrix4(
        rope.inverseMatrixWorld,
    );
    let closestDistanceSquared = Infinity;
    let closestDistance = 0;

    for (let index = 0; index < ROPE_SEGMENT_COUNT; index += 1) {
        const start = rope.points[index];
        const end = rope.points[index + 1];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dz = end.z - start.z;
        const fraction = Math.max(
            0,
            Math.min(
                1,
                ((point.x - start.x) * dx +
                    (point.y - start.y) * dy +
                    (point.z - start.z) * dz) /
                    (rope.segmentLength * rope.segmentLength),
            ),
        );
        const distanceSquared =
            (point.x - start.x - dx * fraction) ** 2 +
            (point.y - start.y - dy * fraction) ** 2 +
            (point.z - start.z - dz * fraction) ** 2;
        if (distanceSquared < closestDistanceSquared) {
            closestDistanceSquared = distanceSquared;
            closestDistance = (index + fraction) * rope.segmentLength;
        }
    }

    return closestDistance;
}

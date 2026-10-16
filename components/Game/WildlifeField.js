import { useMemo } from "react";
import BobbingSharkField from "./BobbingSharkField";
import BobbingCrocodileField from "./BobbingCrocodileField";
import { seededRandom } from "./mapLayout";

// Distances are measured on the water's X/Z plane, unaffected by bobbing.
// Between different species, the larger of their two minimums is enforced.
export const WILDLIFE_CONFIG = {
    sharks: { count: 10, minDistance: 14, range: [160, 60], y: -15 },
    crocodiles: { count: 10, minDistance: 18, range: [160, 100], y: -17 },
};

function createWildlife(seed, center, config) {
    const random = seededRandom(`${seed}:wildlife:${center}`);
    const occupied = [];
    const result = { sharks: [], crocodiles: [] };
    for (const [species, settings] of Object.entries(config)) {
        const animals = result[species];
        // A crowded configuration produces fewer animals, never overlapping
        // animals or an unbounded placement loop.
        for (
            let attempt = 0;
            attempt < settings.count * 100 && animals.length < settings.count;
            attempt++
        ) {
            const x = center + (random() - 0.5) * settings.range[0];
            const z = (random() - 0.5) * settings.range[1];
            if (
                occupied.some(
                    (other) =>
                        Math.hypot(x - other.x, z - other.z) <
                        Math.max(settings.minDistance, other.minDistance),
                )
            )
                continue;
            occupied.push({ x, z, minDistance: settings.minDistance });
            animals.push({
                key: `${species}-${animals.length}`,
                position: [x, settings.y, z],
                speed: 0.5 + random() * 1.5,
                offset: random() * Math.PI * 2,
                rotationY: random() * Math.PI * 2,
            });
        }
    }
    return result;
}

export default function WildlifeField({
    seed,
    worldCenter,
    originX = 0,
    config = WILDLIFE_CONFIG,
}) {
    const animals = useMemo(() => {
        const layout = createWildlife(seed, worldCenter, config);
        for (const group of Object.values(layout)) {
            for (const animal of group) animal.position[0] -= originX;
        }
        return layout;
    }, [seed, worldCenter, originX, config]);
    return (
        <>
            <BobbingSharkField animals={animals.sharks} />
            <BobbingCrocodileField animals={animals.crocodiles} />
        </>
    );
}

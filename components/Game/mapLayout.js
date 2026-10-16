// Course geometry is a pure function of mode, seed and absolute chunk index.
// Never seed a chunk from its mount order: revisiting it must recreate the same map.
export const CHUNK_LENGTH = 64;
export const GAME_MODES = ["easy", "medium", "hard", "endless"];
export const MAP_CONFIG = {
    easy: {
        label: "Easy",
        chunks: 2,
        platformWidth: 20,
        enemies: 1,
        enemySpeed: 6,
    },
    medium: {
        label: "Medium",
        chunks: 4,
        platformWidth: 16,
        enemies: 2,
        enemySpeed: 8,
    },
    hard: {
        label: "Hard",
        chunks: 6,
        platformWidth: 12,
        enemies: 3,
        enemySpeed: 10,
    },
    endless: {
        label: "Endless",
        chunks: null,
        platformWidth: 16,
        enemies: 2,
        enemySpeed: 8,
    },
};

// Percentages use 0–100. Each seed controls which ropes get enemies, separately
// from the map seed: changing enemy settings never changes rope geometry/motion.
export const ROPE_ENEMY_CONFIG = {
    easy: { percentage: 25, ropeEnemySeed: "easy-bugs-2" },
    medium: { percentage: 35, ropeEnemySeed: "medium-bugs-1" },
    hard: { percentage: 50, ropeEnemySeed: "hard-bugs-1" },
    endless: {
        percentage: 20,
        ropeEnemySeed: "endless-bugs-1",
        increaseEvery: 256, // Absolute course meters, independent of chunk loading.
        increaseBy: 5, // Percentage points per distance interval.
        maxPercentage: 50, // May be lowered; the hard ceiling is always 50%.
    },
};

// Minimum distance between rope pivots, in world units. Heights and speeds
// are independent seeded ranges; raising minSpacing reduces rope count.
export const ROPE_LAYOUT = {
    easy: {
        minSpacing: 8,
        pivotY: [18, 27],
        tipY: [-6, -1],
        speed: [0.7, 1.15],
        amplitude: [0.45, 0.6],
    },
    medium: {
        minSpacing: 10,
        pivotY: [17, 30],
        tipY: [-7, 0],
        speed: [0.75, 1.35],
        amplitude: [0.5, 0.7],
    },
    hard: {
        minSpacing: 13,
        pivotY: [16, 32],
        tipY: [-7, 1],
        speed: [0.8, 1.55],
        amplitude: [0.55, 0.8],
    },
    endless: {
        minSpacing: 8,
        pivotY: [17, 30],
        tipY: [-7, 0],
        speed: [0.7, 1.4],
        amplitude: [0.5, 0.75],
        spacingIncreaseEvery: 256,
        spacingIncrease: 1,
        maxSpacing: 16,
    },
};

export function seededRandom(seed) {
    let state = 2166136261;
    for (const character of String(seed)) {
        state = Math.imul(state ^ character.charCodeAt(0), 16777619);
    }
    return () => {
        state += 0x6d2b79f5;
        let value = Math.imul(state ^ (state >>> 15), 1 | state);
        value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
}

function selectEnemyRopes(mode, chunkIndex, ropeCount) {
    const settings = ROPE_ENEMY_CONFIG[mode];
    const endless = mode === "endless";
    const distance = chunkIndex * CHUNK_LENGTH;
    const percentage = endless
        ? Math.max(
              0,
              Math.min(
                  50,
                  settings.maxPercentage,
                  settings.percentage +
                      Math.floor(
                          distance / Math.max(1, settings.increaseEvery),
                      ) *
                          Math.max(0, settings.increaseBy),
              ),
          )
        : Math.max(0, Math.min(100, settings.percentage));
    // Fixed maps use a whole-level quota, rounded to the nearest rope. This
    // avoids independent low-probability rolls leaving most/all ropes empty.
    const total = endless ? ropeCount : ropeCount * MAP_CONFIG[mode].chunks;
    // Round down in endless so even a three-rope chunk never exceeds the cap.
    const enemyCount = endless
        ? Math.floor((total * percentage) / 100)
        : Math.round((total * percentage) / 100);
    const random = seededRandom(
        `${settings.ropeEnemySeed}:${mode}:${endless ? chunkIndex : "level"}`,
    );
    const candidates = Array.from({ length: total }, (_, index) => index);
    for (let index = candidates.length - 1; index > 0; index--) {
        const other = Math.floor(random() * (index + 1));
        [candidates[index], candidates[other]] = [
            candidates[other],
            candidates[index],
        ];
    }
    const offset = endless ? 0 : chunkIndex * ropeCount;
    return new Set(
        candidates
            .slice(0, enemyCount)
            .filter((index) => index >= offset && index < offset + ropeCount)
            .map((index) => index - offset),
    );
}

export function createMapChunk(mode, seed, index) {
    const config = MAP_CONFIG[mode];
    const random = seededRandom(`${seed}:${mode}:chunk:${index}`);
    const start = index * CHUNK_LENGTH;
    const layout = ROPE_LAYOUT[mode];
    const minSpacing =
        mode === "endless"
            ? Math.min(
                  layout.maxSpacing,
                  layout.minSpacing +
                      Math.floor(start / layout.spacingIncreaseEvery) *
                          layout.spacingIncrease,
              )
            : layout.minSpacing;
    const halfWidth = config.platformWidth / 2;
    // Respect the minimum across section boundaries too, over the rest platform.
    const shoreGap = Math.max(2, (minSpacing - config.platformWidth) / 2);
    const first = start + halfWidth + shoreGap;
    const last = start + CHUNK_LENGTH - halfWidth - shoreGap;
    const span = Math.max(0, last - first);
    const count = Math.max(1, Math.floor(span / minSpacing) + 1);
    const enemyRopes = selectEnemyRopes(mode, index, count);
    // Distribute only the surplus distance randomly: every gap stays >= minimum.
    const weights = Array.from({ length: count - 1 }, () => 0.5 + random());
    const totalWeight = weights.reduce((sum, value) => sum + value, 0);
    const surplus = span - (count - 1) * minSpacing;
    const sample = ([min, max]) => min + random() * (max - min);
    let x = count === 1 ? start + CHUNK_LENGTH / 2 : first;
    const ropes = Array.from({ length: count }, (_, ropeIndex) => {
        if (ropeIndex > 0)
            x += minSpacing + (surplus * weights[ropeIndex - 1]) / totalWeight;
        const y = sample(layout.pivotY);
        const endY = sample(layout.tipY);
        return {
            position: [x, y, 0],
            length: y - endY,
            swingSpeed: sample(layout.speed),
            swingPhase: random() * Math.PI * 2,
            swingAmplitude: sample(layout.amplitude),
            bendAmplitude: 0.05 + random() * 0.06,
            hasEnemy: enemyRopes.has(ropeIndex),
            variationSeed: `${seed}:${mode}:${index}:${ropeIndex}`,
        };
    });
    return { index, start, ropes, platformWidth: config.platformWidth };
}

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useScoreStore = create()(
    persist(
        (set) => ({
            levelCompletion: { easy: false, medium: false, hard: false },
            bestScores: { endless: 0, endlessBySeed: {} },
            completeLevel: (level) => {
                if (!["easy", "medium", "hard"].includes(level)) return;
                set((state) =>
                    state.levelCompletion[level]
                        ? state
                        : {
                              levelCompletion: {
                                  ...state.levelCompletion,
                                  [level]: true,
                              },
                          },
                );
            },
            recordEndlessDistance: (distance, seed) => {
                if (!Number.isFinite(distance) || distance <= 0) return;
                const meters = Math.floor(distance);
                const key = `seed:${String(seed)}`;
                set((state) => {
                    const previous = state.bestScores;
                    if (meters <= (previous.endlessBySeed[key] || 0))
                        return state;
                    return {
                        bestScores: {
                            endless: Math.max(previous.endless, meters),
                            endlessBySeed: {
                                ...previous.endlessBySeed,
                                [key]: meters,
                            },
                        },
                    };
                });
            },
        }),
        {
            name: "jungle-vines-scores",
            version: 1,
            storage: createJSONStorage(() => localStorage),
            partialize: ({ levelCompletion, bestScores }) => ({
                levelCompletion,
                bestScores,
            }),
        },
    ),
);

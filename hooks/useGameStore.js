// import { create } from 'zustand'
import { createWithEqualityFn as create } from "zustand/traditional";
import { useScoreStore } from "./useScoreStore";

export const useGameStore = create((set, get) => ({
    runMode: "easy",
    runSeed: "3",
    runStatus: "idle",
    runId: 0,
    runDistance: 0,
    originX: 0,
    spawnPosition: [0, 2, 0],
    spawnVelocity: [0, 0, 0],
    spawnCrouched: false,
    // A simulation clock survives origin shifts, but resets for each attempt.
    simulationClock: { elapsed: 0 },
    startRun: (mode = get().runMode, seed = get().runSeed) => {
        useControlsStore
            .getState()
            .setTouchControls({ jump: false, left: false, right: false });
        set((state) => ({
            runMode: mode,
            runSeed: String(seed),
            runStatus: "playing",
            runId: state.runId + 1,
            runDistance: 0,
            originX: 0,
            spawnPosition: [0, 2, 0],
            spawnVelocity: [0, 0, 0],
            spawnCrouched: false,
            simulationClock: { elapsed: 0 },
            playerLocation: false,
            playerDisabled: false,
            attachedRope: null,
            lastRopeDetachTime: 0,
            teleport: false,
            teleportAttachment: null,
            teleportPicking: false,
        }));
    },
    updateDistance: (worldX) => {
        if (!Number.isFinite(worldX)) return;
        const state = get();
        const distance = Math.max(0, Math.floor(worldX));
        if (state.runStatus !== "playing" || distance <= state.runDistance)
            return;
        set({ runDistance: distance });
        if (state.runMode === "endless") {
            useScoreStore
                .getState()
                .recordEndlessDistance(distance, state.runSeed);
        }
    },
    completeRun: () => {
        const state = get();
        if (state.runStatus !== "playing" || state.runMode === "endless")
            return;
        useScoreStore.getState().completeLevel(state.runMode);
        set({ runStatus: "completed", attachedRope: null });
    },
    endRun: () => {
        if (get().runStatus !== "playing") return;
        set({ runStatus: "dead", playerDisabled: true, attachedRope: null });
    },
    stopRun: () =>
        set({
            runStatus: "idle",
            attachedRope: null,
            playerLocation: false,
            teleportPicking: false,
        }),
    rebaseWorld: (shift, position, velocity, crouching = false) =>
        set((state) => ({
            originX: state.originX + shift,
            spawnPosition: [position.x - shift, position.y, position.z],
            spawnVelocity: [velocity.x, velocity.y, velocity.z],
            spawnCrouched: crouching,
            playerLocation: {
                x: position.x - shift,
                y: position.y,
                z: position.z,
            },
            attachedRope: null,
        })),
    cameraMode: "Player",
    setCameraMode: (newValue) => {
        set((prev) => ({
            cameraMode: newValue,
        }));
    },

    cameraResetRequest: 0,
    resetCamera: () =>
        set((state) => ({ cameraResetRequest: state.cameraResetRequest + 1 })),

    playerLocation: false,
    setPlayerLocation: (newValue) => {
        set((prev) => ({
            playerLocation: newValue,
        }));
    },

    playerDisabled: false,
    setPlayerDisabled: (newValue) => {
        if (newValue) {
            get().endRun();
            return;
        }
        set((prev) => ({
            playerDisabled: newValue,
        }));
    },

    // maxHeight: 0,
    // setMaxHeight: (newValue) => {
    //     set((prev) => ({
    //         maxHeight: newValue
    //     }))
    // },

    shift: false,
    setShift: (newValue) => {
        set((prev) => ({
            shift: newValue,
        }));
    },

    touchControls: {
        jump: false,
        left: false,
        right: false,
    },
    setTouchControls: (newValue) => {
        set((prev) => ({
            touchControls: newValue,
        }));
    },

    teleport: false,
    teleportPicking: false,
    teleportAttachment: null,
    setTeleportPicking: (enabled) =>
        set({ teleportPicking: enabled && get().runStatus === "playing" }),
    debugTeleport: (position, attachment = null) =>
        set({
            teleport: position,
            teleportAttachment: attachment,
            teleportPicking: false,
        }),
    setTeleport: (newValue) => {
        set((prev) => ({
            teleport: newValue,
        }));
    },

    attachedRope: null,
    setAttachedRope: (newValue) => {
        set((prev) => ({
            attachedRope: newValue,
        }));
    },

    lastRopeDetachTime: 0,
    setLastRopeDetachTime: (newValue) => {
        set((prev) => ({
            lastRopeDetachTime: newValue,
        }));
    },

    gameState: {},
    setGameState: (newValue) => {
        set((prev) => ({
            gameState: newValue,
        }));
    },
}));

export function getSimulationTime(fallbackClock) {
    const state = useGameStore.getState();
    return state.runStatus === "idle"
        ? fallbackClock.elapsedTime
        : state.simulationClock.elapsed;
}

export const useControlsStore = create((set) => ({
    touchControls: {
        jump: false,
        left: false,
        right: false,
    },
    setTouchControls: (newValue) => {
        set((prev) => ({
            touchControls: newValue,
        }));
    },
}));

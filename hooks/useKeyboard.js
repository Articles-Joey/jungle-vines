import { useCallback, useEffect, useState } from "react";

function actionByKey(key) {
    const keyActionMap = {
        KeyW: "moveForward",
        KeyS: "moveBackward",
        KeyA: "moveLeft",
        KeyD: "moveRight",
        Space: "jump",
        ShiftLeft: "shift",
        KeyC: "crouch",
        KeyV: "cameraView",
        Digit1: "dirt",
        Digit2: "grass",
        Digit3: "glass",
        Digit4: "wood",
        Digit5: "log",
    };
    return keyActionMap[key];
}

export const useKeyboard = (enabled = true) => {
    const [actions, setActions] = useState({
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        jump: false,
        shift: false,
        crouch: false,
        cameraView: false,
        dirt: false,
        grass: false,
        glass: false,
        wood: false,
        log: false,
    });

    const handleKeyDown = useCallback((e) => {
        if (
            e.target?.closest?.(
                "input, textarea, select, [contenteditable='true']",
            )
        )
            return;
        const action = actionByKey(e.code);
        if (action) {
            setActions((prev) => {
                if (prev[action]) return prev;
                return {
                    ...prev,
                    [action]: true,
                };
            });
        }
    }, []);

    const handleKeyUp = useCallback((e) => {
        const action = actionByKey(e.code);
        if (action) {
            setActions((prev) => {
                if (!prev[action]) return prev;
                return {
                    ...prev,
                    [action]: false,
                };
            });
        }
    }, []);

    useEffect(() => {
        if (!enabled) return;
        const clearKeys = () =>
            setActions((previous) =>
                Object.fromEntries(
                    Object.keys(previous).map((key) => [key, false]),
                ),
            );
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        window.addEventListener("blur", clearKeys);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("blur", clearKeys);
        };
    }, [enabled, handleKeyDown, handleKeyUp]);

    return actions;
};

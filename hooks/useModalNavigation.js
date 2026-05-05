import { useEffect, useRef } from 'react';

export const useModalNavigation = (elementsRef, onClose) => {
    const lastInputTime = useRef(0);

    useEffect(() => {
        let animationFrameId;

        const loop = () => {
            const gamepads = navigator.getGamepads();
            const gp = gamepads[0];

            if (gp) {
                const now = performance.now();

                if (now - lastInputTime.current > 150) {
                    const axes = gp.axes;
                    const buttons = gp.buttons;
                    const threshold = 0.5;

                    let dx = 0;
                    let dy = 0;

                    // D-Pad
                    if (buttons[12].pressed) dy = -1; // Up
                    if (buttons[13].pressed) dy = 1;  // Down
                    if (buttons[14].pressed) dx = -1; // Left
                    if (buttons[15].pressed) dx = 1;  // Right

                    // Left Stick
                    if (axes[1] < -threshold) dy = -1;
                    if (axes[1] > threshold) dy = 1;
                    if (axes[0] < -threshold) dx = -1;
                    if (axes[0] > threshold) dx = 1;

                    if (dx !== 0 || dy !== 0) {
                        lastInputTime.current = now;
                        navigate(dx, dy);
                    }

                    // A Button (Select)
                    if (buttons[0].pressed) {
                        lastInputTime.current = now;
                        const active = document.activeElement;
                        if (active && elementsRef.current.includes(active)) {
                            active.click();
                        }
                    }

                    // B Button (Close)
                    if (buttons[1].pressed) {
                        lastInputTime.current = now;
                        if (onClose) onClose();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(loop);
        };

        const navigate = (dx, dy) => {
            const els = elementsRef.current.filter(el => el && !el.disabled && el.offsetParent !== null);
            
            if (els.length === 0) return;

            let currIndex = els.indexOf(document.activeElement);
            
            if (currIndex === -1) {
                els[0].focus();
                return;
            }

            let nextIndex = currIndex;

            if (dy === 1 || dx === 1) {
                nextIndex = (currIndex + 1) % els.length;
            } else if (dy === -1 || dx === -1) {
                nextIndex = (currIndex - 1 + els.length) % els.length;
            }

            if (els[nextIndex]) {
                els[nextIndex].focus();
            }
        };

        // Focus first element on mount if nothing focused
        const els = elementsRef.current.filter(el => el && !el.disabled && el.offsetParent !== null);
        if (els.length > 0 && !els.includes(document.activeElement)) {
             els[0].focus();
        }

        animationFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [elementsRef, onClose]);
};

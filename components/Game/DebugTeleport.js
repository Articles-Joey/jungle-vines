import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { useGameStore } from "@/hooks/useGameStore";

export default function DebugTeleport({ children, enabled }) {
    const picking = useGameStore((state) => state.teleportPicking);
    const { gl } = useThree();
    const position = useMemo(() => new Vector3(), []);

    useEffect(() => {
        if (!enabled && picking)
            useGameStore.getState().setTeleportPicking(false);
        if (!enabled || !picking) return;
        const canvas = gl.domElement;
        const previous = canvas.style.cursor;
        canvas.style.cursor = "crosshair";
        const cancel = (event) => {
            if (event.key === "Escape")
                useGameStore.getState().setTeleportPicking(false);
        };
        window.addEventListener("keydown", cancel);
        return () => {
            canvas.style.cursor = previous;
            window.removeEventListener("keydown", cancel);
        };
    }, [enabled, picking, gl]);

    const pickTarget = (event) => {
        const state = useGameStore.getState();
        if (!enabled || !state.teleportPicking || event.delta > 4) return;
        event.stopPropagation();
        let target = event.object;
        let platform = null;
        let rope = null;
        while (target) {
            if (target.userData?.tag === "player") return;
            if (target.userData?.teleportPlatform) {
                platform = target.userData.teleportPlatform;
                target.getWorldPosition(position);
                break;
            }
            if (target.userData?.teleportRope) {
                rope = target.userData.teleportRope;
                break;
            }
            target = target.parent;
        }
        if (rope && rope.getBody()) {
            // Player resolves the nearest point on the actual bent rope.
            state.debugTeleport([event.point.x, event.point.y - 2.25, 0], {
                ropeBody: rope.getBody(),
                motion: rope.motion,
                length: rope.length,
            });
        } else if (platform) {
            const margin = Math.min(0.65, platform.width / 2);
            const x = Math.max(
                position.x - platform.width / 2 + margin,
                Math.min(
                    position.x + platform.width / 2 - margin,
                    event.point.x,
                ),
            );
            state.debugTeleport([x, position.y + platform.top + 0.65, 0]);
        } else {
            // The game is played in the Z=0 plane even when scenery is clicked.
            state.debugTeleport([event.point.x, event.point.y + 0.65, 0]);
        }
    };

    return <group onClick={pickTarget}>{children}</group>;
}

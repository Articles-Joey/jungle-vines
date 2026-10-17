import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
    CuboidCollider,
    RigidBody,
    useBeforePhysicsStep,
    useRapier,
} from "@react-three/rapier";
import { useMemo, useRef } from "react";
import { Frustum, Matrix4, Sphere, Vector3 } from "three";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useGameStore } from "@/hooks/useGameStore";
import { useStore } from "@/hooks/useStore";
import { ModelBat } from "../Models/Bat";
import { seededRandom } from "./mapLayout";

const screenOrigin = () => [0, 0];

export default function FlyingEnemy({ id = 0, speed = 8, yRange = [-1, 12] }) {
    const bodyRef = useRef(null);
    const modelRef = useRef(null);
    const indicatorRef = useRef(null);
    const labelRef = useRef(null);
    const overlayAnchor = useRef(null);
    const activeRef = useRef(false);
    const { rapier } = useRapier();
    const screenshotMode = useStore((state) => state.screenshotMode);
    const showPhysicsDebug = useStore(
        (state) => state.debugConfig?.showPhysicsDebug,
    );
    const scratch = useMemo(
        () => ({
            point: new Vector3(),
            view: new Vector3(),
            sphere: new Sphere(new Vector3(), 2.5),
            frustum: new Frustum(),
            projection: new Matrix4(),
        }),
        [],
    );

    // Html normally hides anchors behind the camera. Keep this screen-space
    // overlay anchored in front of it, including in first-person/orbit views.
    useFrame(({ camera }) => {
        if (!overlayAnchor.current) return;
        camera.getWorldDirection(overlayAnchor.current.position);
        overlayAnchor.current.position.add(camera.position);
    }, -1);

    useBeforePhysicsStep(() => {
        const state = useGameStore.getState();
        const body = bodyRef.current;
        if (!body || state.runStatus !== "playing") return;
        const clock = state.simulationClock;
        // Flight state survives origin shifts and has its own seeded sequence.
        clock.flights ??= {};
        const flight = (clock.flights[id] ??= {
            cycle: 0,
            nextSpawn: 4 + id * 5,
            active: false,
        });
        const playerX = state.originX + (state.playerLocation?.x ?? 0);
        if (!flight.active && clock.elapsed >= flight.nextSpawn) {
            const random = seededRandom(
                `${state.runSeed}:${state.runMode}:enemy:${id}:${flight.cycle}`,
            );
            flight.startX = playerX + 90 + random() * 15;
            flight.y = yRange[0] + random() * (yRange[1] - yRange[0]);
            flight.startedAt = clock.elapsed;
            flight.active = true;
        }
        const worldX =
            flight.startX - (clock.elapsed - flight.startedAt) * speed;
        // Use absolute course X, so origin shifts never move the despawn boundary.
        if (flight.active && worldX <= 5) {
            flight.active = false;
            flight.cycle += 1;
            flight.nextSpawn = clock.elapsed + 3 + id;
        }
        activeRef.current = flight.active;
        if (modelRef.current) modelRef.current.visible = flight.active;
        body.setNextKinematicTranslation(
            flight.active
                ? { x: worldX - state.originX, y: flight.y, z: 0 }
                : { x: 0, y: -100, z: 0 },
        );
    });

    useFrame(({ camera, size }) => {
        const indicator = indicatorRef.current;
        const body = bodyRef.current;
        const state = useGameStore.getState();
        if (!indicator || !body) return;
        if (
            !activeRef.current ||
            state.runStatus !== "playing" ||
            !state.playerLocation
        ) {
            indicator.style.display = "none";
            return;
        }
        camera.updateMatrixWorld();
        scratch.point.copy(body.translation());
        scratch.sphere.center.copy(scratch.point);
        scratch.projection.multiplyMatrices(
            camera.projectionMatrix,
            camera.matrixWorldInverse,
        );
        scratch.frustum.setFromProjectionMatrix(scratch.projection);
        if (scratch.frustum.intersectsSphere(scratch.sphere)) {
            indicator.style.display = "none";
            return;
        }
        const distance = Math.ceil(
            scratch.point.distanceTo(state.playerLocation),
        );
        scratch.view
            .copy(scratch.point)
            .applyMatrix4(camera.matrixWorldInverse);
        scratch.point.project(camera);
        const left = scratch.view.x < 0;
        const projectedY = ((1 - scratch.point.y) * size.height) / 2;
        const y = Math.max(
            28,
            Math.min(
                size.height - 28,
                Number.isFinite(projectedY) ? projectedY : size.height / 2,
            ),
        );
        indicator.style.display = "flex";
        indicator.style.left = `${left ? 10 : size.width - 10}px`;
        indicator.style.top = `${y}px`;
        indicator.style.transform = `translate(${left ? "0" : "-100%"}, -50%)`;
        labelRef.current.textContent = `${left ? "◀ " : ""}${distance} m${left ? "" : " ▶"}`;
    });

    return (
        <>
            <RigidBody
                ref={bodyRef}
                type="kinematicPosition"
                position={[0, -100, 0]}
                colliders={false}
            >
                <CuboidCollider
                    args={[0.7, 0.7, 0.7]}
                    sensor
                    activeCollisionTypes={rapier.ActiveCollisionTypes.ALL}
                    onIntersectionEnter={({ other }) => {
                        if (
                            activeRef.current &&
                            other.rigidBodyObject?.userData?.tag === "player"
                        ) {
                            useGameStore.getState().endRun();
                        }
                    }}
                />
                <group
                    ref={modelRef}
                    visible={false}
                >
                    {showPhysicsDebug && (
                        <mesh>
                            <boxGeometry args={[1.4, 1.4, 1.4]} />
                            <meshBasicMaterial
                                wireframe
                                color="red"
                            />
                        </mesh>
                    )}
                    <group rotation={[0, 0, Math.PI / 3]}>
                        <ModelBat
                            rotation={[0, -Math.PI / 2, 0]}
                            position={[0, -2, 0]}
                        />
                    </group>
                </group>
            </RigidBody>
            {!screenshotMode && (
                <group ref={overlayAnchor}>
                    <Html
                        calculatePosition={screenOrigin}
                        zIndexRange={[30, 30]}
                        style={{ pointerEvents: "none" }}
                    >
                        <div
                            ref={indicatorRef}
                            aria-label={`Incoming flying enemy ${id + 1}`}
                            style={{
                                display: "none",
                                position: "absolute",
                                alignItems: "center",
                                gap: 5,
                                whiteSpace: "nowrap",
                                background: "#29190aee",
                                color: "#ffe28a",
                                border: "1px solid #ffc55c",
                                borderRadius: 6,
                                padding: "5px 8px",
                                font: "bold 14px sans-serif",
                                pointerEvents: "none",
                            }}
                        >
                            <WarningAmberIcon fontSize="small" />
                            <span ref={labelRef} />
                        </div>
                    </Html>
                </group>
            )}
        </>
    );
}

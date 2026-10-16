import { MeshStandardMaterial } from "three";

const noiseShader = /* glsl */ `
    varying vec3 vPlatformPosition;
    varying vec3 vPlatformNormal;
    uniform float uGrassLayer;
    uniform float uPlatformHeight;
    uniform float uPlatformBrightness;

    float platformHash(vec3 p) {
        p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float platformNoise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
            mix(mix(platformHash(i), platformHash(i + vec3(1,0,0)), f.x),
                mix(platformHash(i + vec3(0,1,0)), platformHash(i + vec3(1,1,0)), f.x), f.y),
            mix(mix(platformHash(i + vec3(0,0,1)), platformHash(i + vec3(1,0,1)), f.x),
                mix(platformHash(i + vec3(0,1,1)), platformHash(i + vec3(1,1,1)), f.x), f.y), f.z);
    }
`;

// Local coordinates keep the procedural soil and grass attached to each platform.
// No generated texture or per-frame work.
export default function createPlatformMaterial(
    surface,
    height,
    darkMode,
    { useHeightAttribute = false } = {},
) {
    const material = new MeshStandardMaterial({ color: "white", roughness: 1 });
    material.onBeforeCompile = (shader) => {
        shader.uniforms.uGrassLayer = { value: surface === "grass" ? 1 : 0 };
        shader.uniforms.uPlatformHeight = { value: height };
        shader.uniforms.uPlatformBrightness = { value: darkMode ? 0.6 : 1 };
        shader.vertexShader =
            `${useHeightAttribute ? "attribute float aPlatformHeight; varying float vPlatformHeight;\n" : ""}varying vec3 vPlatformPosition; varying vec3 vPlatformNormal;\n${shader.vertexShader}`.replace(
                "#include <begin_vertex>",
                `
                #include <begin_vertex>
                vPlatformPosition = position;
                vPlatformNormal = normal;
                ${useHeightAttribute ? "vPlatformHeight = aPlatformHeight;" : ""}
            `,
            );
        shader.fragmentShader =
            `${useHeightAttribute ? "varying float vPlatformHeight;\n" : ""}${noiseShader}\n${shader.fragmentShader}`.replace(
                "#include <color_fragment>",
                /* glsl */ `
                #include <color_fragment>
                vec3 p = vPlatformPosition;
                float patches = platformNoise(p * vec3(0.55, 1.8, 0.55));
                float grain = platformNoise(p * 7.5);
                float grit = platformNoise(p * 24.0);
                float layers = sin(p.y * 19.0 + patches * 5.0) * 0.035;
                vec3 soil = mix(vec3(0.105, 0.038, 0.012), vec3(0.34, 0.17, 0.055), patches * 0.7 + grain * 0.3);
                soil *= 0.82 + grain * 0.24 + layers;
                soil += vec3(0.14, 0.115, 0.075) * smoothstep(0.81, 0.94, grit);
                vec3 grass = mix(vec3(0.025, 0.10, 0.012), vec3(0.16, 0.32, 0.035), patches);
                grass *= 0.8 + grain * 0.4;
                float heightFraction = ${useHeightAttribute ? "vPlatformHeight" : "p.y / max(uPlatformHeight, 0.001) + 0.5"};
                float fringe = smoothstep(0.78, 0.98, heightFraction + (grain - 0.5) * 0.14);
                float top = smoothstep(0.45, 0.85, vPlatformNormal.y);
                float grassCover = max(top, fringe) * uGrassLayer;
                diffuseColor.rgb *= mix(soil, grass, grassCover) * uPlatformBrightness;
            `,
            );
    };
    material.customProgramCacheKey = () =>
        useHeightAttribute
            ? "jungle-platform-terrain-v1"
            : "jungle-platform-procedural-v1";
    return material;
}

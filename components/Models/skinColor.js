import * as THREE from 'three';

export default function skinColor (previewConfig, material) {
    
    if (previewConfig?.skinColor) {
        return new THREE.MeshStandardMaterial({
            color: previewConfig.skinColor,
        });
    }

    return material;

};
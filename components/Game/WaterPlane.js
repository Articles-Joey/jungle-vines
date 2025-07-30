import * as THREE from 'three'
import React, { useRef, useMemo } from 'react'
import { extend, useThree, useLoader, useFrame } from '@react-three/fiber'
import { Water } from 'three-stdlib'

extend({ Water })

const link = `${process.env.NEXT_PUBLIC_CDN}games/Race Game/waternormals.jpeg`

export default function WaterPlane(props) {
    const ref = useRef()
    const gl = useThree((state) => state.gl)

    const waterNormals = useLoader(THREE.TextureLoader, link)

    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping
    const geom = useMemo(() => new THREE.PlaneGeometry(250, 250), [])
    const config = useMemo(
        () => ({
            textureWidth: 512,
            textureHeight: 512,
            waterNormals,
            sunDirection: [1000, 10, 0],
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: false,
            format: gl.encoding
        }),
        [waterNormals]
    )
    useFrame((state, delta) => (ref.current.material.uniforms.time.value += delta))
    return <water ref={ref} args={[geom, config]} {...props} rotation-x={-Math.PI / 2} />
}
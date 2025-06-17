/*
Author: Aleks P (https://sketchfab.com/Aleksp)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/2x2-lego-brick-fe10ac44c033412bbd43afb86cca6254
Title: 2x2 Lego Brick
*/

import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

type GLTFResult = GLTF & {
  nodes: {
    ['2x2_Brick162_Lego_Brick_0']: THREE.Mesh;
  };
  materials: {
    Lego_Brick: THREE.MeshStandardMaterial;
  };
};

export function useBrickModel() {
  const { nodes, materials } = useGLTF('/2x2_lego_brick.glb') as unknown as GLTFResult;

const geometry = nodes['2x2_Brick162_Lego_Brick_0'].geometry.clone()
geometry.scale(20,20,20)
geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2))
  const material = materials.Lego_Brick;

  return { geometry, material };
}

const BrickInstance = forwardRef<THREE.InstancedMesh>((_, ref) => {
  const { nodes, materials } = useGLTF('/2x2_lego_brick.glb') as unknown as GLTFResult
  const meshRef = useRef<THREE.InstancedMesh>(null)

  useImperativeHandle(ref, () => meshRef.current!)

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.instanceMatrix.needsUpdate = true
    }
  }, [])

  return (
    <instancedMesh
      ref={meshRef}
      args={[nodes['2x2_Brick162_Lego_Brick_0'].geometry, materials.Lego_Brick, 100]}
      castShadow
 
    //   receiveShadow
    />
  )
})

export default BrickInstance

useGLTF.preload('/2x2_lego_brick.glb')
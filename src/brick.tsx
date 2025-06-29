/*
Author: Aleks P (https://sketchfab.com/Aleksp)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/2x2-lego-brick-fe10ac44c033412bbd43afb86cca6254
Title: 2x2 Lego Brick
*/


import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    ['2x2_Brick162_Lego_Brick_0']: THREE.Mesh;
  };
  materials: {
    Lego_Brick: THREE.MeshStandardMaterial;
  };
};

let cached: {
  geometry: THREE.BufferGeometry;
  material: THREE.MeshStandardMaterial;
} | null = null;

export function useBrickModel() {
  const { nodes, materials } = useGLTF('/2x2_lego_brick.glb') as unknown as GLTFResult;

  if (!cached) {
    const original = nodes['2x2_Brick162_Lego_Brick_0'].geometry;
    const cloned = original.clone();

    cloned.scale(20, 20, 20);
    cloned.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    cached = {
      geometry: cloned,
      material: materials.Lego_Brick,
    };
  }

  return cached;
}

useGLTF.preload('/2x2_lego_brick.glb');
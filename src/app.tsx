
import { Canvas} from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider, InstancedRigidBodies, InstancedRigidBodyProps } from '@react-three/rapier';


import  { useBrickModel } from './brick';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { InstancedMesh} from 'three';
import bricksData from "./wall.json";
import { SphereSpawner } from './sphereShooter';
import { Loader } from '@react-three/drei';
import GameOverlayUI from './gameOverlayUi';
import { useSoundStore } from './store/soundStore';
import { useStore } from './store/store';
import { Analytics } from "@vercel/analytics/react"


export function BrickInstances() {
  const { geometry, material } = useBrickModel();
  const ref = useRef<InstancedMesh>(null);
 const { playRandomGlassSound } = useSoundStore();
 const {gameStarted} = useStore();

// const instances = useRef<any[]>([]);

//   useEffect(() => {
//   const expanded = bricksData.flatMap((column,) => {
//     const [x, y, z] = column.startPos;
//     const { totalBricks, brickHeight } = column;

//     return Array.from({ length: totalBricks }, (_, i) => ({
//       position: [x, y + i * brickHeight, z],
//       rotation: [0, 0, 0],
//       scale: [1, 1, 1]
//     }));
//   });

//    instances.current = expanded;
// }, []);

// const groundLevel = -1.9;
// const brickSize = 0.15;
// const brickHeight = 0.1;
const groundLevel = -1.9;
const brickSize = 0.30;
const brickHeight = 0.2;

const memoizedInstances: InstancedRigidBodyProps[] = useMemo(() => {
  return bricksData.flatMap((column, columnIndex) => {
    const [x, y, z] = column.startPos;
    const { totalBricks } = column;

    return Array.from({ length: totalBricks }, (_, i) => ({
      key: `brick-${columnIndex}-${i}`, // Required key!
      position: [x*brickSize, (y*brickHeight)+groundLevel+ i * brickHeight, z*brickSize] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
    }));
  });
}, []);

useEffect(() => {
  if (ref.current) {
    ref.current.instanceMatrix.needsUpdate = true;
  }
}, []);



 const handleCollisionEnter = (_e:any) => {
   if(_e.totalForceMagnitude && _e.totalForceMagnitude >10 && gameStarted) playRandomGlassSound();
  };

 if (memoizedInstances.length === 0) return null;

  return (
    <InstancedRigidBodies 
      instances={memoizedInstances}
      colliders={false}
      mass={1}
      density={2.5}
      canSleep
      restitution={0}
      friction={1}
      softCcdPrediction={1}
      colliderNodes={[
        // <CuboidCollider args={[0.075, 0.05, 0.075]} position={[0,0,0]} />,
        <CuboidCollider args={[0.15, 0.1, 0.15]} position={[0,0,0]} />,
      ]}  
  
      onContactForce={handleCollisionEnter}
    >
      
       <instancedMesh
        ref={ref}
        args={[geometry, material, memoizedInstances.length]}
        castShadow
      />

    </InstancedRigidBodies>
  );
}




const Game = () => {
  const { initialize } = useSoundStore();
  const {gameStarted} = useStore();
  
   useEffect(()=>{
    initialize();
  },[initialize])
  
let lastVibrateTime = 0;
const VIBRATE_THROTTLE_MS = 100; // Allow 1 vibration per 100ms

const haptic = (e: any) => {
  const force = e.maxForceMagnitude;

  if (force && force > 4.5) {

    // Map 4.5–20 → 0.2–1.0, clamp anything >20 to 1.0
    const mapForce = (val: number) => {
      if (val >= 20) return 1.0;
      const minVal = 4.5;
      const maxVal = 20;
      const minMapped = 0.2;
      const maxMapped = 1.0;
      const scaled = (val - minVal) / (maxVal - minVal); // 0–1
      return minMapped + scaled * (maxMapped - minMapped);
    };

    const intensity = mapForce(force);

    if ((navigator as any).haptic) {
      (navigator as any).haptic([
        { intensity, sharpness: 0.8 }
      ]);
    } 
    else if ("vibrate" in navigator) {

      const now = Date.now();
      if (now - lastVibrateTime < VIBRATE_THROTTLE_MS) {
        return; // Too soon, skip
      }
      lastVibrateTime = now;
      navigator.vibrate(5);
    }
  }
};
 


  return (

     <div className="canvas-container">
      {/* <Loader/> */}
      <Analytics/>
      <Canvas
        camera={{ position: [0, 0.6, 4], fov: 80,near: 0.001, far: 1000 }}
        shadows
      >
        <Suspense>
        <ambientLight intensity={0.4} color={"white"}/>
        <directionalLight position={[0,1,-2]} castShadow/>
 
 
        <pointLight
        args={[0,2,0]}
        position={[-2,1.5,-2]}
        intensity={100}
        color={"hotpink"}
        distance={5}
        decay={2}
        />
          <pointLight
        args={[0,2,0]}
        position={[2,1.5,-2]}
        intensity={100}
        color={"indianred"}
        distance={5}
        decay={2}
        />

         <pointLight
        args={[0,2,0]}
        position={[-1,0,2]}
        intensity={30}
        color={"royalblue"}
        distance={3}
        decay={2}
        />
          <pointLight
        args={[0,2,0]}
        position={[1,0,2]}
        intensity={10}
        color={"white"}
        distance={3}
        decay={2}
        />

         
        
        <Physics gravity={[0, -9.81, 0]} >

   
          {gameStarted && <BrickInstances />}
      

          <RigidBody name="ground" type='fixed' position={[0,-2,0]} restitution={0}  onContactForce={haptic} >
            <mesh receiveShadow>
              <boxGeometry args={[6,0.1,6]}/>
               <meshStandardMaterial color={"indianred"} metalness={.1} roughness={0.6}/>
            </mesh>
          </RigidBody>
          <RigidBody name="top" type='fixed' position={[0,3,0]} onContactForce={haptic}>
            <mesh receiveShadow>
              <boxGeometry args={[6,0.1,6]}/>
              <meshStandardMaterial color={"indianred"} metalness={.1} roughness={0.6}/>
         
            </mesh>
          </RigidBody>
           <RigidBody name="leftWall" type='fixed' position={[-3,0.5,0]} onContactForce={haptic}>
            <mesh receiveShadow>
              <boxGeometry args={[0.1,5,6]}/>
              <meshStandardMaterial color={"indianred"} metalness={.1} roughness={0.6}/>
            </mesh>
          </RigidBody>
           <RigidBody name="rightWall" type='fixed' position={[3,0.5,0]} onContactForce={haptic}>
            <mesh receiveShadow>
              <boxGeometry args={[0.1,5,6]}/>
                <meshStandardMaterial color={"indianred"} metalness={.1} roughness={0.6}/>
            </mesh>
          </RigidBody>
          <RigidBody name="backWall" type='fixed' position={[0,0.5,-3]} onContactForce={haptic}>
            <mesh receiveShadow>
              <boxGeometry args={[6,5,0.1]}/>
               <meshStandardMaterial color={"indianred"} metalness={.1} roughness={0.6}/>
            </mesh>
          </RigidBody>
           <RigidBody name="frontWall" type='fixed' position={[0,0.5,3]}>
           
            <CuboidCollider  args={[3,2.5,0.1]}/>
          </RigidBody>

              <SphereSpawner /> 

        </Physics>
        {/* <OrbitControls/> */}
        </Suspense>
      </Canvas>
      <Loader/>
      <GameOverlayUI/>

      
    </div>
  );
}

export default Game;
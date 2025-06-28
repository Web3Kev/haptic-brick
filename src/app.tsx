
import { Canvas} from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider, InstancedRigidBodies } from '@react-three/rapier';
import  { useBrickModel } from './brick';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { InstancedMesh } from 'three';
import levels from "./levels.json";
import { SphereSpawner } from './sphereShooter';
import { Loader } from '@react-three/drei';
import GameOverlayUI from './gameOverlayUi';
import { useSoundStore } from './store/soundStore';
import { useStore } from './store/store';
import { Analytics } from "@vercel/analytics/react"
import { CameraController } from './cameraController';
import Lights from './lights';


export function useLevelBricks(level: number, brickSize: number, brickHeight: number, groundLevel: number) {
  const setTotalBricks = useStore((s) => s.setTotalBricks)
  const setMaxCannonBalls = useStore((s) => s.setMaxCannonBalls)
  const setMinDemo = useStore((s) => s.setMinDemo)
  const {setLevel, setGameStarted} = useStore();

  const { bricksData, instances } = useMemo(() => {
    const levelData = levels.find((l) => l.level === level)
    const bricksData = levelData?.bricks || []

    if(levelData != undefined)
    {
      setMaxCannonBalls(levelData.totalBalls);
      setMinDemo(levelData.minimumDemolition);
    }
    else
    {
      setLevel(0);
      setGameStarted(false);
    }

    const instances = bricksData.flatMap((column, columnIndex) => {
      const [x, y, z] = column.startPos
      return Array.from({ length: column.totalBricks }, (_, i) => ({
        key: `brick-${columnIndex}-${i}`,
        position: [
          x * brickSize,
          y * brickHeight + groundLevel + i * brickHeight,
          z * brickSize,
        ] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
      }))
    })

    return { bricksData, instances }
  }, [level, brickSize, brickHeight, groundLevel])

  useEffect(() => {
    setTotalBricks(bricksData.reduce((sum, b) => sum + b.totalBricks, 0))
  }, [bricksData, setTotalBricks])

  return instances
}


export function BrickInstances() {

  const { geometry, material } = useBrickModel();
  const ref = useRef<InstancedMesh>(null);
  const { playRandomGlassSound } = useSoundStore();
  const {gameStarted} = useStore();
  const level = useStore((state) => state.level)
  const groundLevel = -1.9;
  const brickSize = 0.30;
  const brickHeight = 0.2;
  const memoizedInstances = useLevelBricks(level, brickSize, brickHeight, groundLevel)

  useEffect(() => {
    if (ref.current) {
      ref.current.instanceMatrix.needsUpdate = true;
    }
  }, [memoizedInstances]);

  const addBrickOnFloor = useStore(s => s.addBrickOnFloor)

  const handleCollisionEnter = (_e:any) => {
    if(_e.totalForceMagnitude && _e.totalForceMagnitude >10 && gameStarted) playRandomGlassSound();
  };

  if (!gameStarted || memoizedInstances.length === 0) return null;

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
        <CuboidCollider args={[0.15, 0.1, 0.15]} position={[0,0,0]} />,
      ]}  
      onContactForce={handleCollisionEnter}
      onCollisionEnter={({ target,other }) => { 
        const id = target.rigidBodyObject?.uuid;
        if (id && other.rigidBodyObject?.name) {
          const name = other.rigidBodyObject.name;
          if (["ground", "top", "leftWall", "rightWall", "frontWall"].includes(name)) {
            addBrickOnFloor(id);
          }
        }
      }}
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
  const {gameStarted, gameOver} = useStore();
  
  //initialize sound
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
      <Analytics/>
      <Canvas
        camera={{ position: [-3, 0.5, -3], fov: 80,near: 0.001, far: 1000 }}
        shadows
      >
        <CameraController gameStarted={gameStarted} />
        <Suspense>
          <Lights/>
          
          <Physics gravity={[0, -9.81, 0]} >

            {gameStarted && <BrickInstances />}
            {gameStarted && !gameOver &&  <SphereSpawner /> }
        
            <RigidBody name="ground" type='fixed' position={[0,-2,0]} restitution={0}  onContactForce={haptic} >
              <mesh receiveShadow>
                <boxGeometry args={[6,0.1,6]}/>
                <meshStandardMaterial 
                  color={"white"} 
                  metalness={.1} 
                  roughness={0.6}
                />
              </mesh>
            </RigidBody>
            <RigidBody name="top" type='fixed' position={[0,3,0]} onContactForce={haptic}>
              <mesh receiveShadow>
                <boxGeometry args={[6,0.1,6]}/>
                <meshStandardMaterial 
                  color={"white"} 
                  metalness={.1} 
                  roughness={0.6}
                />
              </mesh>
            </RigidBody>
            <RigidBody name="leftWall" type='fixed' position={[-3,0.5,0]} onContactForce={haptic}>
              <mesh receiveShadow rotation={[0,Math.PI/2,0]}>
                <planeGeometry args={[6,5]} />
                <meshStandardMaterial 
                  color={"white"} 
                  metalness={.1} 
                  roughness={0.6}
                />
              </mesh>
            </RigidBody>
            <RigidBody name="rightWall" type='fixed' position={[3,0.5,0]} onContactForce={haptic}>
              <mesh receiveShadow rotation={[0,-Math.PI/2,0]}>
                <planeGeometry args={[6,5]} />
                  <meshStandardMaterial 
                    color={"white"} 
                    metalness={.1} 
                    roughness={0.6}
                  />
              </mesh>
            </RigidBody>
            <RigidBody name="backWall" type='fixed' position={[0,0.5,-3]} onContactForce={haptic}>
              <mesh receiveShadow>
                <planeGeometry args={[6,5]} />
                <meshStandardMaterial 
                  color={"white"} 
                  metalness={.1} 
                  roughness={0.6}
                />
              </mesh>
            </RigidBody>
            <RigidBody name="frontWall" type='fixed' position={[0,0.5,3]}>
            <mesh receiveShadow rotation={[0,-Math.PI,0]}>
                <planeGeometry args={[6,5]} />
                <meshStandardMaterial 
                  color={"white"} 
                  metalness={.1} 
                  roughness={0.6}
                />
              </mesh>
            </RigidBody>

          </Physics>
        </Suspense>
      </Canvas>

      <Loader/>
      <GameOverlayUI/>
    </div>
  );
}

export default Game;
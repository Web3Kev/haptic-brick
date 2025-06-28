import { RigidBody } from '@react-three/rapier';
import { useFrame, useThree } from '@react-three/fiber';
import { useState, useCallback, useEffect } from 'react';
import { Raycaster, Vector2 } from 'three';
import { useRef } from 'react';
import { useStore } from './store/store';
import { useSoundStore } from './store/soundStore';

export function SphereSpawner() {
  const { camera } = useThree();
  const [spheres, setSpheres] = useState<any[]>([]);
  const {gameStarted,cannonBallShot,maxCannonBalls,setGameOver, gameOver } = useStore();
  const {playSound } = useSoundStore();
 
   const timerStartedRef = useRef(false);

const shoot = useCallback((e: MouseEvent ) => {
  if (gameOver) return; 

  if(cannonBallShot >= maxCannonBalls) {
    playSound("error")

    if ((navigator as any).haptic) {
      (navigator as any).haptic("error");
    } 
    else 
    if ("vibrate" in navigator) {
      navigator.vibrate([50,100,50,100,50]);
    }

    if (!timerStartedRef.current) {
      timerStartedRef.current = true;
      setTimeout(() => {
        setGameOver(true);
        timerStartedRef.current = false;
      }, 1000);
    }
    return;
  }

  const mouse = new Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );

  const raycaster = new Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const direction = raycaster.ray.direction.clone().normalize();
  const origin = camera.position.clone();

  const spawnPos = origin.clone().add(direction.clone().multiplyScalar(2.2));
  const impulse = direction.clone().multiplyScalar(2.5);

  playSound("drop")

  setSpheres(prev => [
    ...prev,
    {
      id: Date.now(),
      position: spawnPos.toArray(),
      impulse: impulse.toArray(),
    },
  ]);

}, [camera, gameStarted, maxCannonBalls, cannonBallShot]);


 useEffect(() => {
  let startX = 0;
  let startY = 0;
  let isDragging = false;
 

  const handleMouseDown = (e: MouseEvent) => {
   
    startX = e.clientX;
    startY = e.clientY;
    isDragging = false;
  };

  const handleMouseMove = (e: MouseEvent) => {
    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);
    if (dx > 5 || dy > 5) isDragging = true;
  };

  const handleMouseUp = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (isDragging) return;

      // if click  on  UI 
      if (
        target.closest('button') 
      ) {
        return;
      }

      shoot(e);
  };

  window.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);

  return () => {
    window.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };
}, [shoot]);

  const resetCannonBallShot = useStore((s) => s.resetCannonBallShot)
  useEffect(()=>{
    if(gameStarted)resetCannonBallShot()
  },[gameStarted])


  return (
    <>
      {spheres.map(({ id, position, impulse }) => (
        <Sphere key={id} id={id} position={position} impulse={impulse} onExpire={(id) => {
        setSpheres(prev => prev.filter(s => s.id !== id));
        }} />
      ))}
    </>
  );
}

function Sphere({
  id,
  position,
  impulse,
  onExpire
}: {
  id: number;
  position: [number, number, number];
  impulse: [number, number, number];
  onExpire: (id: number) => void;
}) {
  const ref = useRef<any>(null);
  const appliedRef = useRef(false);
  const  addCannonBallShot = useStore((s) => s.addCannonBallShot)



  useFrame(() => {
    if (ref.current && !appliedRef.current && ref.current.applyImpulse) {
      addCannonBallShot()
      ref.current.applyImpulse({ x: impulse[0], y: impulse[1], z: impulse[2] }, true);
      appliedRef.current = true;
    }
  });

  // Remove sphere after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onExpire(id);
    }, 2000);
    return () => clearTimeout(timer);
  }, [id, onExpire]);

  return (
    <RigidBody
      ref={ref}
      colliders="ball"
      position={position}
      mass={10}
      density={20}
      restitution={0.3}
      friction={1}
      name='ball'
    >
      <mesh castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="black" metalness={0.5} roughness={0.5}/>
      </mesh>
    </RigidBody>
  );
}
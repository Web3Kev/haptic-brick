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
  const {gameStarted} = useStore();
   const {playSound } = useSoundStore();

const shoot = useCallback((e: MouseEvent) => {
  if (!gameStarted) return; // Only proceed if game has started

  const mouse = new Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );

  const raycaster = new Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const direction = raycaster.ray.direction.clone().normalize();
  const origin = camera.position.clone();

  const spawnPos = origin.clone().add(direction.clone().multiplyScalar(3));
  const impulse = direction.clone().multiplyScalar(4);

  playSound("drop")

  setSpheres(prev => [
    ...prev,
    {
      id: Date.now(),
      position: spawnPos.toArray(),
      impulse: impulse.toArray(),
    },
  ]);
}, [camera, gameStarted]);

  useEffect(() => {
    window.addEventListener('click', shoot);
    return () => window.removeEventListener('click', shoot);
  }, [shoot]);



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

  useFrame(() => {
    if (ref.current && !appliedRef.current && ref.current.applyImpulse) {
      ref.current.applyImpulse({ x: impulse[0], y: impulse[1], z: impulse[2] }, true);
      appliedRef.current = true;
    }
  });

  // 👇 Remove sphere after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onExpire(id);
    }, 1000);
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
    >
      <mesh castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="black" metalness={0.5} roughness={0.5}/>
      </mesh>
    </RigidBody>
  );
}
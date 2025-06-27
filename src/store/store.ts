//store.ts

import { create } from 'zustand'

interface StoreState {
  gameStarted: boolean;
  gameOver: boolean;
  level: number;
  maxCannonBalls: number;
  cannonBallShot: number;
  fallenBricks: Set<string>;
  totalBricks: number;
  bricksonFloor: number;
  onFloorAtStart: number;
  currentDemolition: number; 
  minimumDemolition:number;

  setGameStarted: (value: boolean) => void;
  setGameOver: (value: boolean) => void;
  setLevel: (value: number) => void;
  setMinDemo: (value: number) => void;
  nextLevel: () => void;
  setMaxCannonBalls: (value: number) => void;
  resetCannonBallShot: () => void;
  addCannonBallShot: () => void;
  setTotalBricks: (value: number) => void;
  resetBricksonFloor: () => void;
  addBrickOnFloor: (id: string) => void;
  resetGame: () => void; 
}

export const useStore = create<StoreState>((set,get) => ({

  gameStarted: false,
  gameOver:false,
  level: 0,
  maxCannonBalls: 0,
  cannonBallShot: 0,
  totalBricks: 10,
  bricksonFloor:0,
  fallenBricks: new Set(),
  onFloorAtStart:0,
  currentDemolition: 0,
  minimumDemolition:50,

  setGameOver: (value) => set({ gameOver: value }),
  setGameStarted: (value) => set({ gameStarted: value }),
  setLevel: (value) => set({ level: value }),
  setMinDemo: (value) => set({ minimumDemolition: value }),
  nextLevel: () => set({ level:  get().level + 1 }),
  setMaxCannonBalls: (value) => set({ maxCannonBalls: value }),
  resetCannonBallShot: () => set({ cannonBallShot: 0 }),
  addCannonBallShot: () => set({ cannonBallShot: get().cannonBallShot+1 }),
  setTotalBricks: (value) => set({ totalBricks: value }),
  resetBricksonFloor: () => set({ bricksonFloor: 0 }),
  addBrickOnFloor: (id) => {
    const current = get();
    if (current.fallenBricks.has(id)) return;

    const newSet = new Set(current.fallenBricks);
    newSet.add(id);
    const newCount = newSet.size;

    let onFloorAtStart = current.onFloorAtStart;

    if (current.cannonBallShot === 0) {
      onFloorAtStart += 1;
      set({ onFloorAtStart });
    }

    const effectiveFallen = newCount - onFloorAtStart;
    const effectiveTotal = current.totalBricks - onFloorAtStart;
    const demolitionPercent = effectiveTotal > 0
      ? Math.floor((effectiveFallen / effectiveTotal) * 100)
      : 0;

    set({
      bricksonFloor: newCount,
      fallenBricks: newSet,
      currentDemolition: demolitionPercent,
    });

    // console.log("demol",demolitionPercent);

    // if (demolitionPercent >= 60) {
    //   console.log("demolished");
    // }
},

resetGame: () => {
  set({
    cannonBallShot: 0,
    bricksonFloor: 0,
    onFloorAtStart: 0,
    fallenBricks: new Set(),
    currentDemolition: 0,
    gameOver:false,
  });
}

}))


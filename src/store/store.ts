//store.ts

import { create } from 'zustand'

interface StoreState {
 
  gameStarted: boolean;

  setGameStarted: (value: boolean) => void;


}

export const useStore = create<StoreState>((set) => ({

  gameStarted: false,

  setGameStarted: (value) => set({ gameStarted: value }),


}))


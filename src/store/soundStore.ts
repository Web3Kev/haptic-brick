import { create } from 'zustand';
import { Howl } from 'howler';

type GlassSpriteKey = 'glass1' | 'glass2' | 'glass3' | 'glass4' | 'glass5' | 'glass6' | 'glass7' | 'glass8' | 'glass9' | 'glass10' | 'glass11' | 'glass12';

interface SoundStore {

  sound: Howl | null;
  isMuted: boolean;

  initialize: () => void;
  playSound: (sprite: string) => void;
  playRandomGlassSound: () => void;
  toggleMute: () => void;
}

const glassSpriteKeys: GlassSpriteKey[] = [
  'glass1', 'glass2', 'glass3', 'glass4', 'glass5', 'glass6', 
  'glass7', 'glass8', 'glass9', 'glass10', 'glass11', 'glass12'
];

export const useSoundStore = create<SoundStore>()((set, get) => ({
  sound: null,
  isMuted: false,


  initialize: () => {
    const sound = new Howl({
      src: ['./sprites.mp3'],
      sprite: {
        life: [3897, 413],
        new: [4356, 187],
        drop: [4588, 830],
        error: [5512, 418],
        glass1: [0, 302],
        glass2: [372, 338],
        glass3: [778, 312],
        glass4: [1149, 283],
        glass5: [1497, 148],
        glass6: [1696, 252],
        glass7: [2018, 272],
        glass8: [2410, 252],
        glass9: [2756, 148],
        glass10: [2950, 283],
        glass11: [3262, 283],
        glass12: [3617, 252],
      },
      // volume: 0.12,
      volume: 0.2,
    });

    set({ sound });
  },

  playSound: (sprite) => {
    const { sound, isMuted } = get();
    if (sound && !isMuted) {
      sound.play(sprite);
    }
  },

  playRandomGlassSound: () => {
    const { sound, isMuted } = get();
    if (sound && !isMuted) {
      const randomIndex = Math.floor(Math.random() * glassSpriteKeys.length);
      const randomKey = glassSpriteKeys[randomIndex];
      // console.log(randomKey)
      sound.play(randomKey);
    }
  },



  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

}));


export const playSound = (key: string) => {
  useSoundStore.getState().playSound(key);
};
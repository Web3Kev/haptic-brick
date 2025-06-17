
interface HapticEvent {
  intensity?: number;
  sharpness?: number;
  duration?: number;
}

interface Navigator {
  haptic?: (events: HapticEvent | HapticEvent[]) => void;
}
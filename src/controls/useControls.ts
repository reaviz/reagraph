import CameraControls from 'camera-controls';
import create from 'zustand';

interface ControlsState {
  controls: CameraControls | null;
  setControls: (controls: CameraControls | null) => void;
}

export const useControls = create<ControlsState>(set => ({
  controls: null,
  setControls: controls => set({ controls })
}));

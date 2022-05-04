import CameraControls from 'camera-controls';
import { createContext, useContext } from 'react';

export interface ControlsContextProps {
  controls: CameraControls | null;
  zoomIn: () => void;
  zoomOut: () => void;
  panLeft: () => void;
  panRight: () => void;
  panUp: () => void;
  panDown: () => void;
}

export const ControlsContext = createContext<ControlsContextProps>({
  controls: null,
  zoomIn: () => undefined,
  zoomOut: () => undefined,
  panLeft: () => undefined,
  panRight: () => undefined,
  panUp: () => undefined,
  panDown: () => undefined
});

export const useControls = () => {
  const context = useContext(ControlsContext);

  if (context === undefined) {
    throw new Error(
      '`useControls` hook must be used within a `ControlsProvider` component'
    );
  }

  return context;
};

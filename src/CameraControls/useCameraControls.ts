import CameraControls from 'camera-controls';
import { createContext, useContext } from 'react';

export interface CameraControlsConextProps {
  controls: CameraControls | null;
  zoomIn: () => void;
  zoomOut: () => void;
  panLeft: () => void;
  panRight: () => void;
  panUp: () => void;
  panDown: () => void;
}

export const CameraControlsContext = createContext<CameraControlsConextProps>({
  controls: null,
  zoomIn: () => undefined,
  zoomOut: () => undefined,
  panLeft: () => undefined,
  panRight: () => undefined,
  panUp: () => undefined,
  panDown: () => undefined
});

export const useCameraControls = () => {
  const context = useContext(CameraControlsContext);

  if (context === undefined) {
    throw new Error(
      '`useCameraControls` hook must be used within a `ControlsProvider` component'
    );
  }

  return context;
};

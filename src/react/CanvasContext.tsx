import { createContext, useContext, useEffect } from 'react';
import { Container } from '../core/Container';

export interface RenderLoop {
  add: (callback: (time: number) => void) => void;
  remove: (callback: (time: number) => void) => void;
  run: (time: number) => void;
}

export const SceneContext = createContext<Container | null>(null);
export const RenderContext = createContext<RenderLoop | null>(null);

export const useCanvasParent = () => {
  const parent = useContext(SceneContext);
  if (!parent) {
    throw new Error('Canvas components must be rendered within a Canvas or Group component');
  }
  return parent;
};

export const useFrame = (callback: (time: number) => void) => {
  const renderLoop = useContext(RenderContext);
  
  useEffect(() => {
    if (!renderLoop) return;
    renderLoop.add(callback);
    return () => renderLoop.remove(callback);
  }, [renderLoop, callback]);
};

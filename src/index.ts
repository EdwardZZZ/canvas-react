// Export React components as the main API
export { default as Canvas } from './react/Canvas';
export * from './react/Canvas';
export * from './react/CanvasContext';
export * from './react/Shapes';

// Export Engine Core (for advanced usage, namespace to avoid collisions)
export * as Core from './core/index';
export * as EngineShapes from './shapes/index';

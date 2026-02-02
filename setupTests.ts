import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Canvas API
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  fillText: vi.fn(),
  drawImage: vi.fn(),
  closePath: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  // Properties
  canvas: {
    width: 0,
    height: 0,
    style: {}
  }
} as any));

// Mock requestAnimationFrame
(globalThis as any).requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 0));
(globalThis as any).cancelAnimationFrame = vi.fn((id) => clearTimeout(id));

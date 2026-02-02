import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Canvas from './Canvas';
import { Rect } from './Shapes';

describe('Smart Rendering (Dirty Check)', () => {
  beforeEach(() => {
    // Mock CanvasRenderingContext2D
    const mockContext = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      transform: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      closePath: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext);
  });

  it('should not redraw if scene is not dirty', async () => {
    const { container } = render(
      <Canvas width={500} height={500}>
        <Rect x={10} y={10} width={100} height={100} fill="red" />
      </Canvas>
    );

    const canvas = container.querySelector('canvas');
    const ctx = canvas?.getContext('2d');
    
    if (!ctx) throw new Error('Context not found');

    // Spy on clearRect to detect redraws
    const clearRectSpy = vi.spyOn(ctx, 'clearRect');

    // Initial render should have happened
    // clearRectSpy calls count depends on how many frames passed.
    // We can't control requestAnimationFrame easily in JSDOM without fake timers, 
    // but we can check if it stops growing.
    
    // Better approach: access internal state or mock the loop. 
    // But this is an integration test.
    
    // Let's rely on the fact that without changes, subsequent frames should skip render.
    
    // Wait a bit
    await new Promise(r => setTimeout(r, 50));
    const initialCalls = clearRectSpy.mock.calls.length;
    
    // Wait more
    await new Promise(r => setTimeout(r, 50));
    const finalCalls = clearRectSpy.mock.calls.length;
    
    // If smart rendering works, clearRect should not be called continuously 
    // unless animations are running (which they are not here).
    // Note: React's render phase might trigger initial updates.
    
    // However, requestAnimationFrame runs ~60fps. 100ms = 6 frames.
    // If dirty check is working, initialCalls and finalCalls should be equal (or very close if just finished initial frame).
    
    expect(finalCalls).toBe(initialCalls);
  });
});

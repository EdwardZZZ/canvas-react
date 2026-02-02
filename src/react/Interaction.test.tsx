import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Canvas from './Canvas';
import { Rect, Group } from './Shapes';

describe('Interaction System', () => {
  beforeEach(() => {
    // Mock CanvasRenderingContext2D methods to avoid "ctx.transform is not a function" in JSDOM without canvas package
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
      arc: vi.fn(),
      fill: vi.fn(),
      closePath: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext);
  });

  it('handles drag events', () => {
    const handleDragStart = vi.fn();
    const handleDragMove = vi.fn();
    const handleDragEnd = vi.fn();
    
    const { container } = render(
      <Canvas width={500} height={500}>
        <Rect 
          x={10} 
          y={10} 
          width={100} 
          height={100} 
          draggable={true}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        />
      </Canvas>
    );

    const canvas = container.querySelector('canvas');
    if (!canvas) throw new Error('Canvas not found');

    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
        left: 0, top: 0, width: 500, height: 500, x: 0, y: 0, bottom: 500, right: 500, toJSON: () => {}
    });

    // 1. Mouse Down on shape -> Drag Start
    fireEvent.mouseDown(canvas, { clientX: 50, clientY: 50 });
    expect(handleDragStart).toHaveBeenCalledTimes(1);

    // 2. Mouse Move -> Drag Move
    fireEvent.mouseMove(canvas, { clientX: 60, clientY: 60 });
    expect(handleDragMove).toHaveBeenCalledTimes(1);

    // 3. Mouse Up -> Drag End
    fireEvent.mouseUp(canvas, { clientX: 60, clientY: 60 });
    expect(handleDragEnd).toHaveBeenCalledTimes(1);
  });

  it('handles click events on shapes', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <Canvas width={500} height={500}>
        <Rect 
          x={10} 
          y={10} 
          width={100} 
          height={100} 
          onClick={handleClick} 
        />
      </Canvas>
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();

    // Click inside the rect (global 50, 50) -> local (50, 50) -> inside
    if (canvas) {
        // Mock getBoundingClientRect
        vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
            left: 0,
            top: 0,
            width: 500,
            height: 500,
            x: 0,
            y: 0,
            bottom: 500,
            right: 500,
            toJSON: () => {}
        });

        fireEvent.click(canvas, { clientX: 50, clientY: 50 });
    }

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('ignores clicks outside shapes', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <Canvas width={500} height={500}>
        <Rect 
          x={10} 
          y={10} 
          width={100} 
          height={100} 
          onClick={handleClick} 
        />
      </Canvas>
    );

    const canvas = container.querySelector('canvas');
    
    if (canvas) {
        vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
            left: 0,
            top: 0,
            width: 500,
            height: 500,
            x: 0,
            y: 0,
            bottom: 500,
            right: 500,
            toJSON: () => {}
        });

        // Click outside (200, 200)
        fireEvent.click(canvas, { clientX: 200, clientY: 200 });
    }

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('handles nested transformations correctly', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <Canvas width={500} height={500}>
        {/* Group moved to 100,100 */}
        <Group x={100} y={100}>
            {/* Rect at 10,10 inside group -> global 110,110 */}
            <Rect 
              x={10} 
              y={10} 
              width={100} 
              height={100} 
              onClick={handleClick} 
            />
        </Group>
      </Canvas>
    );

    const canvas = container.querySelector('canvas');
    
    if (canvas) {
        vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
            left: 0,
            top: 0,
            width: 500,
            height: 500,
            x: 0,
            y: 0,
            bottom: 500,
            right: 500,
            toJSON: () => {}
        });

        // Click at 120, 120 (inside rect)
        fireEvent.click(canvas, { clientX: 120, clientY: 120 });
    }

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles hover events (mouseenter/mouseleave)', () => {
    const handleMouseEnter = vi.fn();
    const handleMouseLeave = vi.fn();
    
    const { container } = render(
      <Canvas width={500} height={500}>
        <Rect 
          x={10} 
          y={10} 
          width={100} 
          height={100} 
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </Canvas>
    );

    const canvas = container.querySelector('canvas');
    if (!canvas) throw new Error('Canvas not found');

    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
        left: 0, top: 0, width: 500, height: 500, x: 0, y: 0, bottom: 500, right: 500, toJSON: () => {}
    });

    // Move mouse into shape
    fireEvent.mouseMove(canvas, { clientX: 50, clientY: 50 });
    expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    expect(handleMouseLeave).not.toHaveBeenCalled();

    // Move mouse inside shape (should not trigger again)
    fireEvent.mouseMove(canvas, { clientX: 60, clientY: 60 });
    expect(handleMouseEnter).toHaveBeenCalledTimes(1);

    // Move mouse out of shape
    fireEvent.mouseMove(canvas, { clientX: 200, clientY: 200 });
    expect(handleMouseLeave).toHaveBeenCalledTimes(1);
  });
});

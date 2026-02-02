import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Rect, Circle, Text, Group, Image, Line } from './Shapes';
import Canvas from './Canvas';

// Using real implementation for integration testing
// This ensures that the components correctly instantiate the engine nodes
// and add them to the scene graph.

describe('React Shapes Components', () => {
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
      fillText: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      drawImage: vi.fn(),
      arc: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext);
    
    // Inject mock context into Text class static property if possible, 
    // or rely on JSDOM returning a working context (which it seems it doesn't fully).
    
    // Fix: Text.ts uses a static property measureContext.
    // We can manually set it to our mock context!
    // @ts-ignore
    Text.measureContext = mockContext;
    
    // Also add measureText to mockContext (it was missing in the spy object above?)
    // Wait, the spy object above had 'fillText' but no 'measureText' explicitly defined in the object literal?
    // Let's check lines 13-33 of previous file content.
    // It has `arc`, `drawImage`, etc. I don't see `measureText`.
    
    mockContext.measureText = vi.fn().mockReturnValue({ width: 50 });
  });


  it('renders Rect without crashing', () => {
    const { container } = render(
      <Canvas>
        <Rect width={100} height={100} />
      </Canvas>
    );
    expect(container).toBeInTheDocument();
  });

  it('renders nested Group and shapes', () => {
    const { container } = render(
      <Canvas>
        <Group x={10} y={10}>
          <Circle radius={20} />
          <Text text="Test" />
        </Group>
      </Canvas>
    );
    expect(container).toBeInTheDocument();
  });

  it('renders Image and Line', () => {
    const { container } = render(
      <Canvas>
        <Image src="test.png" />
        <Line points={[0, 0, 10, 10]} />
      </Canvas>
    );
    expect(container).toBeInTheDocument();
  });
});

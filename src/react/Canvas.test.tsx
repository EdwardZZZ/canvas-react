import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Canvas from './Canvas';

describe('Canvas Component', () => {
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

  it('renders without crashing', () => {
    const { container } = render(<Canvas width={200} height={200} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('sets correct width and height styles', () => {
    const width = 300;
    const height = 400;
    const { container } = render(<Canvas width={width} height={height} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveStyle(`width: ${width}px`);
    expect(canvas).toHaveStyle(`height: ${height}px`);
  });
});

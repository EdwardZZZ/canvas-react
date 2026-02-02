import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Canvas from './Canvas';
import { Rect as EngineRect } from '../shapes/Rect';
import { Container } from '../core/Container';

describe('Z-Index Support', () => {
  it('renders children in z-index order', () => {
    const container = new Container();
    
    // Mock rendering context
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      transform: vi.fn(),
      fillRect: vi.fn(), // Rect uses fillRect
    } as unknown as CanvasRenderingContext2D;

    // Create shapes with different z-indexes
    // Default zIndex is 0
    
    const rect1 = new (class extends EngineRect {
        draw(ctx: CanvasRenderingContext2D) {
            ctx.fillRect(1, 1, 10, 10); // Unique call to identify
        }
    })({ zIndex: 10 });

    const rect2 = new (class extends EngineRect {
        draw(ctx: CanvasRenderingContext2D) {
            ctx.fillRect(2, 2, 20, 20);
        }
    })({ zIndex: 5 });

    const rect3 = new (class extends EngineRect {
        draw(ctx: CanvasRenderingContext2D) {
            ctx.fillRect(3, 3, 30, 30);
        }
    })({ zIndex: 20 });

    container.add(rect1);
    container.add(rect2);
    container.add(rect3);

    // Expected order: rect2 (5), rect1 (10), rect3 (20)
    
    container.render(ctx);

    const fillRectCalls = (ctx.fillRect as any).mock.calls;
    expect(fillRectCalls.length).toBe(3);
    
    // Check call arguments to verify order
    expect(fillRectCalls[0][0]).toBe(2); // rect2
    expect(fillRectCalls[1][0]).toBe(1); // rect1
    expect(fillRectCalls[2][0]).toBe(3); // rect3
  });

  it('updates order when z-index changes', () => {
    const container = new Container();
    
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      transform: vi.fn(),
      fillRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    const rect1 = new (class extends EngineRect {
        draw(ctx: CanvasRenderingContext2D) { ctx.fillRect(1, 0, 0, 0); }
    })({ zIndex: 10 });

    const rect2 = new (class extends EngineRect {
        draw(ctx: CanvasRenderingContext2D) { ctx.fillRect(2, 0, 0, 0); }
    })({ zIndex: 20 });

    container.add(rect1);
    container.add(rect2);

    // Initial: rect1 (10), rect2 (20)
    container.render(ctx);
    let calls = (ctx.fillRect as any).mock.calls;
    expect(calls[0][0]).toBe(1);
    expect(calls[1][0]).toBe(2);
    
    (ctx.fillRect as any).mockClear();

    // Change rect1 zIndex to be higher
    rect1.setProps({ zIndex: 30 });

    // Now: rect2 (20), rect1 (30)
    container.render(ctx);
    calls = (ctx.fillRect as any).mock.calls;
    expect(calls[0][0]).toBe(2);
    expect(calls[1][0]).toBe(1);
  });
});

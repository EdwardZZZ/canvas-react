import { describe, it, expect, vi } from 'vitest';
import { Node, Rect } from './Node';
import { Container } from './Container';

describe('Frustum Culling', () => {
    const getMockCtx = () => ({
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        scale: vi.fn(),
        transform: vi.fn(),
        fillRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D);

    const viewport: Rect = { x: 0, y: 0, width: 800, height: 600 };

    it('renders node when inside viewport', () => {
        const node = new Node({ x: 100, y: 100 });
        // Mock bounds: 50x50 rect at 100,100
        node.getSelfBounds = () => ({ x: 0, y: 0, width: 50, height: 50 });
        node.draw = vi.fn();

        const ctx = getMockCtx();
        node.render(ctx, viewport);

        expect(node.draw).toHaveBeenCalled();
    });

    it('renders node when partially inside viewport', () => {
        const node = new Node({ x: -25, y: 100 });
        // Mock bounds: 50x50 rect at -25,100 -> overlaps with viewport (x>=0)
        node.getSelfBounds = () => ({ x: 0, y: 0, width: 50, height: 50 });
        node.draw = vi.fn();

        const ctx = getMockCtx();
        node.render(ctx, viewport);

        expect(node.draw).toHaveBeenCalled();
    });

    it('skips rendering node when completely outside viewport', () => {
        const node = new Node({ x: -100, y: 100 });
        // Mock bounds: 50x50 rect at -100,100 (right edge at -50) -> fully outside viewport (x>=0)
        node.getSelfBounds = () => ({ x: 0, y: 0, width: 50, height: 50 });
        node.draw = vi.fn();

        const ctx = getMockCtx();
        node.render(ctx, viewport);

        expect(node.draw).not.toHaveBeenCalled();
    });

    it('skips rendering container children when container is culled', () => {
        const container = new Container({ x: -500, y: 0 });
        // Override getSelfBounds for container to simulate aggregated bounds that are outside
        // Note: Container.getSelfBounds usually aggregates children.
        // If we want to test that render() logic culls the container before checking children.
        
        // Actually, Node.render() checks getGlobalBounds().
        // If container is at -500,0 and children are local 0,0 50x50.
        // Global bounds will be around -500.
        
        const child = new Node({ x: 0, y: 0 });
        child.getSelfBounds = () => ({ x: 0, y: 0, width: 50, height: 50 });
        child.draw = vi.fn();
        
        container.add(child);
        
        // Ensure container calculates bounds correctly from child
        // Container global bounds should be [-500, 0, 50, 50]
        
        const ctx = getMockCtx();
        container.render(ctx, viewport);

        expect(child.draw).not.toHaveBeenCalled();
    });
});

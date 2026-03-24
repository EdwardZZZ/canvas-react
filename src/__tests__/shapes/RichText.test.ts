import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RichText } from '../../shapes/RichText';

describe('RichText', () => {
    let ctx: any;

    beforeEach(() => {
        ctx = {
            font: '',
            fillStyle: '',
            textBaseline: '',
            fillText: vi.fn(),
            measureText: vi.fn(() => ({ width: 50 })),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
        };
    });

    it('renders multiple segments with different styles', () => {
        const richText = new RichText({
            segments: [
                { text: 'Hello ', fill: 'red', fontWeight: 'bold' },
                { text: 'World', fill: 'blue', textDecoration: 'underline' }
            ]
        });

        richText.draw(ctx);

        expect(ctx.fillText).toHaveBeenCalledTimes(2);
        expect(ctx.fillText).toHaveBeenNthCalledWith(1, 'Hello ', 0, 0);
        // Second segment position depends on first segment width (50)
        expect(ctx.fillText).toHaveBeenNthCalledWith(2, 'World', 50, 0);
        
        // Check underline
        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
    });

    it('wraps text when width is exceeded', () => {
        const richText = new RichText({
            segments: [
                { text: 'Part 1 ', fontSize: 20 },
                { text: 'Part 2 ', fontSize: 20 }
            ],
            width: 80,
            lineHeight: 1
        });

        // Mock measureText: each char is 10px. "Part 1 " is 70px. "Part 2 " is 70px.
        // Total 140px. Width is 80px.
        ctx.measureText = vi.fn((text: string) => ({ width: text.length * 10 }));

        richText.draw(ctx);

        expect(ctx.fillText).toHaveBeenCalledTimes(2);
        // Second part should be on next line (y = 20)
        expect(ctx.fillText).toHaveBeenNthCalledWith(2, 'Part 2 ', 0, 20);
    });

    it('calculates bounds correctly', () => {
        // Mock the internal canvas context used by getSelfBounds
        const mockCtx = {
            font: '',
            measureText: vi.fn(() => ({ width: 10 })),
        };
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCtx as any);

        const richText = new RichText({
            segments: [
                { text: 'A', fontSize: 10 },
                { text: 'B', fontSize: 20 }
            ],
            lineHeight: 1
        });

        const bounds = richText.getSelfBounds();
        expect(bounds.height).toBeGreaterThan(0);
        expect(bounds.width).toBe(20); // 10 + 10
        
        vi.restoreAllMocks();
    });
});
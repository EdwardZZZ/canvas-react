import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Transformer } from './Transformer';
import { Node } from '../core/Node';
import { Matrix2D } from '../core/Matrix';

describe('Transformer', () => {
    let target: Node;
    let transformer: Transformer;

    beforeEach(() => {
        target = new Node({ x: 100, y: 100, width: 100, height: 100 });
        target.getSelfBounds = () => ({ x: 0, y: 0, width: 100, height: 100 });
        transformer = new Transformer({ target });
    });

    it('hits bottom-right handle', () => {
        // Target is at 100,100 with size 100x100
        // Bottom-Right handle should be at global 200, 200
        // Handle size is 10, so range is [195, 205]
        
        const hit = transformer.hitTest({ x: 200, y: 200 });
        expect(hit).toBe(transformer);
        // @ts-ignore - accessing private state for test
        expect(transformer.activeAnchor).toBe('bottom-right');
    });

    it('hits rotation handle', () => {
        // Center is 150, 150
        // Rotator is at top center (150, 100) minus 30px -> 150, 70
        
        const hit = transformer.hitTest({ x: 150, y: 70 });
        expect(hit).toBe(transformer);
        // @ts-ignore
        expect(transformer.activeAnchor).toBe('rotator');
    });

    it('transforms target on drag', () => {
        // Simulate drag start on bottom-right handle
        transformer.hitTest({ x: 200, y: 200 }); // Set activeAnchor
        
        const dragStartEvent = {
            globalX: 200,
            globalY: 200,
            stopPropagation: vi.fn()
        } as any;
        
        transformer.handleDragStart(dragStartEvent);
        
        // Drag +10px on X and Y
        const dragMoveEvent = {
            globalX: 210,
            globalY: 210,
            stopPropagation: vi.fn()
        } as any;
        
        transformer.handleDragMove(dragMoveEvent);
        
        // Initial width 100. New width 110. ScaleX should be 1.1
        expect(target.scaleX).toBeCloseTo(1.1);
        expect(target.scaleY).toBeCloseTo(1.1);
    });

    it('rotates target on drag', () => {
        // Simulate drag start on rotation handle (150, 70)
        transformer.hitTest({ x: 150, y: 70 });
        
        const dragStartEvent = {
            globalX: 150,
            globalY: 70,
            stopPropagation: vi.fn()
        } as any;
        
        transformer.handleDragStart(dragStartEvent);
        
        // Center is 150, 150.
        // Drag to 230, 150 (Right of center)
        // Angle from center should be 0.
        // Rotation handle expects -90deg (Top) to be 0 rotation?
        // Logic: angle + 90deg.
        // At 0 deg (Right), rotation should be 90deg.
        
        const dragMoveEvent = {
            globalX: 230,
            globalY: 150,
            stopPropagation: vi.fn()
        } as any;
        
        transformer.handleDragMove(dragMoveEvent);
        
        expect(target.rotation).toBeCloseTo(Math.PI / 2);
    });
});

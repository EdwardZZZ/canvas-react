import { Container, ContainerProps } from '../core/Container';
import { Node, InteractionEvent, Rect } from '../core/Node';
import { Matrix2D, Point } from '../core/Matrix';

export interface TransformerProps extends ContainerProps {
    target?: Node;
    borderStroke?: string;
    handleFill?: string;
    handleSize?: number;
    keepRatio?: boolean;
    enabledAnchors?: string[]; // 'top-left', 'top-right', etc.
}

/**
 * A specialized group that provides UI controls to transform a target node.
 */
export class Transformer extends Container {
    declare props: TransformerProps;
    private target: Node | null = null;
    
    // Drag state
    private activeAnchor: string | null = null;
    private startX: number = 0;
    private startY: number = 0;
    private startWidth: number = 0;
    private startHeight: number = 0;
    private startScaleX: number = 1;
    private startScaleY: number = 1;
    private startRotation: number = 0;
    private startXPos: number = 0;
    private startYPos: number = 0;

    constructor(props: TransformerProps = {}) {
        super(props);
        this.props.borderStroke = props.borderStroke || '#0096fd';
        this.props.handleFill = props.handleFill || '#ffffff';
        this.props.handleSize = props.handleSize || 10;
        this.props.keepRatio = props.keepRatio !== undefined ? props.keepRatio : false;
        this.draggable = true; // Essential for Canvas to dispatch drag events to us
        
        if (props.target) {
            this.attachTo(props.target);
        }

        // Bind events
        this.events.onDragStart = this.handleDragStart.bind(this);
        this.events.onDragMove = this.handleDragMove.bind(this);
        this.events.onDragEnd = this.handleDragEnd.bind(this);
    }

    attachTo(node: Node) {
        this.target = node;
        this.requestRedraw();
    }

    detach() {
        this.target = null;
        this.requestRedraw();
    }

    // Override render to draw UI on top of target
    // We don't want the transformer to be affected by the target's transform if it's not a child of it.
    // Usually Transformer is added to a top-level Layer.
    
    // We need to update our own transform to match the target's visual transform?
    // Or we just draw in global coordinates?
    // Drawing in global coordinates is easier for the overlay effect.
    // But Node.render() sets up a transform.
    
    // Strategy:
    // Transformer should be a sibling of the target (or in a top layer).
    // During update(), we sync our position/rotation/scale to match the target?
    // OR we simply calculate the target's global bounds and draw there.
    // The latter is simpler for "selection box" style.
    
    // However, if the target is rotated, we want the box to rotate too.
    // So we should copy the target's Global Transform.

    render(ctx: CanvasRenderingContext2D, viewport?: Rect) {
        if (!this.target) return;

        ctx.save();
        
        // 1. Get target's global transform
        const targetTransform = this.target.getGlobalTransform();
        
        // 2. Apply it to context so we draw in target's local space
        // Note: this assumes Transformer is at Root. If Transformer is inside another group,
        // we need to account for Transformer's parent transform.
        // For simplicity, let's assume Transformer is at Root or we inverse our parent's transform.
        
        // Let's rely on update() to set this node's transform properties to match target?
        // No, that moves the transformer in scene graph.
        
        // Better: Reset current transform (which is this node's local * parent global)
        // and apply Target Global.
        
        // But we are inside render(), ctx is already transformed by our parent.
        // We can't easily "reset" to global root without inverting parent matrix.
        
        // Workaround: We only support Transformer being added to the same parent as Target, 
        // OR we implement a special draw method that ignores local transform and uses target's.
        
        // Let's try: calculate where the target is, and draw there.
        // Since ctx has our parent's transform, we need:
        // TargetGlobal * Inverse(OurParentGlobal) -> This gives us the matrix to transform from Target Local to Our Local.
        
        let matrix = targetTransform;
        if (this.parent) {
             const parentGlobal = this.parent.getGlobalTransform();
             matrix = parentGlobal.invert().multiply(targetTransform);
        }
        
        // We override the transform set by Node.render() (which was just this.getTransform())
        // Actually Node.render() called ctx.transform() then this.draw().
        // So inside draw(), we are in This Local space.
        // We want to draw in Target Local space.
        // So we need to apply (TargetGlobal * Inverse(ThisGlobal)).
        // But ThisGlobal is derived from props.
        
        // Simpler approach: 
        // 1. In update(), set this node's x,y,rotation,scale to match Target's global properties? 
        //    Hard because of skew/parents.
        // 2. Just draw handles based on bounds.
        
        // Let's go with: The Transformer tracks the target.
        // In draw(), we explicitly change the matrix.
        
        // Revert the transform applied by Node.render()
        // (This is hacky but effective if we want to "teleport" rendering to target)
        // Since we can't easily revert ctx.transform without save/restore (which is done in Node.render),
        // we can just use the fact that we are a Node.
        
        // Let's make Transformer a "Ghost" node that doesn't use its own transform props for rendering,
        // but instead uses the target's transform.
        
        // Actually, the standard way is: Transformer is just a Group. 
        // You add it to the scene. You set its props to match target?
        // No, that's tedious.
        
        // Let's do the "Global Overlay" approach.
        // We assume draw() is called with the context in our local space.
        // We want to draw matching the target.
        // So we apply: Inverse(MyLocal) * Inverse(MyParentGlobal) * TargetGlobal.
        
        // To do this cleanly:
        // We undo the current transform (identity), then apply TargetGlobal.
        // BUT we can't "setIdentity" on ctx easily.
        
        // OK, let's simplify.
        // The Transformer should be added as a *sibling* of the target, or to a UI layer that has no transform (identity).
        // If it's on a UI layer (identity), we just apply TargetGlobal.
        
        // Let's implement draw() assuming we want to align with target.
        const myGlobal = this.getGlobalTransform();
        const transformToTarget = myGlobal.invert().multiply(targetTransform);
        
        ctx.transform(transformToTarget.a, transformToTarget.b, transformToTarget.c, transformToTarget.d, transformToTarget.e, transformToTarget.f);
        
        // Now we are in Target's Local Space!
        // We can draw the border and handles around the target's self bounds.
        
        const bounds = this.target.getSelfBounds();
        this.drawInterface(ctx, bounds);
        
        ctx.restore(); // Restore to state before this.render()
        // Wait, Node.render() does save/restore. 
        // But we just modified the matrix INSIDE draw().
        // That's fine, Node.render() will restore it after draw() returns.
        // BUT we need to be careful not to mess up if we call super.draw()?
        // Transformer doesn't use super.draw() logic much.
        
    }
    
    drawInterface(ctx: CanvasRenderingContext2D, bounds: Rect) {
        const { borderStroke, handleFill, handleSize = 10 } = this.props;
        const halfHandle = handleSize / 2;
        
        // 1. Draw Border
        ctx.strokeStyle = borderStroke!;
        ctx.lineWidth = 1;
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        // 2. Draw Handles
        // We define 8 handles: TL, T, TR, R, BR, B, BL, L + Rot
        const handles = [
            { x: bounds.x, y: bounds.y, name: 'top-left' },
            { x: bounds.x + bounds.width / 2, y: bounds.y, name: 'top-center' },
            { x: bounds.x + bounds.width, y: bounds.y, name: 'top-right' },
            { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2, name: 'middle-right' },
            { x: bounds.x + bounds.width, y: bounds.y + bounds.height, name: 'bottom-right' },
            { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height, name: 'bottom-center' },
            { x: bounds.x, y: bounds.y + bounds.height, name: 'bottom-left' },
            { x: bounds.x, y: bounds.y + bounds.height / 2, name: 'middle-left' },
        ];
        
        ctx.fillStyle = handleFill!;
        ctx.strokeStyle = borderStroke!;
        
        handles.forEach(h => {
            ctx.beginPath();
            ctx.rect(h.x - halfHandle, h.y - halfHandle, handleSize, handleSize);
            ctx.fill();
            ctx.stroke();
        });
        
        // Rotation handle (sticking out top)
        const rotPos = { x: bounds.x + bounds.width / 2, y: bounds.y - 30 };
        ctx.beginPath();
        ctx.moveTo(bounds.x + bounds.width / 2, bounds.y);
        ctx.lineTo(rotPos.x, rotPos.y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(rotPos.x, rotPos.y, halfHandle, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
    
    // Hit testing for handles
    // Since we are "rendering" in target space, our hit test also needs to map point to target space.
    // BUT Node.hitTest() uses *this* node's transform.
    // Since we messed with render(), our visual representation doesn't match our scene graph transform.
    // This breaks hit testing unless we actually update our scene graph transform to match target.
    
    // REVISED STRATEGY:
    // In update(), we sync our transform to the target.
    // This ensures hitTest works natively.
    
    update(deltaTime: number) {
        if (this.target) {
            // Copy target props to self?
            // Only if we are siblings.
            // If we are in different spaces, we need to decompose the matrix.
            // Complex.
            
            // Alternative: Override hitTest to do the same matrix magic as render.
        }
        super.update(deltaTime);
    }
    
    // Helper to get cursor based on anchor name and rotation
    getCursorForAnchor(anchorName: string): string {
        if (anchorName === 'rotator') return 'grab'; // or url of rotate cursor

        // Map anchor names to cursors:
        // top-left -> nw-resize
        // top-center -> n-resize
        // top-right -> ne-resize
        // ...
        
        // However, if the object is rotated, we need to rotate the cursor too.
        // E.g. if rotated 90deg, top-center (n-resize) becomes e-resize.
        
        const anchors = ['top-left', 'top-center', 'top-right', 'middle-right', 'bottom-right', 'bottom-center', 'bottom-left', 'middle-left'];
        const cursors = ['nw-resize', 'n-resize', 'ne-resize', 'e-resize', 'se-resize', 's-resize', 'sw-resize', 'w-resize'];
        
        const index = anchors.indexOf(anchorName);
        if (index === -1) return 'default';
        
        // Add rotation offset
        // Each step in cursors array corresponds to 45 degrees.
        // 0 -> nw (-135deg), 1 -> n (-90deg), 2 -> ne (-45deg) ...
        
        if (!this.target) return cursors[index];

        const rotation = this.target.getGlobalTransform().decompose().rotation;
        // Convert rotation to 45-degree steps
        // rotation is in radians. 
        // 45 deg = PI / 4.
        const steps = Math.round(rotation / (Math.PI / 4));
        
        // Shift index
        const shiftedIndex = (index + steps) % 8;
        // handle negative modulo
        const finalIndex = (shiftedIndex + 8) % 8;
        
        return cursors[finalIndex];
    }

    hitTest(globalPoint: Point): Node | null {
        if (!this.target) return null;
        
        // Transform global point to Target Local Space (where we draw handles)
        const targetGlobal = this.target.getGlobalTransform();
        const localPoint = targetGlobal.invert().transformPoint(globalPoint);
        
        // Check handles
        const bounds = this.target.getSelfBounds();
        const { handleSize = 10 } = this.props;
        const half = handleSize / 2;
        
        // Check 8 handles
        const handles = [
            { x: bounds.x, y: bounds.y, name: 'top-left' },
            { x: bounds.x + bounds.width / 2, y: bounds.y, name: 'top-center' },
            { x: bounds.x + bounds.width, y: bounds.y, name: 'top-right' },
            { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2, name: 'middle-right' },
            { x: bounds.x + bounds.width, y: bounds.y + bounds.height, name: 'bottom-right' },
            { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height, name: 'bottom-center' },
            { x: bounds.x, y: bounds.y + bounds.height, name: 'bottom-left' },
            { x: bounds.x, y: bounds.y + bounds.height / 2, name: 'middle-left' },
        ];
        
        for (const h of handles) {
            if (
                localPoint.x >= h.x - half && 
                localPoint.x <= h.x + half &&
                localPoint.y >= h.y - half &&
                localPoint.y <= h.y + half
            ) {
                this.activeAnchor = h.name;
                // Set cursor dynamically
                this.cursor = this.getCursorForAnchor(h.name);
                return this;
            }
        }
        
        // Rotation handle
        const rotPos = { x: bounds.x + bounds.width / 2, y: bounds.y - 30 };
        if (
             localPoint.x >= rotPos.x - half && 
             localPoint.x <= rotPos.x + half &&
             localPoint.y >= rotPos.y - half &&
             localPoint.y <= rotPos.y + half
        ) {
            this.activeAnchor = 'rotator';
            this.cursor = 'grab'; // Or a rotation icon
            return this;
        }

        this.cursor = 'default';
        return null;
    }
    
    handleDragStart(e: InteractionEvent) {
        if (!this.target || !this.activeAnchor) return;
        
        e.stopPropagation();
        
        this.startX = e.globalX;
        this.startY = e.globalY;
        
        // Snapshot target state
        this.startWidth = this.target.props.width || 0; // Only works for Rect/Image?
        // For generic nodes, we modify scale.
        this.startScaleX = this.target.scaleX;
        this.startScaleY = this.target.scaleY;
        this.startRotation = this.target.rotation;
        this.startXPos = this.target.x;
        this.startYPos = this.target.y;
        
        // If target doesn't have width/height props (like Container), we rely on selfBounds?
        // Changing scale is safer.
    }
    
    handleDragMove(e: InteractionEvent) {
        if (!this.target || !this.activeAnchor) return;
        
        e.stopPropagation();
        
        // This is a simplified implementation of scaling.
        // A robust implementation needs to handle rotation and center points.
        
        const dx = e.globalX - this.startX;
        const dy = e.globalY - this.startY;
        
        // For now, let's just implement simple scaling for bottom-right handle
        // assuming no rotation on target.
        // To do it properly with rotation, we need to project delta onto the target's local axes.
        
        if (this.activeAnchor === 'bottom-right') {
            // We need to convert global delta to local delta?
            // No, we need to see how much we "stretched" the object.
            
            // Simplified:
            // Calculate distance from center? Or from opposite anchor?
            // Let's assume scaling from Top-Left (anchor point of Node).
            
            // New scale = Old Scale * (New Size / Old Size)
            
            // This is complex math to get right in one go.
            // Let's implement a basic version: adjusting scaleX/scaleY based on drag.
            
            // Project global delta onto target's local axes
            const globalTransform = this.target.getGlobalTransform();
            // Remove translation to get rotation/scale matrix
            // Actually, we can just transform the delta vector by the inverse rotation.
            
            const rotation = this.target.getGlobalTransform().decompose().rotation;
            const cos = Math.cos(-rotation);
            const sin = Math.sin(-rotation);
            
            const localDx = dx * cos - dy * sin;
            const localDy = dx * sin + dy * cos;
            
            // Assume we are scaling based on the selfBounds size
            const bounds = this.target.getSelfBounds();
            if (bounds.width > 0) {
                const newWidth = bounds.width * this.startScaleX + localDx;
                this.target.scaleX = Math.max(0.1, newWidth / bounds.width);
            }
            if (bounds.height > 0) {
                const newHeight = bounds.height * this.startScaleY + localDy;
                this.target.scaleY = Math.max(0.1, newHeight / bounds.height);
            }
        }
        else if (this.activeAnchor === 'rotator') {
            // Calculate angle between center and mouse
            const bounds = this.target.getGlobalBounds();
            const cx = bounds.x + bounds.width / 2;
            const cy = bounds.y + bounds.height / 2;
            
            const angle = Math.atan2(e.globalY - cy, e.globalX - cx);
            // Snap to -90 deg (top) being 0 rotation?
            // The handle is at -90 deg relative to center.
            // So rotation = angle + 90deg
            this.target.rotation = angle + Math.PI / 2;
        }
    }
    
    handleDragEnd(e: InteractionEvent) {
        this.activeAnchor = null;
    }
}

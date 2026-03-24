import { Container, ContainerProps } from '../core/Container';
import { Node, InteractionEvent, Rect } from '../core/Node';
import { Point } from '../core/Matrix';

export interface TransformerProps extends ContainerProps {
    targets?: Node[];
    target?: Node; // For backward compatibility
    borderStroke?: string;
    handleFill?: string;
    handleSize?: number;
    keepRatio?: boolean;
    enabledAnchors?: string[]; // 'top-left', 'top-right', etc.
}

/**
 * A specialized group that provides UI controls to transform one or more target nodes.
 */
export class Transformer extends Container {
    declare props: TransformerProps;
    private targets: Node[] = [];
    
    // Combined bounds of all targets in global space
    private combinedBounds: Rect = { x: 0, y: 0, width: 0, height: 0 };
    
    // Drag state
    private activeAnchor: string | null = null;
    private startPointer: Point = { x: 0, y: 0 };
    private startTargetsProps: Array<{ x: number, y: number, scaleX: number, scaleY: number, rotation: number }> = [];
    private startCombinedBounds: Rect = { x: 0, y: 0, width: 0, height: 0 };

    constructor(props: TransformerProps = {}) {
        super(props);
        this.props.borderStroke = props.borderStroke || '#0096fd';
        this.props.handleFill = props.handleFill || '#ffffff';
        this.props.handleSize = props.handleSize || 10;
        this.props.keepRatio = props.keepRatio !== undefined ? props.keepRatio : false;
        this.draggable = true; // Essential for Canvas to dispatch drag events to us
        
        if (props.targets) {
            this.attachTo(props.targets);
        } else if (props.target) {
            this.attachTo(props.target);
        }

        // Bind events
        this.events.onDragStart = this.handleDragStart.bind(this);
        this.events.onDragMove = this.handleDragMove.bind(this);
        this.events.onDragEnd = this.handleDragEnd.bind(this);
    }

    attachTo(nodes: Node | Node[]) {
        this.targets = Array.isArray(nodes) ? nodes : [nodes];
        this.updateCombinedBounds();
        this.requestRedraw();
    }

    detach() {
        this.targets = [];
        this.requestRedraw();
    }

    private updateCombinedBounds() {
        if (this.targets.length === 0) {
            this.combinedBounds = { x: 0, y: 0, width: 0, height: 0 };
            return;
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        this.targets.forEach(target => {
            const bounds = target.getGlobalBounds();
            minX = Math.min(minX, bounds.x);
            minY = Math.min(minY, bounds.y);
            maxX = Math.max(maxX, bounds.x + bounds.width);
            maxY = Math.max(maxY, bounds.y + bounds.height);
        });

        this.combinedBounds = {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    // Override render to draw UI on top of targets
    render(ctx: CanvasRenderingContext2D) {
        if (this.targets.length === 0) return;
        
        this.updateCombinedBounds();

        ctx.save();
        
        // We draw in global space for simplicity when handling multiple targets.
        // We need to account for our own parent's transform.
        const parentGlobal = this.parent ? this.parent.getGlobalTransform() : this.getGlobalTransform().identity();
        const invParent = parentGlobal.invert();
        ctx.transform(invParent.a, invParent.b, invParent.c, invParent.d, invParent.e, invParent.f);

        const bounds = this.combinedBounds;
        const { handleSize = 10, borderStroke } = this.props;
        const halfHandle = handleSize / 2;

        // Draw selection box
        ctx.strokeStyle = borderStroke!;
        ctx.lineWidth = 1;
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

        // Draw 8 handles
        const handles = [
            { x: bounds.x, y: bounds.y, name: 'top-left' },
            { x: bounds.x + bounds.width / 2, y: bounds.y, name: 'top-center' },
            { x: bounds.x + bounds.width, y: bounds.y, name: 'top-right' },
            { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2, name: 'middle-right' },
            { x: bounds.x + bounds.width, y: bounds.y + bounds.height, name: 'bottom-right' },
            { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height, name: 'bottom-center' },
            { x: bounds.x, y: bounds.y + bounds.height, name: 'bottom-left' },
            { x: bounds.x, y: bounds.y + bounds.height / 2, name: 'middle-left' },
        ].filter(h => !this.props.enabledAnchors || this.props.enabledAnchors.includes(h.name));

        ctx.fillStyle = this.props.handleFill!;
        for (const h of handles) {
            ctx.beginPath();
            ctx.rect(h.x - halfHandle, h.y - halfHandle, handleSize, handleSize);
            ctx.fill();
            ctx.stroke();
        }

        // Draw rotation handle
        const rotPos = { x: bounds.x + bounds.width / 2, y: bounds.y - 30 };
        ctx.beginPath();
        ctx.moveTo(bounds.x + bounds.width / 2, bounds.y);
        ctx.lineTo(rotPos.x, rotPos.y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(rotPos.x, rotPos.y, halfHandle, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    // Helper to get cursor based on anchor name and rotation
    getCursorForAnchor(anchorName: string): string {
        if (anchorName === 'rotator') return 'grab';

        const anchors = ['top-left', 'top-center', 'top-right', 'middle-right', 'bottom-right', 'bottom-center', 'bottom-left', 'middle-left'];
        const cursors = ['nw-resize', 'n-resize', 'ne-resize', 'e-resize', 'se-resize', 's-resize', 'sw-resize', 'w-resize'];
        
        const index = anchors.indexOf(anchorName);
        if (index === -1) return 'default';
        
        return cursors[index];
    }

    hitTest(globalPoint: Point): Node | null {
        if (this.targets.length === 0) return null;
        
        const bounds = this.combinedBounds;
        const { handleSize = 10 } = this.props;
        const half = handleSize / 2;
        
        // Check handles
        const handles = [
            { x: bounds.x, y: bounds.y, name: 'top-left' },
            { x: bounds.x + bounds.width / 2, y: bounds.y, name: 'top-center' },
            { x: bounds.x + bounds.width, y: bounds.y, name: 'top-right' },
            { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2, name: 'middle-right' },
            { x: bounds.x + bounds.width, y: bounds.y + bounds.height, name: 'bottom-right' },
            { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height, name: 'bottom-center' },
            { x: bounds.x, y: bounds.y + bounds.height, name: 'bottom-left' },
            { x: bounds.x, y: bounds.y + bounds.height / 2, name: 'middle-left' },
        ].filter(h => !this.props.enabledAnchors || this.props.enabledAnchors.includes(h.name));
        
        for (const h of handles) {
            if (
                globalPoint.x >= h.x - half && 
                globalPoint.x <= h.x + half &&
                globalPoint.y >= h.y - half &&
                globalPoint.y <= h.y + half
            ) {
                this.activeAnchor = h.name;
                this.cursor = this.getCursorForAnchor(h.name);
                return this;
            }
        }
        
        // Rotation handle
        const rotPos = { x: bounds.x + bounds.width / 2, y: bounds.y - 30 };
        if (
             globalPoint.x >= rotPos.x - half && 
             globalPoint.x <= rotPos.x + half &&
             globalPoint.y >= rotPos.y - half &&
             globalPoint.y <= rotPos.y + half
        ) {
            this.activeAnchor = 'rotator';
            this.cursor = 'grab';
            return this;
        }

        return null;
    }
    
    handleDragStart(e: InteractionEvent) {
        if (this.targets.length === 0 || !this.activeAnchor) return;
        
        e.stopPropagation();
        
        this.startPointer = { x: e.globalX, y: e.globalY };
        this.updateCombinedBounds();
        this.startCombinedBounds = { ...this.combinedBounds };
        this.startTargetsProps = this.targets.map(target => ({
            x: target.x,
            y: target.y,
            scaleX: target.scaleX,
            scaleY: target.scaleY,
            rotation: target.rotation
        }));
    }
    
    handleDragMove(e: InteractionEvent) {
        if (this.targets.length === 0 || !this.activeAnchor) return;
        
        e.stopPropagation();
        
        const deltaX = e.globalX - this.startPointer.x;
        const deltaY = e.globalY - this.startPointer.y;
        
        const center = {
            x: this.startCombinedBounds.x + this.startCombinedBounds.width / 2,
            y: this.startCombinedBounds.y + this.startCombinedBounds.height / 2
        };

        if (this.activeAnchor === 'rotator') {
             let angle = Math.atan2(e.globalY - center.y, e.globalX - center.x);
             angle += Math.PI / 2; // Offset for top rotator

             if (e.originalEvent && (e.originalEvent as MouseEvent).shiftKey) {
                 const snapAngle = Math.PI / 4;
                 angle = Math.round(angle / snapAngle) * snapAngle;
             }
             
             const startAngle = Math.atan2(this.startPointer.y - center.y, this.startPointer.x - center.x) + Math.PI / 2;
             const deltaAngle = angle - startAngle;

             this.targets.forEach((target, i) => {
                 const start = this.startTargetsProps[i];
                 target.rotation = start.rotation + deltaAngle;
                 
                 // Rotate position
                 const dx = start.x - center.x;
                 const dy = start.y - center.y;
                 const cos = Math.cos(deltaAngle);
                 const sin = Math.sin(deltaAngle);
                 
                 target.x = center.x + (dx * cos - dy * sin);
                 target.y = center.y + (dx * sin + dy * cos);
             });
        } else {
             // Scaling logic
             let scaleX = 1;
             let scaleY = 1;

             if (this.activeAnchor.includes('right')) {
                 scaleX = 1 + deltaX / (this.startCombinedBounds.width || 1);
             } else if (this.activeAnchor.includes('left')) {
                 scaleX = 1 - deltaX / (this.startCombinedBounds.width || 1);
             }

             if (this.activeAnchor.includes('bottom')) {
                 scaleY = 1 + deltaY / (this.startCombinedBounds.height || 1);
             } else if (this.activeAnchor.includes('top')) {
                 scaleY = 1 - deltaY / (this.startCombinedBounds.height || 1);
             }

             if (this.props.keepRatio) {
                 const maxScale = Math.max(Math.abs(scaleX), Math.abs(scaleY));
                 scaleX = scaleX < 0 ? -maxScale : maxScale;
                 scaleY = scaleY < 0 ? -maxScale : maxScale;
             }
             
             this.targets.forEach((target, i) => {
                 const start = this.startTargetsProps[i];
                 target.scaleX = start.scaleX * scaleX;
                 target.scaleY = start.scaleY * scaleY;
                 
                 // Move target position relative to the scaling center (anchored by the opposite side)
                 // This is a bit complex for multi-selection. 
                 // Usually we scale from the center or from the opposite anchor.
                 // For now, let's scale from the center of combined bounds.
                 
                 const dx = (start.x - center.x) * scaleX;
                 const dy = (start.y - center.y) * scaleY;
                 target.x = center.x + dx;
                 target.y = center.y + dy;
             });
        }
        
        this.requestRedraw();
    }
    
    handleDragEnd(_e: InteractionEvent) {
        this.activeAnchor = null;
    }
}
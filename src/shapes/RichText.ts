import { Node, NodeProps, Rect } from '../core/Node';

export interface TextSegment {
    text: string;
    fill?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: 'none' | 'underline' | 'line-through';
}

export interface RichTextProps extends NodeProps {
    segments: TextSegment[];
    width?: number;
    lineHeight?: number;
    align?: 'left' | 'center' | 'right';
}

/**
 * A shape that renders text with multiple styles.
 */
export class RichText extends Node {
    declare props: RichTextProps;

    constructor(props: RichTextProps) {
        super(props);
        this.props.lineHeight = props.lineHeight || 1.2;
        this.props.align = props.align || 'left';
    }

    draw(ctx: CanvasRenderingContext2D) {
        const { segments = [], width, lineHeight = 1.2, align = 'left' } = this.props;
        if (segments.length === 0) return;

        // We'll implement a simple line-by-line rendering.
        // For now, let's assume no automatic word wrap across segments for simplicity,
        // but we'll layout segments horizontally.

        let currentX = 0;
        let maxLineHeight = 0;

        // 1. Calculate line heights and total width if needed
        // 2. Draw segments
        
        // This is a complex implementation if we want full wrapping.
        // Let's implement a "Flow" layout for segments.

        const lines: Array<Array<{ segment: TextSegment, x: number, width: number, height: number }>> = [[]];
        let currentLine = lines[0];

        segments.forEach(seg => {
            const fontSize = seg.fontSize || this.props.fontSize || 16;
            const fontFamily = seg.fontFamily || this.props.fontFamily || 'Arial';
            const fontWeight = seg.fontWeight || 'normal';
            const fontStyle = seg.fontStyle || 'normal';
            
            ctx.font = `${fontStyle} normal ${fontWeight} ${fontSize}px ${fontFamily}`;
            const metrics = ctx.measureText(seg.text);
            const segWidth = metrics.width;
            const segHeight = fontSize * lineHeight;

            if (width && currentX + segWidth > width && currentX > 0) {
                // Wrap to next line
                currentX = 0;
                maxLineHeight = 0;
                currentLine = [];
                lines.push(currentLine);
            }

            currentLine.push({
                segment: seg,
                x: currentX,
                width: segWidth,
                height: segHeight
            });

            currentX += segWidth;
            maxLineHeight = Math.max(maxLineHeight, segHeight);
        });

        // Draw the lines
        let y = 0;
        lines.forEach(line => {
            let lineMaxHeight = 0;
            let lineWidth = 0;
            line.forEach(item => {
                lineMaxHeight = Math.max(lineMaxHeight, item.height);
                lineWidth += item.width;
            });

            let offsetX = 0;
            if (width && align === 'center') offsetX = (width - lineWidth) / 2;
            if (width && align === 'right') offsetX = width - lineWidth;

            line.forEach(item => {
                const seg = item.segment;
                const fontSize = seg.fontSize || this.props.fontSize || 16;
                const fontFamily = seg.fontFamily || this.props.fontFamily || 'Arial';
                const fontWeight = seg.fontWeight || 'normal';
                const fontStyle = seg.fontStyle || 'normal';

                ctx.font = `${fontStyle} normal ${fontWeight} ${fontSize}px ${fontFamily}`;
                ctx.fillStyle = seg.fill || this.props.fill || 'black';
                ctx.textBaseline = 'top';
                
                // Align to baseline of the tallest item in line? 
                // For simplicity, align to top.
                ctx.fillText(seg.text, item.x + offsetX, y);

                if (seg.textDecoration === 'underline') {
                    ctx.beginPath();
                    ctx.moveTo(item.x + offsetX, y + fontSize);
                    ctx.lineTo(item.x + offsetX + item.width, y + fontSize);
                    ctx.stroke();
                }
            });
            y += lineMaxHeight;
        });
    }

    getSelfBounds(): Rect {
        // Approximate bounds
        const { segments = [], width, lineHeight = 1.2 } = this.props;
        if (segments.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

        // We need a context to measure
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        let currentX = 0;
        let totalHeight = 0;
        let maxLineWidth = 0;
        let maxLineHeight = 0;

        segments.forEach(seg => {
            const fontSize = seg.fontSize || 16;
            ctx.font = `normal normal ${seg.fontWeight || 'normal'} ${fontSize}px ${seg.fontFamily || 'Arial'}`;
            const segWidth = ctx.measureText(seg.text).width;
            const segHeight = fontSize * lineHeight;

            if (width && currentX + segWidth > width && currentX > 0) {
                totalHeight += maxLineHeight;
                maxLineWidth = Math.max(maxLineWidth, currentX);
                currentX = 0;
                maxLineHeight = 0;
            }

            currentX += segWidth;
            maxLineHeight = Math.max(maxLineHeight, segHeight);
        });

        totalHeight += maxLineHeight;
        maxLineWidth = Math.max(maxLineWidth, currentX);

        return {
            x: 0,
            y: 0,
            width: width || maxLineWidth,
            height: totalHeight
        };
    }
}
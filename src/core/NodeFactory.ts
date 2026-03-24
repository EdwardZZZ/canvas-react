import { Node } from './Node';
import { Container } from './Container';
import * as Shapes from '../shapes';

export class NodeFactory {
    static create(json: any): Node | null {
        const type = json.className || json.type;
        if (!json || !type) return null;
        
        let node: Node | null = null;
        
        if (type === 'Container' || type === 'Layer' || type === 'Group') {
            node = new Container(json.props);
            if (json.children && Array.isArray(json.children)) {
                json.children.forEach((childJson: any) => {
                    const child = NodeFactory.create(childJson);
                    if (child) {
                        (node as Container).add(child);
                    }
                });
            }
        } else {
            // Find in shapes
            const ShapeClass = (Shapes as any)[type];
            if (ShapeClass) {
                node = new ShapeClass(json.props);
            }
        }
        
        return node;
    }
}
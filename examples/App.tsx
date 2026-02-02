import { useState } from 'react';
import Canvas from '../src/react/Canvas';
import { Rect, Circle, Text, Group, Image, Line, Path, Transformer } from '../src/react/Shapes';
import { useFrame } from '../src/react/CanvasContext';
import { InteractionEvent, Node } from '../src/core/Node';

const ClippingDemo = () => {
    return (
        <Group x={550} y={450}>
            <Text text="Clipping Demo:" x={0} y={-20} fontSize={16} fill="#333" />
            
            <Group 
                x={0} 
                y={0} 
                clip={true} 
                clipX={0} 
                clipY={0} 
                clipWidth={100} 
                clipHeight={100}
            >
                {/* Background of clipping area */}
                <Rect x={0} y={0} width={100} height={100} fill="#eee" />
                
                {/* Circle partially clipped */}
                <Circle x={100} y={100} radius={50} fill="purple" />
                
                {/* Text partially clipped */}
                <Text text="Clipped Text" x={10} y={50} fontSize={20} fill="black" />
            </Group>
            
            {/* Border to show clip area */}
            <Rect x={0} y={0} width={100} height={100} fill="transparent" />
            <Line points={[0,0, 100,0, 100,100, 0,100, 0,0]} stroke="#999" lineWidth={1} />
        </Group>
    );
};

const TransformerDemo = () => {
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    // Helper to select node
    const handleSelect = (e: InteractionEvent) => {
        // e.target is the node that was clicked
        // We need to attach transformer to it.
        // Note: e.target is the Engine Node instance.
        console.log('Selected:', e.target);
        e.cancelBubble = true; // Stop propagation
        setSelectedNode(e.target);
    };

    const handleDeselect = () => {
        setSelectedNode(null);
    };

    return (
        <Group x={100} y={100}>
            <Text text="Transformer Demo (Click shapes):" x={0} y={-20} fontSize={16} fill="#333" />
            
            {/* Background to catch clicks for deselect */}
            <Rect 
                x={-20} y={-20} width={300} height={200} 
                fill="transparent" 
                onClick={handleDeselect} 
            />

            <Rect 
                x={0} y={0} width={80} height={80} 
                fill="lightblue" 
                onClick={handleSelect}
                draggable
            />
            
            <Circle 
                x={150} y={40} radius={40} 
                fill="lightgreen" 
                onClick={handleSelect}
                draggable
            />
            
            <Text 
                text="Rotatable" 
                x={0} y={100} fontSize={20} 
                fill="purple"
                onClick={handleSelect}
                draggable
            />

            {/* Transformer */}
            {selectedNode && (
                <Transformer target={selectedNode} />
            )}
        </Group>
    );
};

const PathDemo = () => {
    return (
        <Group x={550} y={300}>
            <Text text="Path Demo:" x={0} y={-20} fontSize={16} fill="#333" />
            
            {/* Heart Shape */}
            <Path 
                data="M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z" 
                fill="pink" 
                stroke="red" 
                lineWidth={2} 
                x={0} 
                y={0}
                scaleX={0.8}
                scaleY={0.8}
            />
        </Group>
    );
};

const DragDemo = () => {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [color, setColor] = useState('purple');

    return (
        <Group x={100} y={520}>
            <Text text="Drag Me:" x={0} y={-20} fontSize={16} fill="#333" />
            
            <Rect 
                x={pos.x} 
                y={pos.y} 
                width={80} 
                height={50} 
                fill={color}
                draggable={true}
                onDragStart={() => setColor('orange')}
                onDragEnd={() => setColor('purple')}
                onDragMove={(e) => {
                    // Update position relative to the group
                    // Mouse coordinates in e.globalX/Y are global.
                    // Group is at 100, 520.
                    // We need to subtract Group's position to get local position for the Rect.
                    // Note: This assumes simple hierarchy (Rect inside Group inside Root).
                    // And Group has no rotation/scale.
                    
                    const groupX = 100;
                    const groupY = 520;
                    
                    // Center the rect on cursor? Or keep offset?
                    // To keep offset properly, we'd need to store offset at DragStart.
                    // For this simple demo, let's center it on cursor.
                    
                    setPos({
                        x: e.globalX - groupX - 40, // 40 is half width
                        y: e.globalY - groupY - 25  // 25 is half height
                    });
                }}
            />
            <Text text="Draggable (Log Only)" x={0} y={60} fontSize={12} fill="#666" />
        </Group>
    );
};

const InteractiveScene = () => {
  const [active, setActive] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <Group x={100} y={450}>
      <Text text="Interaction (Click me):" x={0} y={-20} fontSize={16} fill="#333" />
      
      <Rect 
        x={0} 
        y={0} 
        width={100} 
        height={50} 
        fill={active ? "orange" : "blue"}
        onClick={(e) => {
            console.log("Rect Clicked!", e);
            setActive(!active);
        }}
      />
      
      <Circle 
        x={160} 
        y={25} 
        radius={25} 
        fill={hover ? "red" : "green"}
        onClick={() => console.log("Circle Clicked!")}
        onMouseEnter={() => setHover(true)} 
        onMouseLeave={() => setHover(false)} 
      />
    </Group>
  );
};

const AnimatedScene = () => {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  useFrame((time) => {
    // Update state based on time
    setRotation(time * 0.001);
    setScale(1 + Math.sin(time * 0.003) * 0.2);
  });

  return (
    <Group x={400} y={300} rotation={rotation}>
      <Rect x={-50} y={-50} width={100} height={100} fill="rgba(0,0,255,0.5)" />
      <Circle x={100} y={0} radius={20} fill="red" scaleX={scale} scaleY={scale} />
      <Circle x={-100} y={0} radius={20} fill="green" />
      <Circle x={0} y={100} radius={20} fill="yellow" />
      <Circle x={0} y={-100} radius={20} fill="purple" />
    </Group>
  );
};

const ZIndexDemo = () => {
    return (
        <Group x={300} y={450}>
            <Text text="Z-Index Demo:" x={0} y={-20} fontSize={16} fill="#333" />
            
            {/* Red box at zIndex 10 (top) */}
            <Rect x={20} y={20} width={60} height={60} fill="red" zIndex={10} />
            
            {/* Blue box at zIndex 0 (bottom) */}
            <Rect x={0} y={0} width={60} height={60} fill="blue" zIndex={0} />
            
            {/* Green box at zIndex 5 (middle) */}
            <Rect x={40} y={40} width={60} height={60} fill="green" zIndex={5} />
        </Group>
    );
};

const MultilineTextDemo = () => {
    return (
        <Group x={600} y={200}>
            <Text text="Multiline Demo:" x={0} y={-20} fontSize={16} fill="#333" />
            
            {/* Box to show width */}
            <Rect width={150} height={100} fill="rgba(0,0,0,0.05)" />
            
            <Text 
                text="This is a long text that should wrap automatically to the next line." 
                width={150} 
                fontSize={14} 
                fill="#333"
                lineHeight={1.4}
                align="left"
            />
            
            <Text 
                text="Centered Text Demo with wrapping" 
                x={0}
                y={80}
                width={150} 
                fontSize={12} 
                fill="blue"
                align="center"
            />
        </Group>
    );
};

const AssetAndFilterDemo = () => {
    return (
        <Group x={300} y={550}>
            <Text text="Assets & Filters:" x={0} y={-20} fontSize={16} fill="#333" />
            
            {/* Blurred Image */}
            <Group x={0} y={0}>
                <Image 
                    src="https://vitejs.dev/logo.svg" 
                    width={50} 
                    height={50}
                    filter="blur(2px)" 
                />
                <Text text="Blur" x={15} y={60} fontSize={12} />
            </Group>

            {/* Shadowed Rect */}
            <Group x={80} y={0}>
                <Rect 
                    width={50} 
                    height={50} 
                    fill="cyan"
                    shadowColor="rgba(0,0,0,0.5)"
                    shadowBlur={10}
                    shadowOffsetX={5}
                    shadowOffsetY={5}
                />
                <Text text="Shadow" x={5} y={60} fontSize={12} />
            </Group>
            
            {/* Grayscale Image */}
            <Group x={160} y={0}>
                <Image 
                    src="https://vitejs.dev/logo.svg" 
                    width={50} 
                    height={50}
                    filter="grayscale(100%)" 
                />
                <Text text="Gray" x={15} y={60} fontSize={12} />
            </Group>
        </Group>
    );
};

function App() {
  const [debug, setDebug] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1>React Canvas Engine (TS)</h1>
      <p>
        Declarative rendering with React components. 
        <button 
          onClick={() => setDebug(!debug)}
          style={{ 
            marginLeft: '10px', 
            padding: '5px 10px', 
            background: debug ? '#0096fd' : '#eee', 
            color: debug ? '#fff' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {debug ? 'Disable DevTools' : 'Enable DevTools'}
        </button>
      </p>
      
      <Canvas width={800} height={700} debug={debug} style={{ border: '1px solid #ddd', borderRadius: '8px' }}>
        {/* Background */}
        <Rect width={800} height={700} fill="#f9f9f9" />
        
        {/* Transformer Demo */}
        <TransformerDemo />
        
        {/* Title */}
        <Text text="Declarative Canvas" x={20} y={40} fontSize={24} fill="#333" />
        
        {/* Static Elements */}
        <Rect x={50} y={80} width={100} height={100} fill="rgba(255, 0, 0, 0.2)" />

        {/* New Shapes Demo */}
        <Group x={50} y={200}>
          <Text text="New Shapes:" x={0} y={-10} fontSize={16} fill="#666" />
          
          {/* Line */}
          <Line 
            points={[0, 0, 50, 50, 100, 0]} 
            stroke="blue" 
            lineWidth={3} 
            lineCap="round" 
            lineJoin="round" 
          />
          
          {/* Image (using placeholder) */}
          <Group x={0} y={60}>
            <Image 
              src="https://vitejs.dev/logo.svg" 
              x={0} 
              y={0} 
              width={50} 
              height={50} 
            />
            <Text text="Image" x={60} y={30} fontSize={14} />
          </Group>
        </Group>
        
        {/* Animated Group */}
        <AnimatedScene />
        
        {/* Nested Group */}
        <Group x={600} y={100}>
          <Rect width={50} height={50} fill="orange" />
          <Text text="Nested" x={0} y={70} fontSize={14} />
        </Group>

        {/* Multiline Text Demo */}
        <MultilineTextDemo />

        {/* Interactive Demo */}
        <InteractiveScene />

        {/* Z-Index Demo */}
        <ZIndexDemo />

        {/* Path Demo */}
        <PathDemo />

        {/* Clipping Demo */}
        <ClippingDemo />

        {/* Drag Demo */}
        <DragDemo />

        {/* Assets & Filters Demo */}
        <AssetAndFilterDemo />

      </Canvas>
    </div>
  );
}

export default App;

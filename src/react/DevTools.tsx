import React, { useState, useEffect, useContext } from 'react';
import { SceneContext } from './CanvasContext';
import { Node } from '../core/Node';
import { Container } from '../core/Container';

// --- Styles ---
const styles = {
  container: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    width: '300px',
    height: '100%',
    backgroundColor: '#2d2d2d',
    color: '#e0e0e0',
    fontFamily: 'monospace',
    fontSize: '12px',
    borderLeft: '1px solid #444',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column' as const,
    boxShadow: '-2px 0 10px rgba(0,0,0,0.3)',
  },
  header: {
    padding: '10px',
    backgroundColor: '#383838',
    borderBottom: '1px solid #444',
    fontWeight: 'bold' as const,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'grab',
    userSelect: 'none' as const,
  },
  treeContainer: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '5px',
  },
  propsContainer: {
    height: '200px',
    borderTop: '1px solid #444',
    padding: '10px',
    backgroundColor: '#252526',
    overflowY: 'auto' as const,
  },
  nodeItem: {
    padding: '2px 0',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  nodeSelected: {
    backgroundColor: '#37373d',
    color: '#fff',
  },
  propRow: {
    display: 'flex',
    marginBottom: '4px',
  },
  propKey: {
    color: '#9cdcfe',
    width: '80px',
    flexShrink: 0,
  },
  propValue: {
    color: '#ce9178',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-all' as const,
  },
  highlighter: {
    position: 'absolute' as const,
    border: '2px solid #0096fd',
    pointerEvents: 'none' as const,
    zIndex: 9998,
    backgroundColor: 'rgba(0, 150, 253, 0.1)',
  }
};

interface TreeNodeProps {
  node: Node;
  depth: number;
  selectedNode: Node | null;
  onSelect: (node: Node) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, depth, selectedNode, onSelect }) => {
  const [expanded, setExpanded] = useState(true);
  const isContainer = node instanceof Container;
  const isSelected = node === selectedNode;
  const hasChildren = isContainer && (node as Container).children.length > 0;
  const name = node.constructor.name;
  
  // Simple ID for display if available
  const id = (node.props as any).id || (node.props as any).name || '';

  return (
    <div>
      <div 
        style={{
          ...styles.nodeItem,
          paddingLeft: `${depth * 15}px`,
          ...(isSelected ? styles.nodeSelected : {})
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
      >
        <span 
          onClick={(e) => {
            if (hasChildren) {
              e.stopPropagation();
              setExpanded(!expanded);
            }
          }}
          style={{ 
            cursor: hasChildren ? 'pointer' : 'default',
            display: 'inline-block',
            width: '12px',
            textAlign: 'center',
            color: '#888'
          }}
        >
          {hasChildren ? (expanded ? '▼' : '▶') : '•'}
        </span>
        <span style={{ color: isContainer ? '#dcdcaa' : '#4ec9b0' }}>{name}</span>
        {id && <span style={{ color: '#888', marginLeft: '5px' }}>#{id}</span>}
      </div>
      
      {expanded && isContainer && (node as Container).children.map((child, i) => (
        <TreeNode 
          key={i} 
          node={child} 
          depth={depth + 1} 
          selectedNode={selectedNode}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export const DevTools: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const stage = useContext(SceneContext);
  const [updateCount, setUpdateCount] = useState(0);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [highlightRect, setHighlightRect] = useState<React.CSSProperties | null>(null);

  // Dragging state
  const [isPanelDragging, setIsPanelDragging] = useState(false);
  const [panelPos, setPanelPos] = useState({ x: 0, y: 0 }); // Offset from right:0, top:0
  const dragStartRef = React.useRef({ x: 0, y: 0, startPanelX: 0, startPanelY: 0 });

  // Poll for scene graph changes
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateCount(c => c + 1);
    }, 500); // 2Hz update rate
    return () => clearInterval(interval);
  }, []);

  // Update highlight rect when selected node changes or on tick
  useEffect(() => {
    if (selectedNode) {
        try {
            const bounds = selectedNode.getGlobalBounds();
            // Bounds are in canvas space. We need to display DOM overlay.
            // The overlay is positioned absolute relative to the Canvas container.
            // Assuming Canvas container is relative/absolute.
            setHighlightRect({
                left: bounds.x,
                top: bounds.y,
                width: bounds.width,
                height: bounds.height
            });
        } catch (_e) {
            setHighlightRect(null);
        }
    } else {
        setHighlightRect(null);
    }
  }, [selectedNode, updateCount]);

  // Handle panel dragging
  useEffect(() => {
    if (!isPanelDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        
        // Update position (x is offset from right, so subtract dx)
        setPanelPos({
            x: dragStartRef.current.startPanelX - dx,
            y: dragStartRef.current.startPanelY + dy
        });
    };

    const handleMouseUp = () => {
        setIsPanelDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanelDragging]);

  if (!stage) return null;

  return (
    <>
      {/* Highlighter Overlay */}
      {highlightRect && (
        <div style={{ ...styles.highlighter, ...highlightRect }} />
      )}

      {/* DevTools Panel */}
      <div 
        style={{
            ...styles.container,
            right: `${panelPos.x}px`,
            top: `${panelPos.y}px`
        }}
      >
        <div 
            style={styles.header}
            onMouseDown={(e) => {
                setIsPanelDragging(true);
                dragStartRef.current = {
                    x: e.clientX,
                    y: e.clientY,
                    startPanelX: panelPos.x,
                    startPanelY: panelPos.y
                };
            }}
        >
          <span>Scene Graph</span>
          {onClose && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0 5px' }}
            >
              ✕
            </button>
          )}
        </div>
        
        <div style={styles.treeContainer} onClick={() => { setSelectedNode(null); }}>
          <TreeNode 
            node={stage} 
            depth={0} 
            selectedNode={selectedNode}
            onSelect={setSelectedNode}
          />
        </div>

        <div style={styles.propsContainer}>
          <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>Properties</div>
          {selectedNode ? (
            Object.entries(selectedNode.props).map(([key, value]) => {
                if (typeof value === 'function') return null;
                if (key === 'children') return null; // handled by tree
                
                let displayValue = String(value);
                if (typeof value === 'object' && value !== null) {
                    try {
                        displayValue = JSON.stringify(value);
                    } catch {
                        displayValue = '[Object]';
                    }
                }

                return (
                  <div key={key} style={styles.propRow}>
                    <div style={styles.propKey}>{key}:</div>
                    <div style={styles.propValue}>{displayValue}</div>
                  </div>
                );
            })
          ) : (
            <div style={{ color: '#666' }}>Select a node to view properties</div>
          )}
          {selectedNode && (
            <>
              <div style={styles.propRow}>
                <div style={styles.propKey}>x:</div>
                <div style={styles.propValue}>{selectedNode.x.toFixed(2)}</div>
              </div>
              <div style={styles.propRow}>
                <div style={styles.propKey}>y:</div>
                <div style={styles.propValue}>{selectedNode.y.toFixed(2)}</div>
              </div>
              <div style={styles.propRow}>
                <div style={styles.propKey}>rotation:</div>
                <div style={styles.propValue}>{selectedNode.rotation.toFixed(2)}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

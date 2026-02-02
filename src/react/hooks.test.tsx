import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFrame, RenderContext } from './CanvasContext';
import React from 'react';

describe('useFrame Hook', () => {
  it('registers callback to render loop', () => {
    const mockRenderLoop = {
      add: vi.fn(),
      remove: vi.fn(),
      run: vi.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RenderContext.Provider value={mockRenderLoop}>
        {children}
      </RenderContext.Provider>
    );

    const callback = vi.fn();
    const { unmount } = renderHook(() => useFrame(callback), { wrapper });

    expect(mockRenderLoop.add).toHaveBeenCalledWith(callback);

    unmount();
    expect(mockRenderLoop.remove).toHaveBeenCalledWith(callback);
  });

  it('does nothing if no context', () => {
    // Should not throw
    renderHook(() => useFrame(() => {}));
  });
});

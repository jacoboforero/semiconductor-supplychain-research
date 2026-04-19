import { useCallback, useLayoutEffect, useRef, useState } from "react";

export function useAnchorPositions(dependencies = []) {
  const containerRef = useRef(null);
  const nodesRef = useRef(new Map());
  const [positions, setPositions] = useState({});

  const registerAnchor = useCallback(
    (id) => (node) => {
      if (!id) {
        return;
      }
      if (node) {
        nodesRef.current.set(id, node);
      } else {
        nodesRef.current.delete(id);
      }
    },
    []
  );

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    let frame = null;

    const compute = () => {
      if (!containerRef.current) {
        return;
      }
      const bounds = containerRef.current.getBoundingClientRect();
      const next = {};
      for (const [id, node] of nodesRef.current.entries()) {
        const rect = node.getBoundingClientRect();
        next[id] = {
          left: rect.left - bounds.left,
          right: rect.right - bounds.left,
          top: rect.top - bounds.top,
          bottom: rect.bottom - bounds.top,
          width: rect.width,
          height: rect.height,
          x: rect.left - bounds.left + rect.width / 2,
          y: rect.top - bounds.top + rect.height / 2,
        };
      }
      setPositions(next);
    };

    const schedule = () => {
      if (frame != null) {
        cancelAnimationFrame(frame);
      }
      frame = requestAnimationFrame(compute);
    };

    schedule();

    const observer = new ResizeObserver(schedule);
    observer.observe(container);
    for (const node of nodesRef.current.values()) {
      observer.observe(node);
    }
    window.addEventListener("resize", schedule);

    return () => {
      if (frame != null) {
        cancelAnimationFrame(frame);
      }
      observer.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, dependencies);

  return {
    containerRef,
    registerAnchor,
    positions,
  };
}

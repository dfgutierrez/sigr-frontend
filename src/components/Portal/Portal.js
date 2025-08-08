import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Portal({ children, containerId = "modal-root" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    let container = document.getElementById(containerId);
    
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "0";
      container.style.right = "0";
      container.style.bottom = "0";
      container.style.zIndex = "99999";
      container.style.pointerEvents = "none";
      document.body.appendChild(container);
    }
    
    containerRef.current = container;

    return () => {
      // Cleanup: remove container if it's empty when component unmounts
      if (container && container.children.length === 0 && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, [containerId]);

  if (!containerRef.current) {
    return null;
  }

  return createPortal(children, containerRef.current);
}
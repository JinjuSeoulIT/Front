"use client";

import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type PortalProps = {
  children: ReactNode;
  containerId?: string;
};

// Client-only portal wrapper to safely render into a DOM node on the client side
export default function ClientPortal({ children, containerId = 'portal-root' }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Ensure DOM APIs exist
    if (typeof document === 'undefined') return;

    let el = document.getElementById(containerId);
    if (!el) {
      el = document.createElement('div');
      el.id = containerId;
      document.body.appendChild(el);
    }
    setPortalEl(el);
    setMounted(true);
  }, [containerId]);

  if (!mounted || !portalEl) return null;

  return createPortal(children, portalEl);
}

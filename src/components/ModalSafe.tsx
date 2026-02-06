"use client";

import React from 'react';
import ClientPortal from './ClientPortal';

type Props = {
  children: React.ReactNode;
  containerId?: string;
};

// A safe wrapper to render modal content via a client-side portal
export default function ModalSafe({ children, containerId }: Props) {
  return (
    <ClientPortal containerId={containerId ?? 'portal-root'}>
      {children}
    </ClientPortal>
  );
}

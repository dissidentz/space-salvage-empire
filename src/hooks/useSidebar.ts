'use client';

import * as React from 'react';

export type SidebarContextProps = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  leftOpen: boolean;
  setLeftOpen: (open: boolean) => void;
  rightOpen: boolean;
  setRightOpen: (open: boolean) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar(side?: 'left' | 'right') {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }

  if (side === 'left') {
    return {
      ...context,
      open: context.leftOpen,
      setOpen: context.setLeftOpen,
      toggleSidebar: context.toggleLeftSidebar,
      state: context.leftOpen ? 'expanded' : 'collapsed',
    };
  } else if (side === 'right') {
    return {
      ...context,
      open: context.rightOpen,
      setOpen: context.setRightOpen,
      toggleSidebar: context.toggleRightSidebar,
      state: context.rightOpen ? 'expanded' : 'collapsed',
    };
  }

  return context;
}

export { SidebarContext, useSidebar };

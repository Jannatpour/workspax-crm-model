// // src/hooks/use-sidebar.tsx

// import { create } from "zustand";
// import { persist } from "zustand/middleware";

// interface SidebarState {
//   collapsed: boolean;
//   toggleCollapsed: () => void;
//   setCollapsed: (collapsed: boolean) => void;
// }

// export const useSidebarStore = create<SidebarState>()(
//   persist(
//     (set) => ({
//       collapsed: false,
//       toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
//       setCollapsed: (collapsed: boolean) => set({ collapsed }),
//     }),
//     {
//       name: "sidebar-state",
//     }
//   )
// );

'use client';

import { create } from 'zustand';

interface SidebarStore {
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>(set => ({
  collapsed: false,
  toggleCollapsed: () => set(state => ({ collapsed: !state.collapsed })),
  setCollapsed: collapsed => set({ collapsed }),
}));

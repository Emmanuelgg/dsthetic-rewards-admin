"use client"

import { createContext, useContext, useState } from "react"
import { Sidebar } from "./Sidebar"

export const SidebarCtx = createContext<{ open: boolean; toggle: () => void }>({
  open: false, toggle: () => {},
})

export function useSidebar() {
  return useContext(SidebarCtx)
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen((v) => !v)

  return (
    <SidebarCtx.Provider value={{ open, toggle }}>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <div
          className={`sidebar-backdrop${open ? " open" : ""}`}
          onClick={toggle}
        />
        <Sidebar />
        <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minWidth: 0 }}>
          {children}
        </main>
      </div>
    </SidebarCtx.Provider>
  )
}

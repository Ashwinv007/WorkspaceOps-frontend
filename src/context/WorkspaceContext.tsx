"use client"

import { createContext, useContext, ReactNode } from "react"
import type { WorkspaceRole } from "@/lib/types/api"

interface WorkspaceContextValue {
  userRole: WorkspaceRole | null
}

const WorkspaceContext = createContext<WorkspaceContextValue>({ userRole: null })

export function WorkspaceProvider({
  children,
  userRole,
}: {
  children: ReactNode
  userRole: WorkspaceRole | null
}) {
  return (
    <WorkspaceContext.Provider value={{ userRole }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspaceContext() {
  return useContext(WorkspaceContext)
}

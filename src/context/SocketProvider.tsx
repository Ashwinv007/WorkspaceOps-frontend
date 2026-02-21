"use client"

import { useEffect, ReactNode } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getSocket, disconnectSocket } from "@/lib/socket/socketClient"

interface SocketProviderProps {
  workspaceId: string
  children: ReactNode
}

export function SocketProvider({ workspaceId, children }: SocketProviderProps) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const socket = getSocket()

    socket.emit("join-workspace", workspaceId)

    socket.on("work-item:status-changed", () => {
      queryClient.invalidateQueries({ queryKey: ["work-items", workspaceId] })
    })

    socket.on("work-item:document-linked", (data: { targetId?: string }) => {
      if (data?.targetId) {
        queryClient.invalidateQueries({ queryKey: ["work-item", workspaceId, data.targetId] })
      }
    })

    socket.on("work-item:document-unlinked", (data: { targetId?: string }) => {
      if (data?.targetId) {
        queryClient.invalidateQueries({ queryKey: ["work-item", workspaceId, data.targetId] })
      }
    })

    socket.on("document:uploaded", () => {
      queryClient.invalidateQueries({ queryKey: ["documents", workspaceId] })
    })

    socket.on("document:deleted", () => {
      queryClient.invalidateQueries({ queryKey: ["documents", workspaceId] })
    })

    socket.on("workspace:member-invited", () => {
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] })
    })

    socket.on("workspace:member-updated", () => {
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] })
    })

    socket.on("workspace:member-removed", () => {
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] })
      queryClient.invalidateQueries({ queryKey: ["workspaces"] })
    })

    return () => {
      socket.emit("leave-workspace", workspaceId)
      socket.off("work-item:status-changed")
      socket.off("work-item:document-linked")
      socket.off("work-item:document-unlinked")
      socket.off("document:uploaded")
      socket.off("document:deleted")
      socket.off("workspace:member-invited")
      socket.off("workspace:member-updated")
      socket.off("workspace:member-removed")
    }
  }, [workspaceId, queryClient])

  return <>{children}</>
}

"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, ReactNode } from "react"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/context/AuthContext"
import { TooltipProvider } from "@/components/ui/tooltip"

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {children}
          <Toaster position="top-right" />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

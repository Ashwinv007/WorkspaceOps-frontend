"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface AuthUser {
  userId: string
}

interface AuthContextValue {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("workspaceops_token")
    const userId = localStorage.getItem("workspaceops_userId")
    if (token && userId) {
      setUser({ userId })
    }
  }, [])

  function logout() {
    localStorage.removeItem("workspaceops_token")
    localStorage.removeItem("workspaceops_userId")
    setUser(null)
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}

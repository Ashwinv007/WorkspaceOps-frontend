import api from "./client"
import type { LoginResponse, SignupResponse } from "@/lib/types/api"

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", { email, password })
  return res.data
}

export async function signup(
  email: string,
  password: string,
  name?: string
): Promise<SignupResponse> {
  const res = await api.post<SignupResponse>("/auth/signup", { email, password, name })
  return res.data
}

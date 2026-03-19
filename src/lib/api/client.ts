import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
})

// Add Authorization header to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("workspaceops_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Catch 401 → clear token → redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("workspaceops_token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export default api

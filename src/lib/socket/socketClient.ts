import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    const token = localStorage.getItem("workspaceops_token")
    socket = io("http://localhost:4000", {
      auth: { token },
      transports: ["websocket"],
    })
  }
  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

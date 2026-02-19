import { io } from "socket.io-client"

let socket

export const connectSocket = () => {
  socket = io("http://localhost:5000") // backend URL
  return socket
}

export const getSocket = () => socket

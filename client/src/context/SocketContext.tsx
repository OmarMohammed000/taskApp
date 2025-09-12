import React ,{createContext,useContext,useEffect,useState} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}
const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { getAccessToken,isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const token = getAccessToken();
      const newSocket = io('http://localhost:4000', {
        auth:{ token },
        withCredentials: true,
      });
      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log("Socket connected");
      })
      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log("Socket disconnected" );
      })
      setSocket(newSocket);
      return () => { newSocket.close(); }
    }
  }, [isAuthenticated, getAccessToken]);
  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
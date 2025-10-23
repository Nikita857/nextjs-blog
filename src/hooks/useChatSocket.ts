import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

export const useChatSocket = () => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (session?.accessToken) {
      const newSocket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3001", {
        auth: {
          token: session.accessToken,
        },
      });

      newSocket.on("connect", () => {
        console.log("Connected to WebSocket server");
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from WebSocket server");
      });

      newSocket.on("error", (message: string) => {
        console.error("WebSocket error:", message);
      });
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [session?.accessToken]);

  return socket;
};

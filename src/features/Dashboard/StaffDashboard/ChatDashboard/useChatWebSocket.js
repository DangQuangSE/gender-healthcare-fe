import { useContext } from "react";
import ChatWebSocketContext from "./ChatWebSocketContext";

export const useChatWebSocket = () => {
  const context = useContext(ChatWebSocketContext);
  if (!context) {
    throw new Error(
      "useChatWebSocket must be used within ChatWebSocketProvider"
    );
  }
  return context;
};

export default useChatWebSocket;

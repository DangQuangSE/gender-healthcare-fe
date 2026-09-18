import { createContext } from "react";

const ChatWebSocketContext = createContext({
  connected: false,
  connecting: false,
  connect: () => {},
  disconnect: () => {},
  service: null,
});

export default ChatWebSocketContext;

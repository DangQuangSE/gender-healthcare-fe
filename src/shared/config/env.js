const defaultProtocol = "http";
const defaultHost = "localhost";
const defaultPort = "8080";

const env = import.meta.env || {};

export const SERVER_CONFIG = {
  IP: env.VITE_API_HOST || defaultHost,
  PORT: env.VITE_API_PORT || defaultPort,
  PROTOCOL: env.VITE_API_PROTOCOL || defaultProtocol,
};

export const BASE_URL =
  env.VITE_BASE_URL ||
  `${SERVER_CONFIG.PROTOCOL}://${SERVER_CONFIG.IP}:${SERVER_CONFIG.PORT}`;

export const API_BASE_URL = env.VITE_API_BASE_URL || `${BASE_URL}/api`;
export const WEBSOCKET_URL = env.VITE_WEBSOCKET_URL || `${BASE_URL}/ws/chat`;
export const CLOUDINARY_UPLOAD_URL =
  env.VITE_CLOUDINARY_UPLOAD_URL ||
  "https://api.cloudinary.com/v1_1/dycwhc7sn/image/upload";

export const { IP, PORT, PROTOCOL } = SERVER_CONFIG;

export default {
  SERVER_CONFIG,
  BASE_URL,
  API_BASE_URL,
  WEBSOCKET_URL,
  CLOUDINARY_UPLOAD_URL,
  IP,
  PORT,
  PROTOCOL,
};

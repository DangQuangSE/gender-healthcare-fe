import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { WEBSOCKET_URL } from "../config/env";

/**
 * Shared STOMP/SockJS transport.
 * Feature code should own destinations and message meaning.
 */
class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.stompClient = null;
    this.connected = false;
    this.connecting = false;
    this.connectPromise = null;
    this.subscriptions = new Map();
  }

  connect() {
    if (this.connected) {
      return Promise.resolve();
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connecting = true;
    this.connectPromise = new Promise((resolve, reject) => {
      try {
        const socket = new SockJS(this.url);
        const stompClient = Stomp.over(socket);
        stompClient.debug = () => {};
        this.stompClient = stompClient;

        stompClient.connect(
          {},
          () => {
            this.connected = true;
            this.connecting = false;
            this.connectPromise = null;
            resolve();
          },
          (error) => {
            this.connected = false;
            this.connecting = false;
            this.connectPromise = null;
            reject(error);
          }
        );
      } catch (error) {
        this.connected = false;
        this.connecting = false;
        this.connectPromise = null;
        reject(error);
      }
    });

    return this.connectPromise;
  }

  disconnect() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions.clear();

    if (this.stompClient) {
      this.stompClient.disconnect();
    }

    this.stompClient = null;
    this.connected = false;
    this.connecting = false;
    this.connectPromise = null;
  }

  subscribe(destination, callback) {
    if (!this.connected || !this.stompClient) {
      return null;
    }

    const subscription = this.stompClient.subscribe(destination, (message) => {
      let payload = message.body;

      try {
        payload = JSON.parse(message.body);
      } catch {
        // Keep non-JSON messages as strings for compatibility.
      }

      callback?.(payload);
    });

    this.subscriptions.set(destination, subscription);
    return subscription;
  }

  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (!subscription) {
      return;
    }

    subscription.unsubscribe();
    this.subscriptions.delete(destination);
  }

  send(destination, payload) {
    if (!this.connected || !this.stompClient) {
      return false;
    }

    this.stompClient.send(destination, {}, JSON.stringify(payload));
    return true;
  }

  isConnected() {
    return this.connected;
  }

  isConnecting() {
    return this.connecting;
  }
}

export const createWebSocketClient = (url = WEBSOCKET_URL) =>
  new WebSocketClient(url);

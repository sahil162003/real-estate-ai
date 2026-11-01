
import { Client } from "@stomp/stompjs";

const WS_URL = "http://localhost:8083/ws-notifications";

export function connectNotificationWebSocket(email, onNotification) {
  if (!email) {
    throw new Error("User email is required for notifications");
  }

  
const token =
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  sessionStorage.getItem("token") ||
  sessionStorage.getItem("authToken");

if (!token) {
  throw new Error("JWT token is missing");
}

const client = new Client({
  brokerURL: WS_URL.replace(/^http/, "ws"),

  connectHeaders: {
    Authorization: `Bearer ${token}`,
  },

  reconnectDelay: 5000,


    onConnect: () => {
      client.subscribe(
        `/topic/notifications/${email.toLowerCase()}`,
        (message) => {
          try {
            const notification = JSON.parse(message.body);
            onNotification(notification);
          } catch (error) {
            console.error("Invalid notification message:", error);
          }
        }
      );
    },

    onStompError: (frame) => {
      console.error("WebSocket STOMP error:", frame.headers.message);
    },

    onWebSocketError: (event) => {
      console.error("Notification WebSocket error:", event);
    },
  });

  client.activate();

  return () => {
    client.deactivate();
  };
}

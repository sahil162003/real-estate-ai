
import { Client } from "@stomp/stompjs";

const WS_URL =
  import.meta.env.VITE_NOTIFICATION_WS_URL ||
  "wss://realestate-notification-service.onrender.com/ws-notifications";

export function connectNotificationWebSocket(email, onNotification) {
  if (!email) {
    throw new Error("User email is required for notifications");
  }

  const token =
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  if (!token) {
    throw new Error("JWT token is missing");
  }

  const client = new Client({
    brokerURL: WS_URL,

    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },

    reconnectDelay: 5000,

    onConnect: () => {
      console.log("Notification WebSocket connected");

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

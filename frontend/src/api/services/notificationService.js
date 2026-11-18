
const NOTIFICATION_API = "/notification-api";


const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  sessionStorage.getItem("token") ||
  sessionStorage.getItem("authToken");


const getHeaders = () => {
  const token = getToken();

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
};

async function handleResponse(response) {
  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "Session expired. Please sign in again."
        : `Notification request failed (${response.status}).`
    );
  }

  return response.json();
}

export async function getMyNotifications() {
  const response = await fetch(`${NOTIFICATION_API}/all`, {
    headers: getHeaders()
  });

  return handleResponse(response);
}

export async function getMyUnreadCount() {
  const response = await fetch(
    `${NOTIFICATION_API}/unread-count`,
    { headers: getHeaders() }
  );

  return handleResponse(response);
}

export async function markNotificationAsRead(id) {
  const response = await fetch(`${NOTIFICATION_API}/${id}/read`, {
    method: "PUT",
    headers: getHeaders(),
  });

  return handleResponse(response);
}

export function checkNotificationToken() {
  const token = getToken();

  console.log("Notification JWT available:", Boolean(token));
  console.log("Notification JWT length:", token?.length ?? 0);
}

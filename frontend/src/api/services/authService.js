import apiClient from "../client";

const authService = {
  login: async (credentials) => {
    const response = await apiClient.post(
      "/api/users/login",
      credentials
    );

    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post(
      "/api/users/register",
      userData
    );

    return response.data;
  },
};

export default authService;
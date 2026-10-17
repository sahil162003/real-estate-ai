import api from "../client";

const getMyProfile = async () => {
  const response = await api.get("/api/users/me");
  return response.data;
};

const updateMyProfile = async (profileData) => {
  const response = await api.put("/api/users/me", profileData);
  return response.data;
};

const userService = {
  getMyProfile,
  updateMyProfile,
};

export default userService;
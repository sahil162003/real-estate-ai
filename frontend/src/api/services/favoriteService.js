
import api from "../client";

const getFavorites = async () => {
  const response = await api.get("/api/customer/favorites");
  return response.data;
};

const addFavorite = async (propertyId) => {
  const response = await api.post(
    `/api/customer/favorites/${propertyId}`
  );
  return response.data;
};

const removeFavorite = async (propertyId) => {
  const response = await api.delete(
    `/api/customer/favorites/${propertyId}`
  );
  return response.data;
};

const favoriteService = {
  getFavorites,
  addFavorite,
  removeFavorite,
};

export default favoriteService;

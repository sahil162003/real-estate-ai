
import api from "../client";

const searchProperties = async (filters = {}) => {
  const params = {};

  if (filters.location?.trim()) {
    params.location = filters.location.trim();
  }

  if (filters.bedroom !== "" && filters.bedroom != null) {
    params.bedroom = filters.bedroom;
  }

  if (filters.minPrice !== "" && filters.minPrice != null) {
    params.minPrice = filters.minPrice;
  }

  if (filters.maxPrice !== "" && filters.maxPrice != null) {
    params.maxPrice = filters.maxPrice;
  }

  params.sortBy = filters.sortBy || "createdAt";
  params.sortOrder = filters.sortOrder || "asc";
  params.page = filters.page ?? 0;

  const response = await api.get("/api/customer/search", { params });
  return response.data;
};

const getAllProperties = async () => {
  const response = await api.get("/api/properties/getAllProperties");
  return response.data;
};

const getPropertyById = async (id) => {
  const response = await api.get(`/api/properties/getProperties/${id}`);
  return response.data;
};

// Fetch properties owned by the logged-in agent.
const getMyProperties = async () => {
  const response = await api.get("/api/agent/getproperties");
  return response.data;
};

// Fetch images for a property.
const getPropertyImages = async (propertyId) => {
  const response = await api.get(
    `/api/customer/property/${propertyId}/images`
  );
  return response.data;
};


const uploadPropertyImage = async (propertyId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    `/api/properties/${propertyId}/images`,
    formData,
    {
      headers: {
        "Content-Type": undefined,
      },
    }
  );

  return response.data;
};


// Delete an image by its image ID.
const deletePropertyImage = async (imageId) => {
  const response = await api.delete(
    `/api/properties/images/${imageId}`
  );

  return response.data;
};

export default {
  searchProperties,
  getAllProperties,
  getPropertyById,
  getMyProperties,
  getPropertyImages,
  uploadPropertyImage,
  deletePropertyImage,
};

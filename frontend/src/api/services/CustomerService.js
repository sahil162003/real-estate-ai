import apiClient from "../client";

const customerService = {
  searchProperties: async ({
    location,
    bedroom,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    sortOrder = "asc",
    page = 0,
  } = {}) => {
    const response = await apiClient.get("/api/customer/search", {
      params: {
        location,
        bedroom,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
        page,
      },
    });

    return response.data;
  },
};

export default customerService;
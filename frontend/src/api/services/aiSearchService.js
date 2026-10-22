
import client from "../client";

const aiSearchService = {
  searchProperties(prompt) {
    return client.post("/api/ai/search-properties", { prompt });
  },
};

export default aiSearchService;

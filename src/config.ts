const API_BASE_URL = 'https://eliftechflower-delivery-public-backend-production.up.railway.app';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    // Add your API endpoints here as you create them
    // Example:
    // products: `${API_BASE_URL}/products`,
  },
  headers: {
    'Content-Type': 'application/json',
  },
};

export default apiConfig;

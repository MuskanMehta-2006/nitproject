// src/api.js
export const BASE_URL = "https://nitproject-backend.onrender.com";

export const fetchAPI = async (path, options = {}) => {
  try {
    const res = await fetch(`${BASE_URL}${path}`, options);
    return await res.json();
  } catch (err) {
    console.error("API Error:", err);
    return null;
  }
};
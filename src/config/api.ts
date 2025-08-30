// src/config/api.ts
const API_BASE =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : "https://athipan01-painaidee_backend.hf.space/api";

export default API_BASE;

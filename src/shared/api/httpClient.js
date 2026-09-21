import axios from "axios";
import { API_BASE_URL } from "../config/env";
import authStorage from "../storage/authStorage";
import { normalizeApiResponse } from "./response";

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => {
    response.apiResponse = normalizeApiResponse(response.data);
    response.data = response.apiResponse.data;
    return response;
  },
  (error) => Promise.reject(error)
);

export default httpClient;

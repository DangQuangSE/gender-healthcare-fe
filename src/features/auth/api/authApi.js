import apiClient from "../../../shared/api/client";

export const login = (credentials) =>
  apiClient.post("/v1/auth/login", credentials);

export const loginWithGoogle = (accessToken) =>
  apiClient.post("/v1/auth/oauth/google", { accessToken });

export const requestRegistrationOtp = (email) =>
  apiClient.post("/v1/auth/registration/otp", { email });

export const verifyRegistrationOtp = (email, otp) =>
  apiClient.post("/v1/auth/registration/verify-otp", { email, otp });

export const configurePassword = (payload) =>
  apiClient.post("/v1/auth/registration/password", payload);

export const requestForgotPasswordOtp = (email) =>
  apiClient.post("/v1/auth/forgot-password/otp", { email });

export const verifyForgotPasswordOtp = (email, otp) =>
  apiClient.post("/v1/auth/forgot-password/verify-otp", { email, otp });

export const resetPassword = (payload) =>
  apiClient.put("/v1/auth/forgot-password/password", payload);

import api from "../../../shared/api/client";

export const login = (credentials) => api.post("/auth/login", credentials);

export const loginWithGoogle = (accessToken) =>
  api.post("/auth/google", { accessToken });

export const requestRegistrationOtp = (email) =>
  api.post("/auth/request-OTP", { email });

export const verifyRegistrationOtp = (email, otp) =>
  api.post("/auth/verify-Otp", { email, otp });

export const configurePassword = (payload) =>
  api.post("/auth/config-password", payload);

export const requestForgotPasswordOtp = (email) =>
  api.post("/auth/forgot-password/request-otp", { email });

export const verifyForgotPasswordOtp = (email, otp) =>
  api.post("/auth/forgot-password/verify-otp", { email, otp });

export const resetPassword = (payload) =>
  api.post("/auth/forgot-password/resetPass", payload);

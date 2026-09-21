import { createSlice } from "@reduxjs/toolkit";
import { DEFAULT_USER } from "./userSlice.constants";

const initialState = {
  user: DEFAULT_USER,
  token: "",
};

const normalizeUser = (payload) => {
  const response = payload?.data || payload;
  const source = response?.user || response;

  if (!source || typeof source !== "object") {
    return null;
  }

  return {
    fullname: source.fullname || source.name || "",
    email: source.email || "",
    role: source.role || "",
    imageUrl: source.imageUrl || "",
  };
};

const getToken = (payload) => {
  const response = payload?.data || payload;
  return response?.jwt || response?.accessToken || response?.token || "";
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      const user = normalizeUser(action.payload);
      const token = getToken(action.payload);

      if (user) {
        state.user = user;
      }
      if (token) {
        state.token = token;
      }
    },
    updateUserAvatar: (state, action) => {
      if (action.payload?.imageUrl) {
        state.user.imageUrl = action.payload.imageUrl;
      }
    },
    logout: () => initialState,
  },
});

export const { login, logout, updateUserAvatar } = userSlice.actions;
export default userSlice.reducer;

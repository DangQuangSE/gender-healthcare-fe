import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../shared/api/httpClient";

const DEFAULT_USER = {
  fullname: "",
  email: "",
  role: "",
  imageUrl: "",
};

const initialState = {
  user: DEFAULT_USER,
  token: "",
};

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  "Có lỗi xảy ra";

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

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.put("/users/profile", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const changePassword = createAsyncThunk(
  "user/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await api.put("/users/password", passwordData);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateAvatar = createAsyncThunk(
  "user/updateAvatar",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateSettings = createAsyncThunk(
  "user/updateSettings",
  async (settings, { rejectWithValue }) => {
    try {
      const response = await api.put("/users/settings", settings);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

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

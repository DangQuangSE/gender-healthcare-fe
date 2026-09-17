import storage from "./storage";
import { STORAGE_KEYS } from "../constants/storageKeys";

const authStorage = {
  getToken() {
    return storage.get(STORAGE_KEYS.TOKEN);
  },

  getUser() {
    return storage.getJson(STORAGE_KEYS.USER);
  },

  saveSession(token, user) {
    if (token) {
      storage.set(STORAGE_KEYS.TOKEN, token);
    }

    if (user) {
      storage.setJson(STORAGE_KEYS.USER, user);
    }
  },

  clearSession() {
    storage.remove(STORAGE_KEYS.TOKEN);
    storage.remove(STORAGE_KEYS.USER);
  },
};

export default authStorage;

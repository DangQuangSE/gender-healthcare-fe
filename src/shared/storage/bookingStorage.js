import storage from "./storage";
import { STORAGE_KEYS } from "../constants/storageKeys";

const bookingStorage = {
  getPendingBooking() {
    return (
      storage.getJson(STORAGE_KEYS.PENDING_BOOKING) ||
      storage.getJson(STORAGE_KEYS.LEGACY_PENDING_BOOKING)
    );
  },

  setPendingBooking(booking) {
    storage.setJson(STORAGE_KEYS.PENDING_BOOKING, booking);
  },

  removePendingBooking() {
    storage.remove(STORAGE_KEYS.PENDING_BOOKING);
    storage.remove(STORAGE_KEYS.LEGACY_PENDING_BOOKING);
  },

  get(key) {
    return storage.get(key);
  },

  set(key, value) {
    storage.set(key, value);
  },

  remove(key) {
    storage.remove(key);
  },
};

export default bookingStorage;
